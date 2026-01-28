"use client";

import { useRouter } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { useState } from "react";

interface Session {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string;
}

export default function SessionList({
  sessions,
  currentSessionId,
}: SessionListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNewSession = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create session");
      const newSession = await response.json();
      router.push(`/chat/${newSession.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      setIsCreating(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <aside className="hidden md:block w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto flex flex-col">
      <div className="p-4 flex-1">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          Your Conversations
        </h2>
        <button
          onClick={handleCreateNewSession}
          disabled={isCreating}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {isCreating ? "Creating..." : "New Chat"}
        </button>
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => router.push(`/chat/${session.id}`)}
              className={`w-full text-left p-3 rounded-lg transition ${
                session.id === currentSessionId
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <div className="font-medium text-gray-800 truncate">
                {session.title || "Untitled Chat"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(session.updatedAt)}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <SignOutButton>
          <button className="w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}