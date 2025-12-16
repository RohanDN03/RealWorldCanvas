
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    try {
        // Try to get shapes from the new shapes endpoint
        const res = await axios.get(`${HTTP_BACKEND}/shapes/${roomId}`);
        return res.data.shapes || [];
    } catch (e) {
        console.error("Error fetching shapes:", e);
        
        // Fallback to old chats endpoint for backward compatibility
        try {
            const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
            const messages = res.data.messages || [];
            
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