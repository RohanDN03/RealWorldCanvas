import { PrismaClient } from './src/generated/prisma/client.js';
const prisma = new PrismaClient();

async function main() {
  // List all rooms
  const rooms = await prisma.room.findMany();
  console.log('Rooms:', rooms);
  
  // List all chats
  const chats = await prisma.chat.findMany({ include: { room: true, user: true } });
  console.log('Chats:', chats);
}

main().then(() => process.exit(0));
