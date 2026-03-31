import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const token = localStorage.getItem("token");
    try {
        // Try to get shapes from the new shapes endpoint
        const res = await axios.get(`${HTTP_BACKEND}/shapes/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data.map((s: any) => s.shapeData) || [];
    } catch (e) {
        console.error("Error fetching shapes:", e);
        
        // Fallback to old chats endpoint for backward compatibility
        try {
            const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const messages = res.data || [];
            
            const shapes = messages
                .map((x: {message: string}) => {
                    try {
                        const messageData = JSON.parse(x.message);
                        return messageData.shape;
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);
            
            return shapes;
        } catch {
            return [];
        }
    }
}

export async function getExistingChats(roomId: string) {
    const token = localStorage.getItem("token");
    try {
        const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data || [];
    } catch (e) {
        console.error("Error fetching chats:", e);
        return [];
    }
}