// import {WebSocket, WebSocketServer } from 'ws';
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from '@repo/backend-common/config';
// import { prismaClient } from '@repo/db/client';
// const wss = new WebSocketServer({ port: 8080 });

// interface User {
//   ws: WebSocket,
//   rooms: string[],
//   userId: string
// }

// const users: User[] = [];


// function checkUser(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     if (typeof decoded == "string") {
//       return null;
//     }

//     if (!decoded || !decoded.userId) {
//       return null;
//     }

//     return decoded.userId;
//   } catch(e) {
//     return null;
//   }
//   return null;
// }
// wss.on('connection', function connection(ws, request) {
//     const url = request.url;
//     if(!url){
//         return;
//     }
//     const queryParams = new URLSearchParams(url.split('?')[1]);
//     const token = queryParams.get('token') || "";
//     const userId = checkUser(token);
//     if (userId == null) {
//     ws.close()
//     return null;
//     }
//     users.push({
//       userId,
//       rooms: [],
//       ws
//     })

//  ws.on('message', async function message(data) {
//     let parsedData;
//     if (typeof data !== "string") {
//       parsedData = JSON.parse(data.toString());
//     } else {
//       parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
//     }

//     if (parsedData.type === "join_room") {
//       const user = users.find(x => x.ws === ws);
//       user?.rooms.push(parsedData.roomId);
//     }

//     if (parsedData.type === "leave_room") {
//       const user = users.find(x => x.ws === ws);
//       if (!user) {
//         return;
//       }
//       user.rooms = user?.rooms.filter(x => x === parsedData.room);
//     }

//     console.log("message received")
//     console.log(parsedData);

//     if (parsedData.type === "chat") {
//       const roomId = parsedData.roomId;
//       const message = parsedData.message;

//       await prismaClient.chat.create({
//         data: {
//           roomId: Number(roomId),
//           message,
//           userId
//         }
//       });

//       users.forEach(user => {
//         if (user.rooms.includes(roomId)) {
//           user.ws.send(JSON.stringify({
//             type: "chat",
//             message: message,
//             roomId
//           }))
//         }
//       })
//     }

//   });

// });


// import { WebSocket, WebSocketServer } from 'ws';
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from '@repo/backend-common/config';
// import { prismaClient } from "@repo/db/client";

// const wss = new WebSocketServer({ port: 8080 });

// interface User {
//   ws: WebSocket,
//   rooms: string[],
//   userId: string
// }

// const users: User[] = [];

// function checkUser(token: string): string | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     if (typeof decoded == "string") {
//       return null;
//     }

//     if (!decoded || !decoded.userId) {
//       return null;
//     }

//     return decoded.userId;
//   } catch(e) {
//     return null;
//   }
//   return null;
// }

// wss.on('connection', function connection(ws, request) {
//   const url = request.url;
//   if (!url) {
//     return;
//   }
//   const queryParams = new URLSearchParams(url.split('?')[1]);
//   const token = queryParams.get('token') || "";
//   const userId = checkUser(token);

//   if (userId == null) {
//     ws.close(4001, "Invalid or missing token")
//     return null;
//   }

//   users.push({
//     userId,
//     rooms: [],
//     ws
//   })

//   ws.on('message', async function message(data) {
//     let parsedData;
//     if (typeof data !== "string") {
//       parsedData = JSON.parse(data.toString());
//     } else {
//       parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
//     }

//     if (parsedData.type === "join_room") {
//       const user = users.find(x => x.ws === ws);
//       user?.rooms.push(parsedData.roomId);
//     }

//     if (parsedData.type === "leave_room") {
//       const user = users.find(x => x.ws === ws);
//       if (!user) {
//         return;
//       }
//       user.rooms = user?.rooms.filter(x => x === parsedData.room);
//     }

//     console.log("message received")
//     console.log(parsedData);

//     if (parsedData.type === "chat") {
//       const roomId = parsedData.roomId;
//       const message = parsedData.message;

//       await prismaClient.chat.create({
//         data: {
//           roomId: Number(roomId),
//           message,
//           userId
//         }
//       });

//       users.forEach(user => {
//         if (user.rooms.includes(roomId)) {
//           user.ws.send(JSON.stringify({
//             type: "chat",
//             message: message,
//             roomId
//           }))
//         }
//       })
//     }

//   });

// });









import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server started on port 8080");

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  userName?: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

// Get numeric room ID from slug or number
async function getNumericRoomId(roomId: string | number): Promise<number | null> {
  // First, try to find room by slug (roomId could be a slug like "my-room" or "118")
  const roomBySlug = await prismaClient.room.findFirst({ where: { slug: String(roomId) } });
  if (roomBySlug) {
    return roomBySlug.id;
  }
  
  // If not found by slug, try as numeric ID
  if (!isNaN(Number(roomId))) {
    const roomById = await prismaClient.room.findFirst({ where: { id: Number(roomId) } });
    if (roomById) {
      return roomById.id;
    }
  }
  
  return null;
}

// Get users in a specific room
function getUsersInRoom(roomId: string): { userId: string; userName?: string }[] {
  return users
    .filter(u => u.rooms.includes(roomId))
    .map(u => ({ userId: u.userId, userName: u.userName }));
}

// Broadcast active users to all users in a room
function broadcastActiveUsers(roomId: string) {
  const activeUsers = getUsersInRoom(roomId);
  const receivers = users.filter(u => u.rooms.includes(roomId));
  receivers.forEach(user => {
    user.ws.send(JSON.stringify({
      type: "active_users",
      users: activeUsers,
      roomId
    }));
  });
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close(4001, "Invalid or missing token");
    return;
  }

  // Remove any stale connections for this user (same userId but different ws)
  const existingUserIndex = users.findIndex(u => u.userId === userId);
  if (existingUserIndex !== -1) {
    const existingUser = users[existingUserIndex];
    // If the old connection is still open, close it
    if (existingUser && existingUser.ws.readyState === WebSocket.OPEN) {
      existingUser.ws.close(1000, "New connection established");
    }
    users.splice(existingUserIndex, 1);
  }

  // Add user to array IMMEDIATELY (before any async operations)
  // so that messages received during DB lookup can find the user
  const newUser = {
    userId,
    userName: "Anonymous",
    rooms: [] as string[],
    ws
  };
  users.push(newUser);
  console.log(`User connected: ${userId}. Total users: ${users.length}`);

  // CRITICAL: Set up message handler SYNCHRONOUSLY before any async operations
  // This ensures we don't miss the initial join_room message from the client
  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    console.log("Message received:", parsedData.type);

    // Handle joining a room
    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      console.log(`join_room request from ws, user found: ${user ? user.userName : 'NOT FOUND'}`);
      if (user) {
        const roomId = parsedData.roomId;
        if (!user.rooms.includes(roomId)) {
          user.rooms.push(roomId);
        }
        console.log(`User ${user.userName} joined room ${roomId}. User's rooms: ${user.rooms.join(', ')}`);
        
        // Broadcast updated active users to everyone in the room
        broadcastActiveUsers(roomId);
      }
    }

    // Handle leaving a room
    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) return;
      
      const roomId = parsedData.roomId;
      user.rooms = user.rooms.filter(x => x !== roomId);
      console.log(`User ${user.userName} left room ${roomId}`);
      
      // Broadcast updated active users
      broadcastActiveUsers(roomId);
    }

    // Handle shape drawing (real-time sync)
    if (parsedData.type === "shape") {
      const roomId = parsedData.roomId;
      const shapeData = parsedData.shapeData;
      const currentUser = users.find(u => u.ws === ws);

      const numericRoomId = await getNumericRoomId(roomId);
      if (!numericRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }

      // Save shape to database
      try {
        await prismaClient.shape.create({
          data: {
            roomId: numericRoomId,
            shapeData: JSON.stringify(shapeData),
            userId
          }
        });
      } catch (e) {
        console.error("Error saving shape:", e);
      }

      // Broadcast shape to all users in the room
      const receivers = users.filter(u => u.rooms.includes(roomId));
      receivers.forEach(user => {
        if (user.ws !== ws) { // Don't send back to sender
          user.ws.send(JSON.stringify({
            type: "shape",
            shapeData,
            roomId,
            userId,
            userName: currentUser?.userName || "Anonymous"
          }));
        }
      });
    }

    // Handle chat messages
    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const currentUser = users.find(u => u.ws === ws);

      const numericRoomId = await getNumericRoomId(roomId);
      if (!numericRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }

      // Save chat to database
      try {
        await prismaClient.chat.create({
          data: {
            roomId: numericRoomId,
            message,
            userId
          }
        });
      } catch (e) {
        console.error("Error saving chat:", e);
      }

      // Broadcast chat to all users in the room
      const receivers = users.filter(u => u.rooms.includes(roomId));
      console.log(`Broadcasting chat to room ${roomId}. Receivers: ${receivers.length}`);
      
      receivers.forEach(user => {
        user.ws.send(JSON.stringify({
          type: "chat",
          message,
          roomId,
          userId,
          userName: currentUser?.userName || "Anonymous",
          timestamp: new Date().toISOString()
        }));
      });
    }

    // Handle shape erase (deletion)
    if (parsedData.type === "erase_shape") {
      const roomId = parsedData.roomId;
      const shapeId = parsedData.shapeId;
      
      // Broadcast erase to all other users in the room
      const receivers = users.filter(u => u.rooms.includes(roomId));
      console.log(`Broadcasting erase to room ${roomId}. Receivers: ${receivers.length - 1}`);
      
      receivers.forEach(user => {
        if (user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "erase_shape",
            shapeId,
            roomId
          }));
        }
      });
    }

    // Handle clear canvas
    if (parsedData.type === "clear_canvas") {
      const roomId = parsedData.roomId;
      
      // Broadcast clear to all users in the room
      const receivers = users.filter(u => u.rooms.includes(roomId));
      receivers.forEach(user => {
        if (user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "clear_canvas",
            roomId
          }));
        }
      });
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    const userIndex = users.findIndex(u => u.ws === ws);
    if (userIndex !== -1) {
      const user = users[userIndex];
      if (user) {
        console.log(`User disconnected: ${user.userName} (${user.userId})`);
        
        // Get rooms before removing user
        const userRooms = [...user.rooms];
        
        // Remove user first
        users.splice(userIndex, 1);
        
        // Notify rooms about user leaving
        userRooms.forEach(roomId => {
          broadcastActiveUsers(roomId);
        });
      }
    }
  });

  // Get user name from database (async, runs after handlers are set up)
  // This is non-blocking and updates the user's name when ready
  prismaClient.user.findUnique({ where: { id: userId } })
    .then(dbUser => {
      if (dbUser) {
        newUser.userName = dbUser.name;
        console.log(`User name resolved: ${newUser.userName}`);
      }
    })
    .catch(e => {
      console.error("Error fetching user:", e);
    });
});