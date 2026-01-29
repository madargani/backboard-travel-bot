"use client";

import { useRouter } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { useState, useRef, KeyboardEvent, FocusEvent } from "react";

interface Session {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string;
  onSessionUpdate?: (sessionId: string, updatedSession: Session) => void;
}

export default function SessionList({
  sessions,
  currentSessionId,
  onSessionUpdate,
}: SessionListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const startEditing = (session: Session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title || "");
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditTitle("");
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingSessionId) return;

    const trimmedTitle = editTitle.trim();

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    if (trimmedTitle.length > 100) {
      setError("Title must be less than 100 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${editingSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update session");
      }

      const updatedSession = await response.json();

      onSessionUpdate?.(editingSessionId, {
        ...sessions.find((s) => s.id === editingSessionId)!,
        title: updatedSession.title,
      });

      setEditingSessionId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (isLoading) return;
    saveEdit();
  };

  return (
    <aside className="hidden md:block w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto flex flex-col">
      <div className="p-4 flex-1">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          Your Conversations
        </h2>
        <button
          onClick={handleCreateNewSession}
          disabled={isCreating || editingSessionId !== null}
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
          {sessions.map((session) => {
            const isEditing = editingSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg border-2 transition ${
                  session.id === currentSessionId
                    ? "bg-blue-50 border-blue-500"
                    : "hover:bg-gray-100 bg-white border-transparent hover:border-gray-300"
                } ${isEditing ? "ring-2 ring-blue-400" : ""}`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      maxLength={101}
                      className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      autoFocus
                    />
                    {error && (
                      <p className="text-xs text-red-600">{error}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      {editTitle.length}/100
                    </div>
                    {isLoading && (
                      <div className="text-xs text-blue-600">Saving...</div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => router.push(`/chat/${session.id}`)}
                      className="w-full text-left"
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {session.title || "Untitled Chat"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(session.updatedAt)}
                      </div>
                    </button>
                    <button
                      onClick={() => startEditing(session)}
                      disabled={editingSessionId !== null}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Rename session"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            );
          })}
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