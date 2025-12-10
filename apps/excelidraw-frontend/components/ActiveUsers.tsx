"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";

interface ActiveUser {
  userId: string;
  userName?: string;
}

interface ActiveUsersProps {
  socket: WebSocket;
  roomId: string;
}

export function ActiveUsers({ socket, roomId }: ActiveUsersProps) {
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "active_users" && data.roomId === roomId) {
          setUsers(data.users || []);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    }

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, roomId]);

  // Generate a consistent color for each user
  function getUserColor(userId: string): string {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function getInitials(name?: string): string {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-20 z-20">
      <div
        className="bg-neutral-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-800 overflow-hidden cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <Users size={16} className="text-green-400" />
          <span className="text-white text-sm font-medium">{users.length} online</span>
        </div>

        {/* Expanded user list */}
        {isExpanded && (
          <div className="border-t border-neutral-800 p-2 max-h-48 overflow-y-auto">
            {users.map((user, idx) => (
              <div key={user.userId + idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-800 rounded-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getUserColor(
                    user.userId
                  )}`}
                >
                  {getInitials(user.userName)}
                </div>
                <span className="text-neutral-300 text-sm truncate max-w-[120px]">
                  {user.userName || "Anonymous"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Collapsed avatar stack */}
        {!isExpanded && users.length > 0 && (
          <div className="flex items-center px-3 pb-2 -mt-1">
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((user, idx) => (
                <div
                  key={user.userId + idx}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-neutral-900 ${getUserColor(
                    user.userId
                  )}`}
                  title={user.userName || "Anonymous"}
                >
                  {getInitials(user.userName)}
                </div>
              ))}
              {users.length > 5 && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium bg-neutral-700 border-2 border-neutral-900">
                  +{users.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
