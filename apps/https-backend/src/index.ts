import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware.js';
import {CreateUserSchema,SigninSchema,CreateRoomsSchema} from '@repo/common/types'
import { prismaClient } from '@repo/db/client';
import bcrypt from 'bcryptjs';
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors())
const PORT = process.env.PORT || 3002;

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", port: PORT, env: process.env.NODE_ENV });
});

app.post("/signup", async(req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
     res.json({
        messages:"Incorrect inputs"
    })
    return;
  }
  try{
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data?.username,
        password: hashedPassword,
        name: parsedData.data.name
      }
    });
    res.json({
      userId: user.id
    })
  }catch(e){
    res.status(411).json({
      message:"User already exists with this username"
    })
  }
});

app.post("/signin", async(req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
     res.json({
        messages:"Incorrect inputs"
    })
    return;
  }
  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username
    }
  });
  if (!user) {
    res.status(403).json({
      message: "Not authorized"
    });
    return;
  }
  const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
  if (!isPasswordValid) {
    res.status(403).json({
      message: "Not authorized"
    });
    return;
  }
  const token = jwt.sign({
    userId: user.id
  }, JWT_SECRET);
  res.json({ token });
});

app.post("/room", middleware, async(req, res) => {
  const parsedData = CreateRoomsSchema.safeParse(req.body);
  if (!parsedData.success) {
     res.json({
        messages:"Incorrect inputs"
    })
    return;
  } 
  try{
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId
      }
    });
    res.json({ roomId: room.id, slug: room.slug });
  }catch(e){
    res.status(411).json({
      message:"Room already exists with this name"
    });
  }
});

// Get all rooms for the current user
app.get("/rooms", middleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const rooms = await prismaClient.room.findMany({
      where: {
        adminId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json({ rooms });
  } catch (e) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Get current user info
app.get("/me", middleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, photo: true }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Get shapes for a room
app.get("/shapes/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;
    let numericRoomId: number | null = null;
    
    // First try to find by slug
    const roomBySlug = await prismaClient.room.findFirst({ where: { slug: roomId } });
    if (roomBySlug) {
      numericRoomId = roomBySlug.id;
    } else if (!isNaN(Number(roomId))) {
      // Then try as numeric ID
      const roomById = await prismaClient.room.findFirst({ where: { id: Number(roomId) } });
      if (roomById) {
        numericRoomId = roomById.id;
      }
    }
    
    if (!numericRoomId) {
      return res.status(404).json({ message: "Room not found" });
    }

    const shapes = await prismaClient.shape.findMany({
      where: { roomId: numericRoomId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    
    res.json({ 
      shapes: shapes.map(s => {
        const parsed = JSON.parse(s.shapeData);
        return {
          ...parsed,
          // Use existing shapeId or generate one from database id for legacy shapes
          shapeId: parsed.shapeId || `db-${s.id}`,
          id: s.id,
          userId: s.userId,
          userName: s.user.name
        };
      })
    });
  } catch (e) {
    console.error("Error fetching shapes:", e);
    res.status(500).json({ message: "Error fetching shapes" });
  }
});

// Get chats for a room (for actual chat messages, not shapes)
app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;
    let numericRoomId: number | null = null;
    
    // First try to find by slug
    const roomBySlug = await prismaClient.room.findFirst({ where: { slug: String(roomId) } });
    if (roomBySlug) {
      numericRoomId = roomBySlug.id;
    } else if (!isNaN(Number(roomId))) {
      // Then try as numeric ID
      const roomById = await prismaClient.room.findFirst({ where: { id: Number(roomId) } });
      if (roomById) {
        numericRoomId = roomById.id;
      }
    }
    
    if (!numericRoomId) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await prismaClient.chat.findMany({
      where: { roomId: numericRoomId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    
    // Filter out shape messages (messages that look like JSON with shape data)
    const chatMessages = messages.filter(m => {
      try {
        const parsed = JSON.parse(m.message);
        // If it's a shape message, filter it out
        if (parsed.shape) return false;
        return true;
      } catch {
        // Not JSON, so it's a real chat message
        return true;
      }
    });
    
    res.json({ 
      messages: chatMessages.map(m => ({
        id: m.id,
        message: m.message,
        userId: m.userId,
        userName: m.user.name,
        createdAt: m.createdAt
      }))
    });
  } catch (e) {
    console.error("Error fetching chats:", e);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Get room by slug
app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: { slug }
  });
  res.json({ room });
});

// Delete all shapes in a room (clear canvas)
app.delete("/shapes/:roomId", middleware, async (req, res) => {
  try {
    const userId = req.userId;
    const roomId = req.params.roomId;
    
    let numericRoomId: number | null = null;
    
    // First try to find by slug
    const roomBySlug = await prismaClient.room.findFirst({ where: { slug: roomId } });
    if (roomBySlug) {
      numericRoomId = roomBySlug.id;
    } else if (!isNaN(Number(roomId))) {
      // Then try as numeric ID
      const roomById = await prismaClient.room.findFirst({ where: { id: Number(roomId) } });
      if (roomById) {
        numericRoomId = roomById.id;
      }
    }
    
    if (!numericRoomId) {
      return res.status(404).json({ message: "Room not found" });
    }

    await prismaClient.shape.deleteMany({
      where: { roomId: numericRoomId }
    });
    
    res.json({ success: true });
  } catch (e) {
    console.error("Error clearing shapes:", e);
    res.status(500).json({ message: "Error clearing canvas" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${PORT}`);
});