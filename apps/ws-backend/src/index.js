"use strict";
// import {WebSocket, WebSocketServer } from 'ws';
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from '@repo/backend-common/config';
// import { prismaClient } from '@repo/db/client';
// const wss = new WebSocketServer({ port: 8080 });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("@repo/backend-common/config");
const client_1 = require("@repo/db/client");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log("Server started");
const users = [];
function checkUser(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (typeof decoded == "string") {
            return null;
        }
        if (!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;
    }
    catch (e) {
        return null;
    }
    return null;
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
        return null;
    }
    users.push({
        userId,
        rooms: [],
        ws
    });
    console.log(`User connected: ${userId}. Total users: ${users.length}`);
    ws.on('message', async function message(data) {
        let parsedData;
        if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString());
        }
        else {
            parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
        }
        if (parsedData.type === "join_room") {
            const user = users.find(x => x.ws === ws);
            if (user) {
                user.rooms.push(parsedData.roomId);
                console.log(`User ${user.userId} joined room ${parsedData.roomId}. Rooms: [${user.rooms.join(", ")}]`);
            }
        }
        if (parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws);
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x === parsedData.room);
            console.log(`User ${user.userId} left room ${parsedData.room}. Rooms: [${user.rooms.join(", ")}]`);
        }
        console.log("message received");
        console.log(parsedData);
        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            await client_1.prismaClient.chat.create({
                data: {
                    roomId: Number(roomId),
                    message,
                    userId
                }
            });
            const receivers = users.filter(user => user.rooms.includes(roomId));
            console.log(`Broadcasting message to room ${roomId}. Receivers: [${receivers.map(u => u.userId).join(", ")}]`);
            receivers.forEach(user => {
                user.ws.send(JSON.stringify({
                    type: "chat",
                    message: message,
                    roomId
                }));
            });
        }
    });
});
