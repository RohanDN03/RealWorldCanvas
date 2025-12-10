import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`{WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNmMyMDZhZS1kZDBiLTQzNjMtYjE5MC04MDViZWFiZDY2M2MiLCJpYXQiOjE3NTY1NTg0MzZ9.2hi3BROj-D4kZyL3jb1cs0mWO3CCx2x30-SDpsxZsL0`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}