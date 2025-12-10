import { RoomCanvas } from "@/components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: Promise<{
        roomId: string
    }>
}) {
    const { roomId } = await params;

    return <RoomCanvas roomId={roomId} />
   
}



// "use client"

// import { useEffect, useRef } from "react";

// export default function Canvas(){
//     const  canvasRef = useRef<HTMLCanvasElement>(null);
//     useEffect(()=>{
//         const canvas = canvasRef.current;
//         const ctx = canvas?.getContext("2d");
//         if(!ctx){
//             return;
//         }
//         let clicked = false;
//         let startX = 0;
//         let startY = 0;
//         canvas?.addEventListener("mousedown",(e)=>{
//             clicked = true; 
//             startX = e.clientX
//             startY = e.clientY
//         })
//         canvas?.addEventListener("mouseup",(e)=>{
//             clicked = false;
//             console.log(e.clientX);
//             console.log( e.clientY);
//         })
//         canvas?.addEventListener("mousemove",(e)=>{
//             if(clicked){
//                 const width = e.clientX - startX;
//                 const height = e.clientY - startY;
//                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//                 ctx.strokeRect(startX, startY, width, height);
//             }
//         })
//     },[canvasRef]);

// }