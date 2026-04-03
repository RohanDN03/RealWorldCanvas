import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { createClient, RedisClientType } from "redis";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 8080;



const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const ROOM_USER_TTL_SECONDS = Number(process.env.ROOM_USER_TTL_SECONDS) || 86400; // 24 h

// ─── Redis clients ────────────────────────────────────────────────────────────

const pubClient: RedisClientType = createClient({ url: REDIS_URL });
const subClient: RedisClientType = createClient({ url: REDIS_URL });

pubClient.on('error', (err: any) => console.error('Redis pubClient error:', err));
subClient.on('error', (err: any) => console.error('Redis subClient error:', err));

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  userName: string;
}

// ─── In-memory registry (local instance only) ─────────────────────────────────

const users: User[] = [];

// ─── Auth ─────────────────────────────────────────────────────────────────────

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string' || !decoded.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

// ─── Room helpers ─────────────────────────────────────────────────────────────

async function getNumericRoomId(roomId: string): Promise<number | null> {
  const bySlug = await prismaClient.room.findFirst({ where: { slug: roomId } });
  if (bySlug) return bySlug.id;

  if (!isNaN(Number(roomId))) {
    const byId = await prismaClient.room.findFirst({ where: { id: Number(roomId) } });
    if (byId) return byId.id;
  }
  return null;
}

async function findOrCreateRoom(roomId: string, userId: string): Promise<number | null> {
  const existing = await getNumericRoomId(roomId);
  if (existing) return existing;
  try {
    const room = await prismaClient.room.create({ data: { slug: roomId, adminId: userId } });
    return room.id;
  } catch (e) {
    console.error(`Failed to create room '${roomId}':`, e);
    return null;
  }
}

// ─── Redis pub/sub helpers ────────────────────────────────────────────────────

const ROOM_CHANNEL = (roomId: string) => `room:${roomId}`;
const ROOM_USERS_KEY = (roomId: string) => `room:${roomId}:users`;

async function publishToRoom(roomId: string, payload: object): Promise<void> {
  await pubClient.publish(ROOM_CHANNEL(roomId), JSON.stringify(payload));
}

async function addUserToRoom(roomId: string, userId: string, userName: string): Promise<void> {
  const key = ROOM_USERS_KEY(roomId);
  await pubClient.sAdd(key, JSON.stringify({ userId, userName }));
  await pubClient.expire(key, ROOM_USER_TTL_SECONDS);
}

async function removeUserFromRoom(roomId: string, userId: string, userName: string): Promise<void> {
  await pubClient.sRem(ROOM_USERS_KEY(roomId), JSON.stringify({ userId, userName }));
}

async function broadcastActiveUsers(roomId: string): Promise<void> {
  const raw = await pubClient.sMembers(ROOM_USERS_KEY(roomId));
  const activeUsers = raw.map((r: string) => JSON.parse(r) as { userId: string; userName: string });

  const message = JSON.stringify({ type: 'active_users', users: activeUsers, roomId });
  users
    .filter(u => u.rooms.includes(roomId))
    .forEach(u => u.ws.send(message));
}

async function init() {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log('Redis connected');

// ─── Global Redis subscription (single fan-out per instance) ──────────────────
//
// All published messages flow through one pSubscribe so we avoid creating a new
// subscription per room.  The _senderId / _skipSender fields let us filter out
// echo for the originating user without an additional DB round-trip.

  subClient.pSubscribe('room:*', (message: any, channel: any) => {
  // channel looks like "room:<roomId>"
  const roomId = channel.slice('room:'.length);
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(message);
  } catch {
    return;
  }

  users
    .filter(u => u.rooms.includes(roomId))
    .forEach(u => {
      if (payload._skipSender && payload._senderId === u.userId) return;
      u.ws.send(message);
    });
});

// ─── WebSocket server ─────────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket Server started on port ${PORT}`);

wss.on('connection', function connection(ws, request) {
  // ── Token check ───────────────────────────────────────────────────────────
  const url = request.url;
  if (!url) { ws.close(4001, 'Missing URL'); return; }

  const token = new URLSearchParams(url.split('?')[1]).get('token') ?? '';
  const userId = checkUser(token);
  if (!userId) {
    console.error('WebSocket connection rejected: invalid token.');
    ws.close(4001, 'Invalid or missing token');
    return;
  }

  // ── Remove any stale local connection for this userId ─────────────────────
  const staleIndex = users.findIndex(u => u.userId === userId);
  if (staleIndex !== -1) {
    const stale = users[staleIndex];
    if (stale?.ws.readyState === WebSocket.OPEN) {
      stale.ws.close(1000, 'New connection established');
    }
    users.splice(staleIndex, 1);
  }

  // ── Register user locally ─────────────────────────────────────────────────
  const newUser: User = { userId, userName: 'Anonymous', rooms: [], ws };
  users.push(newUser);
  console.log(`User connected: ${userId}. Total local users: ${users.length}`);

  // ── Message handler (set up synchronously so no messages are missed) ──────
  ws.on('message', async function onMessage(data) {
    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(typeof data !== 'string' ? data.toString() : data);
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    const user = users.find(u => u.ws === ws);
    console.log(`Message received: ${parsedData.type}`);

    // ── join_room ────────────────────────────────────────────────────────────
    if (parsedData.type === 'join_room') {
      if (!user) return;
      const roomId = parsedData.roomId as string;

      const numericRoomId = await findOrCreateRoom(roomId, user.userId);
      if (!numericRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: `Could not find or create room: ${roomId}` }));
        return;
      }

      if (!user.rooms.includes(roomId)) user.rooms.push(roomId);

      await addUserToRoom(roomId, user.userId, user.userName);
      await broadcastActiveUsers(roomId);
      console.log(`User ${user.userName} joined room ${roomId}`);
    }

    // ── leave_room ───────────────────────────────────────────────────────────
    if (parsedData.type === 'leave_room') {
      if (!user) return;
      const roomId = parsedData.roomId as string;

      user.rooms = user.rooms.filter(r => r !== roomId);
      await removeUserFromRoom(roomId, user.userId, user.userName);
      await broadcastActiveUsers(roomId);
      console.log(`User ${user.userName} left room ${roomId}`);
    }

    // ── shape ────────────────────────────────────────────────────────────────
    if (parsedData.type === 'shape') {
      if (!user) return;
      const { roomId, shapeData } = parsedData as { roomId: string; shapeData: unknown };

      const numericRoomId = await getNumericRoomId(roomId);
      if (!numericRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }

      try {
        await prismaClient.shape.create({
          data: { roomId: numericRoomId, shapeData: JSON.stringify(shapeData), userId: user.userId },
        });
      } catch (e) { console.error('Error saving shape:', e); }

      await publishToRoom(roomId, {
        type: 'shape', shapeData, roomId,
        userId: user.userId, userName: user.userName,
        _senderId: user.userId, _skipSender: true,
      });
    }

    // ── zoom ─────────────────────────────────────────────────────────────────
    if (parsedData.type === 'zoom') {
      if (!user) return;
      const { roomId, zoomLevel } = parsedData as { roomId: string; zoomLevel: number };

      await publishToRoom(roomId, {
        type: 'zoom', zoomLevel, roomId,
        userId: user.userId, userName: user.userName,
        _senderId: user.userId, _skipSender: true,
      });
    }

    // ── chat ─────────────────────────────────────────────────────────────────
    if (parsedData.type === 'chat') {
      if (!user) return;
      const { roomId, message } = parsedData as { roomId: string; message: string };

      const numericRoomId = await getNumericRoomId(roomId);
      if (!numericRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }

      try {
        await prismaClient.chat.create({
          data: { roomId: numericRoomId, message, userId: user.userId },
        });
      } catch (e) { console.error('Error saving chat:', e); }

      // Chat is broadcast to ALL users including the sender
      await publishToRoom(roomId, {
        type: 'chat', message, roomId,
        userId: user.userId, userName: user.userName,
        timestamp: new Date().toISOString(),
      });
    }

    // ── erase_shape ──────────────────────────────────────────────────────────
    if (parsedData.type === 'erase_shape') {
      const { roomId, shapeId } = parsedData as { roomId: string; shapeId: string };

      await publishToRoom(roomId, {
        type: 'erase_shape', shapeId, roomId,
        _senderId: userId, _skipSender: true,
      });
    }

    // ── clear_canvas ─────────────────────────────────────────────────────────
    if (parsedData.type === 'clear_canvas') {
      const { roomId } = parsedData as { roomId: string };

      const numericRoomId = await getNumericRoomId(roomId);
      if (numericRoomId) {
        try {
          await prismaClient.shape.deleteMany({ where: { roomId: numericRoomId } });
          console.log(`Cleared all shapes for room ${roomId}`);
        } catch (e) { console.error('Error clearing shapes:', e); }
      }

      await publishToRoom(roomId, {
        type: 'clear_canvas', roomId,
        _senderId: userId, _skipSender: true,
      });
    }
  });

  // ── Disconnect handler ────────────────────────────────────────────────────
  ws.on('close', async () => {
    const userIndex = users.findIndex(u => u.ws === ws);
    if (userIndex === -1) return;

    const user = users[userIndex];
    if (!user) return;

    console.log(`User disconnected: ${user.userName} (${user.userId})`);
    const userRooms = [...user.rooms];
    users.splice(userIndex, 1);

    for (const roomId of userRooms) {
      await removeUserFromRoom(roomId, user.userId, user.userName);
      await broadcastActiveUsers(roomId);
    }
  });

  // ── Resolve username from DB async (non-blocking) ─────────────────────────
  prismaClient.user.findUnique({ where: { id: userId } })
    .then((dbUser: any)=> {
      if (dbUser) {
        newUser.userName = dbUser.name;
        console.log(`Username resolved: ${newUser.userName}`);
      }
    })
    .catch((e: any)=> console.error('Error fetching user:', e));
  });
}

init().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});