// "use client";

// import { WS_URL } from "@/config";
// import { useEffect, useRef, useState } from "react";
// import { Canvas } from "./Canvas";


// export function RoomCanvas({roomId}: {roomId: string}) {
//     const [socket, setSocket] = useState<WebSocket | null>(null);

//     useEffect(() => {
//         const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzlkOTA5Yi00YTUyLTQ2YjYtYWE2Yi04NjE3MmFkY2E0NGQiLCJpYXQiOjE3NTY5MzM0MDR9.0t2Xfvjs2fhArCXViQJn46fNr6nrHrCDipEnySY6XH4`)

//         ws.onopen = () => {
//             setSocket(ws);
//             const data = JSON.stringify({
//                 type: "join_room",
//                 roomId
//             });
//             console.log(data);
//             ws.send(data)
//         }
        
//     }, [])
   
//     if (!socket) {
//         return <div>
//             Connecting to server....
//         </div>
//     }

//     return <div>
//         <Canvas roomId={roomId} socket={socket} />
//     </div>
// }
"use client";

import { WS_URL } from "@/config";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";

function parseToken(token: string): { userId?: string } {
    try {
        // Decode without verification (just to get the payload)
        const parts = token.split('.');
        if (parts.length !== 3) return {};
        const payload = JSON.parse(atob(parts[1]));
        return { userId: payload.userId };
    } catch {
        return {};
    }
}

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [userId, setUserId] = useState<string | undefined>();
    const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error" | "unauthorized">("connecting");
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        
        const token = localStorage.getItem("token");
        if (!token) {
            setConnectionStatus("unauthorized");
            setTimeout(() => router.push("/signin"), 1500);
            return;
        }

        // Parse user ID from token
        const { userId: parsedUserId } = parseToken(token);
        setUserId(parsedUserId);

        function connect() {
            if (!mountedRef.current) return;
            
            // Don't create new connection if one exists and is open
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                return;
            }

            const ws = new WebSocket(`${WS_URL}?token=${token}`);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!mountedRef.current) {
                    ws.close();
                    return;
                }
                setSocket(ws);
                setConnectionStatus("connected");
                const data = JSON.stringify({
                    type: "join_room",
                    roomId
                });
                console.log("Joining room:", data);
                ws.send(data);
            };

            ws.onerror = () => {
                if (mountedRef.current) {
                    setConnectionStatus("error");
                }
            };

            ws.onclose = (event) => {
                if (!mountedRef.current) return;
                
                setSocket(null);
                
                if (event.code === 4001) {
                    setConnectionStatus("unauthorized");
                    localStorage.removeItem("token");
                    setTimeout(() => router.push("/signin"), 1500);
                } else if (event.code !== 1000) {
                    // Abnormal close - try to reconnect
                    console.log("WebSocket closed unexpectedly, reconnecting in 2s...");
                    setConnectionStatus("connecting");
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) {
                            connect();
                        }
                    }, 2000);
                }
            };
        }
        
        connect();

        return () => {
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounting");
            }
        };
    }, [roomId, router]);

    if (connectionStatus === "unauthorized") {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Session expired. Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    if (connectionStatus === "error") {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-white text-lg mb-4">Failed to connect to server</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!socket || connectionStatus === "connecting") {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Connecting to canvas...</p>
                </div>
            </div>
        );
    }

    return <Canvas roomId={roomId} socket={socket} userId={userId} />;
}