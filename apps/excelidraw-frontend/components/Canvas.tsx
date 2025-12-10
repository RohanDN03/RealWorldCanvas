"use client";

import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  Hand,
  Diamond,
  ArrowRight,
  Minus,
  Type,
  Eraser,
  MousePointer2,
  Trash2,
  Share2,
  LogOut,
  Download,
  ZoomIn,
  ZoomOut,
  Home,
} from "lucide-react";
import { Game } from "../draw/Game";
import { IconButton } from "./IconButton";
import { ChatPanel } from "./ChatPanel";
import { ActiveUsers } from "./ActiveUsers";
import { useRouter } from "next/navigation";

export type Tool =
  | "hand"
  | "select"
  | "pencil"
  | "rect"
  | "circle"
  | "diamond"
  | "arrow"
  | "line"
  | "text"
  | "eraser";

const strokeColors = [
  "#ffffff",
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

const bgColors = [
  "transparent",
  "#1e1e1e",
  "#1a1a2e",
  "#16213e",
  "#1b4332",
  "#3c1518",
  "#2d1b69",
];

export function Canvas({ roomId, socket, userId }: { socket: WebSocket; roomId: string; userId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [strokeColor, setStrokeColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    game?.setStrokeColor?.(strokeColor);
  }, [strokeColor, game]);

  useEffect(() => {
    game?.setBgColor?.(bgColor);
  }, [bgColor, game]);

  useEffect(() => {
    game?.setStrokeWidth?.(strokeWidth);
  }, [strokeWidth, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);
      return () => {
        g.destroy();
      };
    }
  }, [canvasRef, roomId, socket]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `canvas-${roomId}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 relative">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1920}
        height={typeof window !== "undefined" ? window.innerHeight : 1080}
        className="absolute inset-0"
      />

      {/* Top Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1 bg-neutral-900/95 backdrop-blur-sm rounded-xl px-2 py-1.5 shadow-2xl border border-neutral-800">
          <IconButton
            onClick={() => setSelectedTool("hand")}
            activated={selectedTool === "hand"}
            icon={<Hand size={18} />}
            tooltip="Hand (H)"
          />
          <IconButton
            onClick={() => setSelectedTool("select")}
            activated={selectedTool === "select"}
            icon={<MousePointer2 size={18} />}
            tooltip="Select (V)"
          />
          <div className="w-px h-6 bg-neutral-700 mx-1" />
          <IconButton
            onClick={() => setSelectedTool("pencil")}
            activated={selectedTool === "pencil"}
            icon={<Pencil size={18} />}
            tooltip="Pencil (P)"
          />
          <IconButton
            onClick={() => setSelectedTool("line")}
            activated={selectedTool === "line"}
            icon={<Minus size={18} />}
            tooltip="Line (L)"
          />
          <IconButton
            onClick={() => setSelectedTool("arrow")}
            activated={selectedTool === "arrow"}
            icon={<ArrowRight size={18} />}
            tooltip="Arrow (A)"
          />
          <div className="w-px h-6 bg-neutral-700 mx-1" />
          <IconButton
            onClick={() => setSelectedTool("rect")}
            activated={selectedTool === "rect"}
            icon={<RectangleHorizontalIcon size={18} />}
            tooltip="Rectangle (R)"
          />
          <IconButton
            onClick={() => setSelectedTool("circle")}
            activated={selectedTool === "circle"}
            icon={<Circle size={18} />}
            tooltip="Circle (C)"
          />
          <IconButton
            onClick={() => setSelectedTool("diamond")}
            activated={selectedTool === "diamond"}
            icon={<Diamond size={18} />}
            tooltip="Diamond (D)"
          />
          <div className="w-px h-6 bg-neutral-700 mx-1" />
          <IconButton
            onClick={() => setSelectedTool("text")}
            activated={selectedTool === "text"}
            icon={<Type size={18} />}
            tooltip="Text (T)"
          />
          <IconButton
            onClick={() => setSelectedTool("eraser")}
            activated={selectedTool === "eraser"}
            icon={<Eraser size={18} />}
            tooltip="Eraser (E)"
          />
        </div>
      </div>

      {/* Left Sidebar - Properties */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-neutral-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-neutral-800 w-52">
          {/* Stroke Color */}
          <div className="mb-4">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2 block">
              Stroke
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {strokeColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setStrokeColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    strokeColor === c
                      ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-neutral-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="mb-4">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2 block">
              Fill
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {bgColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all border border-neutral-700 ${
                    bgColor === c
                      ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-neutral-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: c === "transparent" ? "transparent" : c,
                    backgroundImage:
                      c === "transparent"
                        ? "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)"
                        : "none",
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="mb-4">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2 block">
              Stroke Width
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-white text-sm font-mono w-6 text-right">
                {strokeWidth}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-800 my-4" />

          {/* Actions */}
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-3 py-2 text-sm transition"
              onClick={() => game?.clearAll?.()}
            >
              <Trash2 size={16} />
              Clear Canvas
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Actions */}
      <div className="fixed right-4 top-4 z-20">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleGoHome}
            className="bg-neutral-900/95 backdrop-blur-sm hover:bg-neutral-800 text-white rounded-xl p-3 shadow-lg border border-neutral-800 transition"
            title="Dashboard"
          >
            <Home size={20} />
          </button>
          <button
            onClick={handleShare}
            className="bg-neutral-900/95 backdrop-blur-sm hover:bg-neutral-800 text-white rounded-xl p-3 shadow-lg border border-neutral-800 transition"
            title="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleExport}
            className="bg-neutral-900/95 backdrop-blur-sm hover:bg-neutral-800 text-white rounded-xl p-3 shadow-lg border border-neutral-800 transition"
            title="Export as PNG"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="bg-neutral-900/95 backdrop-blur-sm hover:bg-red-900/50 text-white hover:text-red-400 rounded-xl p-3 shadow-lg border border-neutral-800 transition"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Active Users */}
      <ActiveUsers socket={socket} roomId={roomId} />

      {/* Room ID Badge */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className="bg-neutral-900/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-neutral-800">
          <span className="text-neutral-500 text-xs">Room:</span>
          <span className="text-white text-sm font-mono ml-2">{roomId}</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="flex items-center gap-1 bg-neutral-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-neutral-800">
          <button
            className="p-2 hover:bg-neutral-800 rounded-l-lg transition text-white opacity-50 cursor-not-allowed"
            disabled
            title="Zoom out (coming soon)"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-white text-sm font-mono px-2">100%</span>
          <button
            className="p-2 hover:bg-neutral-800 rounded-r-lg transition text-white opacity-50 cursor-not-allowed"
            disabled
            title="Zoom in (coming soon)"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-neutral-900 rounded-2xl p-6 shadow-2xl border border-neutral-800 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Share Canvas</h2>
            <p className="text-neutral-400 text-sm mb-4">
              Anyone with this link can join and collaborate on this canvas.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-2 text-sm border border-neutral-700"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-2 text-neutral-400 hover:text-white transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <ChatPanel roomId={roomId} socket={socket} currentUserId={userId} />
    </div>
  );
}