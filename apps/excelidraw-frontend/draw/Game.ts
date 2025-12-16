
import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

// Base shape properties that all shapes share
type BaseShape = {
    shapeId: string; // Unique ID for each shape for sync
};

// Add more shape types as needed for your toolbar
export type Shape = ({
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    strokeColor?: string;
    bgColor?: string;
    strokeWidth?: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    strokeColor?: string;
    bgColor?: string;
    strokeWidth?: number;
} | {
    type: "pencil";
    points: Array<{x: number, y: number}>;
    strokeColor?: string;
    strokeWidth?: number;
} | {
    type: "line";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    strokeColor?: string;
    strokeWidth?: number;
} | {
    type: "arrow";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    strokeColor?: string;
    strokeWidth?: number;
} | {
    type: "diamond";
    x: number;
    y: number;
    width: number;
    height: number;
    strokeColor?: string;
    bgColor?: string;
    strokeWidth?: number;
} | {
    type: "text";
    x: number;
    y: number;
    value: string;
    strokeColor?: string;
    fontSize?: number;
    strokeWidth?: number;
} | {
    type: "eraser";
    points: Array<{x: number, y: number}>;
    strokeColor?: string;
    strokeWidth?: number;
}) & BaseShape;

// Helper to generate unique shape IDs
function generateShapeId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private strokeColor: string = "#fff";
    private bgColor: string = "#fff";
    private strokeWidth: number = 2;
    private fontSize: number = 24;
    private zoomScale: number = 1;
    private selectedShapeIndex: number | null = null;
    private drawingPoints: Array<{x: number, y: number}> = [];
    private drawingText: string = "";
    private theme: "light" | "dark" = "dark";

    // Callback for text input - set by Canvas component
    onTextInput: ((x: number, y: number) => void) | null = null;

    // Callback for zoom updates from other users - set by Canvas component
    onZoomUpdate: ((zoomLevel: number) => void) | null = null;

    socket: WebSocket;

    // Helper to convert screen coordinates to canvas coordinates (accounting for zoom)
    private screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
        return {
            x: screenX / this.zoomScale,
            y: screenY / this.zoomScale
        };
    }

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    // Bound handler for cleanup
    private messageHandler = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        
        // Handle shape updates from other users
        if (message.type === "shape") {
            this.existingShapes.push(message.shapeData);
            this.clearCanvas();
        }
        
        // Handle shape deletion (eraser) from other users
        if (message.type === "erase_shape") {
            const shapeId = message.shapeId;
            // Find and remove the matching shape by shapeId
            const index = this.existingShapes.findIndex(s => s.shapeId === shapeId);
            if (index !== -1) {
                this.existingShapes.splice(index, 1);
                this.clearCanvas();
            }
        }
        
        // Handle clear canvas from other users
        if (message.type === "clear_canvas") {
            this.existingShapes = [];
            this.clearCanvas();
        }
        
        // Handle zoom sync from other users
        if (message.type === "zoom") {
            this.zoomScale = message.zoomLevel;
            this.clearCanvas();
            // Notify Canvas component to update UI
            if (this.onZoomUpdate) {
                this.onZoomUpdate(message.zoomLevel);
            }
        }
        
        // Legacy support for old "chat" type shape messages
        if (message.type === "chat" && message.message) {
            try {
                const parsedShape = JSON.parse(message.message);
                if (parsedShape.shape) {
                    this.existingShapes.push(parsedShape.shape);
                    this.clearCanvas();
                }
            } catch {
                // Not a shape message, ignore (it's a real chat message)
            }
        }
    };
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
        this.canvas.removeEventListener("touchstart", this.touchStartHandler)
        this.canvas.removeEventListener("touchend", this.touchEndHandler)
        this.canvas.removeEventListener("touchmove", this.touchMoveHandler)
        this.socket.removeEventListener("message", this.messageHandler)
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }
    setStrokeColor(color: string) {
        this.strokeColor = color;
    }
    setBgColor(color: string) {
        this.bgColor = color;
    }
    setStrokeWidth(width: number) {
        this.strokeWidth = width;
    }
    setFontSize(size: number) {
        this.fontSize = size;
    }
    setTheme(theme: "light" | "dark") {
        this.theme = theme;
        // Update default stroke color based on theme if current is the default
        if (this.strokeColor === "#fff" || this.strokeColor === "#ffffff") {
            this.strokeColor = theme === "dark" ? "#ffffff" : "#1e1e1e";
        } else if (this.strokeColor === "#1e1e1e" || this.strokeColor === "#000000" || this.strokeColor === "#000") {
            this.strokeColor = theme === "dark" ? "#ffffff" : "#1e1e1e";
        }
        this.clearCanvas();
    }
    setZoom(scale: number, broadcast: boolean = true) {
        this.zoomScale = scale;
        this.clearCanvas();
        
        // Broadcast zoom to other users in the room
        if (broadcast) {
            this.socket.send(JSON.stringify({
                type: "zoom",
                zoomLevel: scale,
                roomId: this.roomId,
            }));
        }
    }
    getZoom(): number {
        return this.zoomScale;
    }

    // Add text shape from external input (Canvas component)
    addTextShape(x: number, y: number, value: string) {
        // Convert screen coordinates to canvas coordinates
        const canvasCoords = this.screenToCanvas(x, y);
        const shape: Shape = {
            shapeId: generateShapeId(),
            type: "text",
            x: canvasCoords.x,
            y: canvasCoords.y,
            value: value,
            strokeColor: this.strokeColor,
            fontSize: this.fontSize,
        };
        this.existingShapes.push(shape);
        
        // Send shape to other users via WebSocket
        this.socket.send(JSON.stringify({
            type: "shape",
            shapeData: shape,
            roomId: this.roomId,
        }));
        
        this.clearCanvas();
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        // Use addEventListener instead of onmessage to allow multiple handlers
        this.socket.addEventListener("message", this.messageHandler);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Use theme-aware background color
        this.ctx.fillStyle = this.theme === "dark" ? "rgba(0, 0, 0)" : "rgba(243, 244, 246)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply zoom transformation
        this.ctx.save();
        this.ctx.scale(this.zoomScale, this.zoomScale);
        
        this.existingShapes.forEach((shape, idx) => {
            this.ctx.save();
            this.ctx.strokeStyle = shape.strokeColor || this.strokeColor;
            this.ctx.lineWidth = (shape.strokeWidth || this.strokeWidth) / this.zoomScale;
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x1, shape.y1);
                this.ctx.lineTo(shape.x2, shape.y2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "arrow") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x1, shape.y1);
                this.ctx.lineTo(shape.x2, shape.y2);
                // Draw arrow head
                const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
                const headlen = 15;
                this.ctx.lineTo(
                    shape.x2 - headlen * Math.cos(angle - Math.PI / 6),
                    shape.y2 - headlen * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(shape.x2, shape.y2);
                this.ctx.lineTo(
                    shape.x2 - headlen * Math.cos(angle + Math.PI / 6),
                    shape.y2 - headlen * Math.sin(angle + Math.PI / 6)
                );
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "diamond") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x + shape.width / 2, shape.y);
                this.ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
                this.ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
                this.ctx.lineTo(shape.x, shape.y + shape.height / 2);
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.moveTo(shape.points[i-1].x, shape.points[i-1].y);
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "text") {
                this.ctx.font = `${shape.fontSize || 24}px sans-serif`;
                this.ctx.fillStyle = shape.strokeColor || this.strokeColor;
                this.ctx.fillText(shape.value, shape.x, shape.y);
            }
            this.ctx.restore();
        });
        
        // Restore from zoom transformation
        this.ctx.restore();
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        const canvasCoords = this.screenToCanvas(e.clientX, e.clientY);
        this.startX = canvasCoords.x;
        this.startY = canvasCoords.y;
        this.drawingPoints = [{x: this.startX, y: this.startY}];
        if (this.selectedTool === "select") {
            this.selectedShapeIndex = this.findShapeAt(canvasCoords.x, canvasCoords.y);
        }
        if (this.selectedTool === "text") {
            // Trigger text input overlay via callback (use screen coords for overlay positioning)
            if (this.onTextInput) {
                this.onTextInput(e.clientX, e.clientY);
            }
            this.clicked = false; // Don't continue with normal drawing
            return;
        }
        if (this.selectedTool === "eraser") {
            // Erase shape on click
            if (this.eraseAt(canvasCoords.x, canvasCoords.y)) {
                this.clearCanvas();
            }
        }
    }
    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const canvasCoords = this.screenToCanvas(e.clientX, e.clientY);
        const width = canvasCoords.x - this.startX;
        const height = canvasCoords.y - this.startY;
        let shape: Shape | null = null;
        if (this.selectedTool === "rect") {
            shape = {
                shapeId: generateShapeId(),
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
                // No fill by default
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                shapeId: generateShapeId(),
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
                // No fill by default
            };
        } else if (this.selectedTool === "line") {
            shape = {
                shapeId: generateShapeId(),
                type: "line",
                x1: this.startX,
                y1: this.startY,
                x2: canvasCoords.x,
                y2: canvasCoords.y,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
            };
        } else if (this.selectedTool === "arrow") {
            shape = {
                shapeId: generateShapeId(),
                type: "arrow",
                x1: this.startX,
                y1: this.startY,
                x2: canvasCoords.x,
                y2: canvasCoords.y,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
            };
        } else if (this.selectedTool === "diamond") {
            shape = {
                shapeId: generateShapeId(),
                type: "diamond",
                x: this.startX,
                y: this.startY,
                width,
                height,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
            };
        } else if (this.selectedTool === "pencil") {
            shape = {
                shapeId: generateShapeId(),
                type: "pencil",
                points: this.drawingPoints,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
            };
        } else if (this.selectedTool === "eraser") {
            // Eraser doesn't create shapes, it removes them
            // Do nothing here, erasing is handled in mouseDown and mouseMove
            return;
        }
        if (!shape) return;
        this.existingShapes.push(shape);
        
        // Send shape to other users via WebSocket
        this.socket.send(JSON.stringify({
            type: "shape",
            shapeData: shape,
            roomId: this.roomId,
        }));
        
        this.clearCanvas();
    }
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const canvasCoords = this.screenToCanvas(e.clientX, e.clientY);
            const width = canvasCoords.x - this.startX;
            const height = canvasCoords.y - this.startY;
            this.clearCanvas();
            this.ctx.save();
            this.ctx.scale(this.zoomScale, this.zoomScale);
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.lineWidth = this.strokeWidth / this.zoomScale;
            if (this.selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(canvasCoords.x, canvasCoords.y);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "arrow") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(canvasCoords.x, canvasCoords.y);
                // Draw arrow head
                const angle = Math.atan2(canvasCoords.y - this.startY, canvasCoords.x - this.startX);
                const headlen = 15;
                this.ctx.lineTo(
                    canvasCoords.x - headlen * Math.cos(angle - Math.PI / 6),
                    canvasCoords.y - headlen * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(canvasCoords.x, canvasCoords.y);
                this.ctx.lineTo(
                    canvasCoords.x - headlen * Math.cos(angle + Math.PI / 6),
                    canvasCoords.y - headlen * Math.sin(angle + Math.PI / 6)
                );
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "diamond") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX + width / 2, this.startY);
                this.ctx.lineTo(this.startX + width, this.startY + height / 2);
                this.ctx.lineTo(this.startX + width / 2, this.startY + height);
                this.ctx.lineTo(this.startX, this.startY + height / 2);
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (this.selectedTool === "pencil") {
                this.drawingPoints.push({x: canvasCoords.x, y: canvasCoords.y});
                this.ctx.beginPath();
                for (let i = 1; i < this.drawingPoints.length; i++) {
                    this.ctx.moveTo(this.drawingPoints[i-1].x, this.drawingPoints[i-1].y);
                    this.ctx.lineTo(this.drawingPoints[i].x, this.drawingPoints[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "eraser") {
                // Erase shapes as we drag over them
                if (this.eraseAt(canvasCoords.x, canvasCoords.y)) {
                    this.clearCanvas();
                }
                // Draw eraser cursor indicator
                this.ctx.beginPath();
                this.ctx.arc(canvasCoords.x, canvasCoords.y, 10 / this.zoomScale, 0, Math.PI * 2);
                this.ctx.strokeStyle = "#ff6b6b";
                this.ctx.lineWidth = 2 / this.zoomScale;
                this.ctx.stroke();
                this.ctx.closePath();
            }
            this.ctx.restore();
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
        
        // Touch event support for mobile/trackpad
        this.canvas.addEventListener("touchstart", this.touchStartHandler, { passive: false });
        this.canvas.addEventListener("touchend", this.touchEndHandler, { passive: false });
        this.canvas.addEventListener("touchmove", this.touchMoveHandler, { passive: false });
    }

    // Touch event handlers - convert touch to mouse-like events
    touchStartHandler = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const canvasCoords = this.screenToCanvas(touch.clientX, touch.clientY);
            
            // Create a synthetic mouse event
            this.clicked = true;
            this.startX = canvasCoords.x;
            this.startY = canvasCoords.y;
            this.drawingPoints = [{x: this.startX, y: this.startY}];
            
            if (this.selectedTool === "select") {
                this.selectedShapeIndex = this.findShapeAt(canvasCoords.x, canvasCoords.y);
            }
            if (this.selectedTool === "text") {
                if (this.onTextInput) {
                    this.onTextInput(touch.clientX, touch.clientY); // Use screen coords for overlay
                }
                this.clicked = false;
                return;
            }
            if (this.selectedTool === "eraser") {
                if (this.eraseAt(canvasCoords.x, canvasCoords.y)) {
                    this.clearCanvas();
                }
            }
        }
    }

    touchEndHandler = (e: TouchEvent) => {
        e.preventDefault();
        if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            // Simulate mouseup
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            } as MouseEvent;
            this.mouseUpHandler(fakeEvent);
        }
    }

    touchMoveHandler = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1 && this.clicked) {
            const touch = e.touches[0];
            // Simulate mousemove
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            } as MouseEvent;
            this.mouseMoveHandler(fakeEvent);
        }
    }

    // Utility: Find shape at coordinates (for select/eraser)
    findShapeAt(x: number, y: number): number | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            if (this.isPointInShape(x, y, shape)) {
                return i;
            }
        }
        return null;
    }

    // Check if a point is inside a shape
    isPointInShape(x: number, y: number, shape: Shape): boolean {
        const tolerance = 10; // pixels of tolerance for line-based shapes
        
        if (shape.type === "rect") {
            return (
                x >= shape.x - tolerance &&
                x <= shape.x + shape.width + tolerance &&
                y >= shape.y - tolerance &&
                y <= shape.y + shape.height + tolerance
            );
        } else if (shape.type === "circle") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            return Math.sqrt(dx * dx + dy * dy) <= shape.radius + tolerance;
        } else if (shape.type === "diamond") {
            // Check if point is inside diamond using cross product method
            const cx = shape.x + shape.width / 2;
            const cy = shape.y + shape.height / 2;
            const dx = Math.abs(x - cx) / (shape.width / 2 + tolerance);
            const dy = Math.abs(y - cy) / (shape.height / 2 + tolerance);
            return dx + dy <= 1;
        } else if (shape.type === "line" || shape.type === "arrow") {
            // Distance from point to line segment
            const dist = this.pointToLineDistance(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
            return dist <= tolerance;
        } else if (shape.type === "pencil") {
            // Check if point is near any segment of the pencil path
            for (let i = 1; i < shape.points.length; i++) {
                const dist = this.pointToLineDistance(
                    x, y,
                    shape.points[i-1].x, shape.points[i-1].y,
                    shape.points[i].x, shape.points[i].y
                );
                if (dist <= tolerance) return true;
            }
            return false;
        } else if (shape.type === "text") {
            // Approximate text bounding box
            const textWidth = (shape.value?.length || 5) * (shape.fontSize || 24) * 0.6;
            const textHeight = shape.fontSize || 24;
            return (
                x >= shape.x - tolerance &&
                x <= shape.x + textWidth + tolerance &&
                y >= shape.y - textHeight - tolerance &&
                y <= shape.y + tolerance
            );
        }
        return false;
    }

    // Calculate distance from point to line segment
    pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Erase shapes at the given coordinates
    eraseAt(x: number, y: number): boolean {
        const shapeIndex = this.findShapeAt(x, y);
        if (shapeIndex !== null) {
            const erasedShape = this.existingShapes[shapeIndex];
            this.existingShapes.splice(shapeIndex, 1);
            
            // Broadcast the deletion to other users using shapeId
            this.socket.send(JSON.stringify({
                type: "erase_shape",
                shapeId: erasedShape.shapeId,
                roomId: this.roomId
            }));
            
            return true;
        }
        return false;
    }

    // Actions
    deleteSelected() {
        if (this.selectedShapeIndex !== null) {
            this.existingShapes.splice(this.selectedShapeIndex, 1);
            this.selectedShapeIndex = null;
            this.clearCanvas();
        }
    }
    
    clearAll() {
        this.existingShapes = [];
        this.clearCanvas();
        
        // Broadcast clear to other users
        this.socket.send(JSON.stringify({
            type: "clear_canvas",
            roomId: this.roomId
        }));
    }
}