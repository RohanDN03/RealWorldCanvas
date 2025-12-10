"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";
import { Plus, Users, Calendar, ArrowRight, LogOut, Pencil } from "lucide-react";

interface Room {
  id: number;
  slug: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomSlug, setJoinRoomSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchData(token);
  }, [router]);

  async function fetchData(token: string) {
    try {
      // Fetch user info
      const userRes = await fetch(`${HTTP_BACKEND}/me`, {
        headers: { authorization: token }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch rooms
      const roomsRes = await fetch(`${HTTP_BACKEND}/rooms`, {
        headers: { authorization: token }
      });
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createRoom() {
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token || ""
        },
        body: JSON.stringify({ name: newRoomName.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/canvas/${data.slug || data.roomId}`);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create room");
      }
    } catch (e) {
      console.error("Error creating room:", e);
      alert("Network error");
    } finally {
      setCreating(false);
    }
  }

  function joinRoom() {
    if (!joinRoomSlug.trim()) return;
    router.push(`/canvas/${joinRoomSlug.trim()}`);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/signin");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-xl">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">DrawTogether</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">
              Welcome, <span className="text-white font-medium">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            <Plus size={20} />
            Create New Room
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-xl font-medium transition border border-neutral-700"
          >
            <Users size={20} />
            Join Room
          </button>
        </div>

        {/* Rooms Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Rooms</h2>
          {rooms.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
              <div className="text-neutral-500 mb-4">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>You haven&apos;t created any rooms yet.</p>
                <p className="text-sm mt-2">Create a new room to start collaborating!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-purple-500/50 transition cursor-pointer group"
                  onClick={() => router.push(`/canvas/${room.slug}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <Pencil className="h-6 w-6 text-purple-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-neutral-500 group-hover:text-purple-400 transition" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{room.slug}</h3>
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <Calendar size={14} />
                    <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold text-white mb-4">Create New Room</h2>
            <p className="text-neutral-400 text-sm mb-4">
              Give your room a unique name. This will be used as the room URL.
            </p>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="my-awesome-room"
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-purple-500 focus:outline-none mb-4"
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                disabled={creating || !newRoomName.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
              >
                {creating ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold text-white mb-4">Join Room</h2>
            <p className="text-neutral-400 text-sm mb-4">
              Enter the room name or ID to join an existing room.
            </p>
            <input
              type="text"
              value={joinRoomSlug}
              onChange={(e) => setJoinRoomSlug(e.target.value)}
              placeholder="room-name-or-id"
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 border border-neutral-700 focus:border-purple-500 focus:outline-none mb-4"
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={joinRoom}
                disabled={!joinRoomSlug.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
