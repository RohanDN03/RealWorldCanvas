import { config } from "dotenv";
import { resolve } from "path";

// Load .env from root of the monorepo
config({ path: resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";
export const prismaClient = new PrismaClient();