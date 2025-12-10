import { PrismaClient } from "@prisma/client";

// In production, DATABASE_URL is set as environment variable by Railway
// In development, it's loaded from .env file by the application
export const prismaClient = new PrismaClient();