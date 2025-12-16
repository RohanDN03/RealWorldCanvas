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
  Palette,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Game } from "../draw/Game";
import { IconButton } from "./IconButton";
import { ChatPanel } from "./ChatPanel";
import { ActiveUsers } from "./ActiveUsers";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

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

// Stroke colors - includes both white (for dark mode) and black (for light mode)
const strokeColorsDark = [
  "#ffffff",
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

const strokeColorsLight = [
  "#1e1e1e",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
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
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [strokeColor, setStrokeColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [fontSize, setFontSize] = useState<number>(24);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: string;
  }>({ visible: false, x: 0, y: 0, value: "" });
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Update stroke color when theme changes to ensure visibility
  useEffect(() => {
    // If current stroke color is white and we switch to light mode, change to black
    if (theme === 'light' && strokeColor === '#ffffff') {
      setStrokeColor('#1e1e1e');
    }
    // If current stroke color is dark and we switch to dark mode, change to white
    if (theme === 'dark' && (strokeColor === '#1e1e1e' || strokeColor === '#000000')) {
      setStrokeColor('#ffffff');
    }
  }, [theme]);

  // Update game theme when theme changes
  useEffect(() => {
    game?.setTheme?.(theme);
  }, [theme, game]);

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
    game?.setFontSize?.(fontSize);
  }, [fontSize, game]);

  const handleTextSubmit = () => {
    if (textInput.value.trim() && game) {
      game.addTextShape(textInput.x, textInput.y, textInput.value);
    }
    setTextInput({ visible: false, x: 0, y: 0, value: "" });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === "Escape") {
      setTextInput({ visible: false, x: 0, y: 0, value: "" });
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      
      // Set the text input callback immediately
      g.onTextInput = (x: number, y: number) => {
        setTextInput({ visible: true, x, y, value: "" });
        setTimeout(() => textInputRef.current?.focus(), 10);
      };
      
      // Set the zoom update callback to sync zoom from other users
      g.onZoomUpdate = (zoomLevel: number) => {
        setZoom(Math.round(zoomLevel * 100));
      };
      
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
    <div className={`h-screen w-screen overflow-hidden relative ${theme === 'dark' ? 'bg-neutral-950' : 'bg-gray-100'}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1920}
        height={typeof window !== "undefined" ? window.innerHeight : 1080}
        className="absolute inset-0"
      />

      {/* Text Input Overlay */}
      {textInput.visible && (
        <div
          className="fixed z-[100]"
          style={{
            left: Math.min(textInput.x, typeof window !== "undefined" ? window.innerWidth - 300 : textInput.x),
            top: Math.max(10, textInput.y - fontSize - 10),
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="bg-neutral-900 border-2 border-purple-500 rounded-lg p-3 shadow-2xl min-w-[280px]">
            {/* Font Size Control */}
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-neutral-400">Size:</label>
              <input
                type="range"
                min={12}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-white text-xs font-mono w-6">{fontSize}</span>
            </div>
            
            {/* Color Picker */}
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-neutral-400">Color:</label>
              <div className="flex gap-1">
                {["#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setStrokeColor(c)}
                    className={`w-5 h-5 rounded transition-all ${
                      strokeColor === c
                        ? "ring-2 ring-purple-500 ring-offset-1 ring-offset-neutral-900 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <textarea
              ref={textInputRef}
              value={textInput.value}
              onChange={(e) =>
                setTextInput({ ...textInput, value: e.target.value })
              }
              onKeyDown={handleTextKeyDown}
              placeholder="Type here..."
              className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 outline-none resize-none w-full block"
              style={{
                color: strokeColor,
                fontSize: `${fontSize}px`,
                fontFamily: "sans-serif",
                lineHeight: 1.4,
                minHeight: `${Math.max(fontSize * 1.5 + 20, 50)}px`,
              }}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleTextSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded transition font-medium"
              >
                Add (Enter)
              </button>
              <button
                onClick={() =>
                  setTextInput({ visible: false, x: 0, y: 0, value: "" })
                }
                className="bg-neutral-700 hover:bg-neutral-600 text-white text-sm px-3 py-1.5 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100vw-80px)] sm:max-w-none">
        <div className={`flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 shadow-2xl border overflow-x-auto ${
          theme === 'dark' 
            ? 'bg-neutral-900/95 border-neutral-800' 
            : 'bg-white/95 border-gray-200'
        }`}>
          <IconButton
            onClick={() => setSelectedTool("hand")}
            activated={selectedTool === "hand"}
            icon={<Hand size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Hand (H)"
            theme={theme}
          />
          <IconButton
            onClick={() => setSelectedTool("select")}
            activated={selectedTool === "select"}
            icon={<MousePointer2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Select (V)"
            theme={theme}
          />
          <div className={`w-px h-5 sm:h-6 mx-0.5 sm:mx-1 ${theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'} hidden sm:block`} />
          <IconButton
            onClick={() => setSelectedTool("pencil")}
            activated={selectedTool === "pencil"}
            icon={<Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Pencil (P)"
            theme={theme}
          />
          <IconButton
            onClick={() => setSelectedTool("line")}
            activated={selectedTool === "line"}
            icon={<Minus size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Line (L)"
            theme={theme}
          />
          <IconButton
            onClick={() => setSelectedTool("arrow")}
            activated={selectedTool === "arrow"}
            icon={<ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Arrow (A)"
            theme={theme}
          />
          <div className={`w-px h-5 sm:h-6 mx-0.5 sm:mx-1 ${theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'} hidden sm:block`} />
          <IconButton
            onClick={() => setSelectedTool("rect")}
            activated={selectedTool === "rect"}
            icon={<RectangleHorizontalIcon size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Rectangle (R)"
            theme={theme}
          />
          <IconButton
            onClick={() => setSelectedTool("circle")}
            activated={selectedTool === "circle"}
            icon={<Circle size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Circle (C)"
            theme={theme}
          />
          <IconButton
            onClick={() => setSelectedTool("diamond")}
            activated={selectedTool === "diamond"}
            icon={<Diamond size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Diamond (D)"
            theme={theme}
          />
          <div className={`w-px h-5 sm:h-6 mx-0.5 sm:mx-1 ${theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'} hidden sm:block`} />
          <IconButton
            onClick={() => setSelectedTool("text")}
            activated={selectedTool === "text"}
            icon={<Type size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Text (T)"
            theme={theme}
          />
          <IconButton
            onClick={() => setSelectedTool("eraser")}
            activated={selectedTool === "eraser"}
            icon={<Eraser size={16} className="sm:w-[18px] sm:h-[18px]" />}
            tooltip="Eraser (E)"
            theme={theme}
          />
        </div>
      </div>

      {/* Left Sidebar Toggle Button */}
      <div className="fixed left-2 sm:left-4 top-2 sm:top-4 z-20">
        {!showSidebar ? (
          <button
            onClick={() => setShowSidebar(true)}
            className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border transition ${
              theme === 'dark'
                ? 'bg-neutral-900/95 hover:bg-neutral-800 text-white border-neutral-800'
                : 'bg-white/95 hover:bg-gray-100 text-gray-800 border-gray-200'
            }`}
            title="Colors & Styles"
          >
            <Palette size={18} className="sm:w-5 sm:h-5" />
          </button>
        ) : (
        <div className={`backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-2xl border w-44 sm:w-52 ${
          theme === 'dark'
            ? 'bg-neutral-900/95 border-neutral-800'
            : 'bg-white/95 border-gray-200'
        }`}>
          {/* Close Button */}
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>Style</span>
            <button
              onClick={() => setShowSidebar(false)}
              className={`transition p-1 rounded ${
                theme === 'dark'
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-gray-400 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Stroke Color */}
          <div className="mb-3 sm:mb-4">
            <label className={`text-xs font-medium uppercase tracking-wide mb-1.5 sm:mb-2 block ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Stroke
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-4 gap-1 sm:gap-1.5">
              {(theme === 'dark' ? strokeColorsDark : strokeColorsLight).map((c) => (
                <button
                  key={c}
                  onClick={() => setStrokeColor(c)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg transition-all ${
                    strokeColor === c
                      ? `ring-2 ring-purple-500 ring-offset-1 sm:ring-offset-2 scale-110 ${theme === 'dark' ? 'ring-offset-neutral-900' : 'ring-offset-white'}`
                      : "hover:scale-105"
                  } ${c === '#ffffff' ? 'border border-gray-300' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="mb-3 sm:mb-4">
            <label className={`text-xs font-medium uppercase tracking-wide mb-1.5 sm:mb-2 block ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Fill
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-4 gap-1 sm:gap-1.5">
              {bgColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg transition-all border ${
                    theme === 'dark' ? 'border-neutral-700' : 'border-gray-300'
                  } ${
                    bgColor === c
                      ? `ring-2 ring-purple-500 ring-offset-1 sm:ring-offset-2 scale-110 ${theme === 'dark' ? 'ring-offset-neutral-900' : 'ring-offset-white'}`
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: c === "transparent" ? "transparent" : c,
                    backgroundImage:
                      c === "transparent"
                        ? theme === 'dark'
                          ? "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)"
                          : "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                        : "none",
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="mb-3 sm:mb-4">
            <label className={`text-xs font-medium uppercase tracking-wide mb-1.5 sm:mb-2 block ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Stroke Width
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="range"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 ${
                  theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'
                }`}
              />
              <span className={`text-sm font-mono w-6 text-right ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {strokeWidth}
              </span>
            </div>
          </div>

          {/* Font Size (for text tool) */}
          <div className="mb-3 sm:mb-4">
            <label className={`text-xs font-medium uppercase tracking-wide mb-1.5 sm:mb-2 block ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Font Size
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="range"
                min={12}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 ${
                  theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'
                }`}
              />
              <span className={`text-sm font-mono w-8 text-right ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {fontSize}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px my-3 sm:my-4 ${theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-200'}`} />

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
        )}
      </div>

      {/* Right Sidebar - Actions */}
      <div className="fixed right-2 sm:right-4 top-2 sm:top-4 z-20">
        <div className="flex flex-col gap-1 sm:gap-2">
          <button
            onClick={toggleTheme}
            className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border transition ${
              theme === 'dark' 
                ? 'bg-neutral-900/95 hover:bg-neutral-800 text-white border-neutral-800' 
                : 'bg-white/95 hover:bg-gray-100 text-gray-800 border-gray-200'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={handleGoHome}
            className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border transition ${
              theme === 'dark' 
                ? 'bg-neutral-900/95 hover:bg-neutral-800 text-white border-neutral-800' 
                : 'bg-white/95 hover:bg-gray-100 text-gray-800 border-gray-200'
            }`}
            title="Dashboard"
          >
            <Home size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleShare}
            className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border transition hidden sm:block ${
              theme === 'dark' 
                ? 'bg-neutral-900/95 hover:bg-neutral-800 text-white border-neutral-800' 
                : 'bg-white/95 hover:bg-gray-100 text-gray-800 border-gray-200'
            }`}
            title="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleExport}
            className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border transition hidden sm:block ${
              theme === 'dark' 
                ? 'bg-neutral-900/95 hover:bg-neutral-800 text-white border-neutral-800' 
                : 'bg-white/95 hover:bg-gray-100 text-gray-800 border-gray-200'
            }`}
            title="Export as PNG"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleLogout}
            className={`backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border transition ${
              theme === 'dark' 
                ? 'bg-neutral-900/95 hover:bg-red-900/50 text-white hover:text-red-400 border-neutral-800' 
                : 'bg-white/95 hover:bg-red-100 text-gray-800 hover:text-red-600 border-gray-200'
            }`}
            title="Logout"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Active Users - Hidden on mobile */}
      <div className="hidden sm:block">
        <ActiveUsers socket={socket} roomId={roomId} />
      </div>

      {/* Room ID Badge */}
      <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className={`backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-2 shadow-lg border ${
          theme === 'dark'
            ? 'bg-neutral-900/95 border-neutral-800'
            : 'bg-white/95 border-gray-200'
        }`}>
          <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>Room:</span>
          <span className={`text-xs sm:text-sm font-mono ml-1 sm:ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{roomId}</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-20">
        <div className={`flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm rounded-md sm:rounded-lg shadow-lg border ${
          theme === 'dark'
            ? 'bg-neutral-900/95 border-neutral-800'
            : 'bg-white/95 border-gray-200'
        }`}>
          <button
            className={`p-1.5 sm:p-2 rounded-l-md sm:rounded-l-lg transition ${
              theme === 'dark'
                ? 'hover:bg-neutral-800 text-white'
                : 'hover:bg-gray-200 text-gray-800'
            } ${zoom <= 25 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={zoom <= 25}
            onClick={() => {
              const newZoom = Math.max(25, zoom - 25);
              setZoom(newZoom);
              game?.setZoom(newZoom / 100);
            }}
            title="Zoom out"
          >
            <ZoomOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <span className={`text-xs sm:text-sm font-mono px-1 sm:px-2 min-w-[40px] sm:min-w-[50px] text-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>{zoom}%</span>
          <button
            className={`p-1.5 sm:p-2 rounded-r-md sm:rounded-r-lg transition ${
              theme === 'dark'
                ? 'hover:bg-neutral-800 text-white'
                : 'hover:bg-gray-200 text-gray-800'
            } ${zoom >= 200 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={zoom >= 200}
            onClick={() => {
              const newZoom = Math.min(200, zoom + 25);
              setZoom(newZoom);
              game?.setZoom(newZoom / 100);
            }}
            title="Zoom in"
          >
            <ZoomIn size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border w-full max-w-md ${
            theme === 'dark'
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Share Canvas</h2>
            <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              Anyone with this link can join and collaborate on this canvas.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className={`flex-1 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm border ${
                  theme === 'dark'
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                }`}
              />
              <button
                onClick={copyLink}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
              className={`w-full mt-3 sm:mt-4 py-2 transition text-xs sm:text-sm ${
                theme === 'dark'
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
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