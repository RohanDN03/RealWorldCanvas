import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.header("authorization") ?? "";
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
        typeof (decoded as any).userId === "string"
    ) {
        req.userId = (decoded as any).userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        });
    }


}