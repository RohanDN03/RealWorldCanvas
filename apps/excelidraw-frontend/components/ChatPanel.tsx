"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, ChevronRight } from "lucide-react";
import { HTTP_BACKEND } from "@/config";

interface ChatMessage {
  id?: number;
  message: string;
  userId: string;
  userName: string;
  timestamp?: string;
  createdAt?: string;
}

interface ChatPanelProps {
  roomId: string;
  socket: WebSocket;
  currentUserId?: string;
}

export function ChatPanel({ roomId, socket, currentUserId }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${HTTP_BACKEND}/chats/${roomId}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Loaded messages from DB:", data.messages);
          setMessages(data.messages || []);
        } else {
          console.error("Failed to load messages:", res.status);
        }
      } catch (e) {
        console.error("Error loading messages:", e);
      }
    }
    loadMessages();
  }, [roomId]);

  // Listen for new messages from WebSocket
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          // Skip if this is our own message (we already added it optimistically)
          if (data.userId === currentUserId) {
            return;
          }
          
          const newMsg: ChatMessage = {
            message: data.message,
            userId: data.userId,
            userName: data.userName,
            timestamp: data.timestamp
          };
          setMessages((prev) => [...prev, newMsg]);
          
          // Increment unread if panel is closed
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      } catch (e) {
        // Ignore non-JSON or other message types
      }
    }

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, isOpen, currentUserId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  function sendMessage() {
    if (!newMessage.trim()) return;

    // Check if socket is open before sending
    if (socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open. State:", socket.readyState);
      return;
    }

    const messageToSend = newMessage.trim();
    
    // Optimistically add message to UI immediately
    const optimisticMsg: ChatMessage = {
      message: messageToSend,
      userId: currentUserId || "unknown",
      userName: "You",
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    socket.send(JSON.stringify({
      type: "chat",
      message: messageToSend,
      roomId
    }));

    setNewMessage("");
  }

  function formatTime(timestamp?: string | Date) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 bottom-20 z-30 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-neutral-900 border-l border-neutral-800 z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-purple-400" />
            <h3 className="font-semibold text-white">Room Chat</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: "calc(100% - 130px)" }}>
          {messages.length === 0 ? (
            <div className="text-center text-neutral-500 py-8">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.userId === currentUserId;
              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs ${isOwn ? "text-purple-400" : "text-neutral-500"}`}>
                      {isOwn ? "You" : msg.userName || "Anonymous"}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {formatTime(msg.timestamp || msg.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                      isOwn
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-neutral-800 text-neutral-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800 bg-neutral-900">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-2 text-sm border border-neutral-700 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 rounded-lg transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Collapse trigger when open */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed right-80 top-1/2 -translate-y-1/2 z-40 bg-neutral-800 hover:bg-neutral-700 text-white p-1 rounded-l-lg border-l border-t border-b border-neutral-700 transition"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </>
  );
}
