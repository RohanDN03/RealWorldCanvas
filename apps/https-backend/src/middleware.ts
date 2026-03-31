import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

// Extend Express Request interface to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function middleware(req:Request,res:Response,next:NextFunction){
    const authHeader = req.header("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader;
    let decoded: string | jwt.JwtPayload;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    if (
        decoded &&
        typeof decoded === "object" &&
        "userId" in decoded &&
        ((decoded as any).userId !== undefined)
    ) {
        req.userId = String((decoded as any).userId);
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        });
    }


}