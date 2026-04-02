import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware.js';
import {CreateUserSchema,SigninSchema,CreateRoomsSchema} from '@repo/common/types'
import { prismaClient } from '@repo/db/client';
import bcrypt from 'bcryptjs';
import cors from "cors";
const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://real-world-canvas-excelidraw-frontend-imm0n79gb.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const PORT = parseInt(process.env.PORT || "10000", 10);

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
        id: randomUUID(),
        email: parsedData.data?.username,
        password: hashedPassword,
        name: parsedData.data.name
      }
    });
    res.json({
      userId: user.id
    })
  }catch(e){
    console.error("Signup error:", e);
    const message = e instanceof Error ? e.message : "";
    if (message.includes("DATABASE_URL")) {
      return res.status(500).json({ message: "Server database is not configured" });
    }
    res.status(411).json({
      message: "User already exists or another error occurred.",
      error: e instanceof Error ? e.message : "An unknown error occurred"
    });
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
  try {
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
      userId: String(user.id)
    }, JWT_SECRET);
    res.json({ token });
  } catch (e) {
    console.error("Signin error:", e);
    const message = e instanceof Error ? e.message : "";
    if (message.includes("DATABASE_URL")) {
      return res.status(500).json({ message: "Server database is not configured" });
    }
    return res.status(500).json({ message: "Error signing in" });
  }
});

app.get("/shapes/:roomId", middleware, async (req, res) => {
  const { roomId } = req.params;
  const userId = (req as any).userId as string;

  if (!roomId) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  try {
    let room = await prismaClient.room.findFirst({
      where: {
        slug: roomId,
      },
    });

    if (!room) {
      room = await prismaClient.room.create({
        data: {
          slug: roomId,
          adminId: userId,
        },
      });
    }

    const shapes = await prismaClient.shape.findMany({
      where: {
        roomId: room.id,
      },
    });
    res.json(shapes.map(s => ({...s, shapeData: JSON.parse(s.shapeData)})));
  } catch (e) {
    console.error("Error fetching shapes:", e);
    res.status(500).json({ message: "Error fetching shapes" });
  }
});


app.get("/chats/:roomId", middleware, async (req, res) => {
  const { roomId } = req.params;
  const userId = (req as any).userId as string;

  if (!roomId) {
    return res.status(400).json({ message: "Room ID is required" });
  }
  
  try {
    let room = await prismaClient.room.findFirst({
      where: {
        slug: roomId,
      },
    });
    
    if (!room) {
      room = await prismaClient.room.create({
        data: {
          slug: roomId,
          adminId: userId,
        },
      });
    }
    const chats = await prismaClient.chat.findMany({
      where: {
        roomId: room.id,
      },
    });
    res.json(chats);
  } catch (e) {
    console.error("Error fetching chats:", e);
    res.status(500).json({ message: "Error fetching chats" });
  }
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
    const userId = (req as any).userId;
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
    const userId = (req as any).userId;
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
    const userId = (req as any).userId;
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

// Delete all shapes in a room (clear canvas)
app.delete("/shapes/:roomId", middleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on ${PORT}`);
});