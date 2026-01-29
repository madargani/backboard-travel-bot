"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState, useRef, KeyboardEvent, FocusEvent } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import SessionList from "./SessionList";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ChatContentProps {
  sessionId: string;
  initialMessages: any[];
  sessions: Array<{
    id: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function ChatContent({
  sessionId,
  initialMessages,
  sessions: initialSessions,
}: ChatContentProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [showMobileSessions, setShowMobileSessions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sessions, setSessions] = useState(initialSessions);
  const [mobileEditingId, setMobileEditingId] = useState<string | null>(null);
  const [mobileEditTitle, setMobileEditTitle] = useState("");
  const [isMobileSaving, setIsMobileSaving] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNewSession = async () => {
    setIsCreating(true);
    setShowMobileSessions(false);
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

  const handleSessionUpdate = (sessionId: string, updatedSession: { id: string; title: string | null }) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, title: updatedSession.title } : session
      )
    );
  };

  const startMobileEditing = (session: typeof sessions[number]) => {
    setMobileEditingId(session.id);
    setMobileEditTitle(session.title || "");
    setMobileError(null);
    setTimeout(() => mobileInputRef.current?.focus(), 0);
  };

  const cancelMobileEditing = () => {
    setMobileEditingId(null);
    setMobileEditTitle("");
    setMobileError(null);
  };

  const saveMobileEdit = async () => {
    if (!mobileEditingId) return;

    const trimmedTitle = mobileEditTitle.trim();

    if (!trimmedTitle) {
      setMobileError("Title is required");
      return;
    }

    if (trimmedTitle.length > 100) {
      setMobileError("Title must be less than 100 characters");
      return;
    }

    setIsMobileSaving(true);
    setMobileError(null);

    try {
      const response = await fetch(`/api/sessions/${mobileEditingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update session");
      }

      const updatedSession = await response.json();

      handleSessionUpdate(mobileEditingId, {
        id: mobileEditingId,
        title: updatedSession.title,
      });

      setMobileEditingId(null);
    } catch (err) {
      setMobileError(err instanceof Error ? err.message : "Failed to rename session");
    } finally {
      setIsMobileSaving(false);
    }
  };

  const handleMobileKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveMobileEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelMobileEditing();
    }
  };

  const handleMobileBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (isMobileSaving) return;
    saveMobileEdit();
  };

  const { messages, sendMessage, error, status } = useChat({
    messages: initialMessages,
    transport: new TextStreamChatTransport({
      api: `/api/sessions/${sessionId}/chat`,
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  if (error) {
    console.error("Chat error:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">
            Failed to load chat. Please try again.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (message: string) => {
    sendMessage({ text: message });
  };

  return (
    <div className="flex h-screen">
      <SessionList
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionUpdate={handleSessionUpdate}
      />
      <div className="flex-1 flex flex-col bg-white">
        <div className="md:hidden p-2 border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowMobileSessions(!showMobileSessions)}
            className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-lg"
          >
            <span className="font-medium text-gray-800">
              {sessions.find((s) => s.id === sessionId)?.title ||
                "Untitled Chat"}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showMobileSessions ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showMobileSessions && (
            <div className="mt-2 max-h-64 overflow-y-auto flex flex-col gap-2">
              {sessions.map((session) => {
                const isMobileEditing = mobileEditingId === session.id;
                return (
                  <div
                    key={session.id}
                    className={`w-full p-3 rounded-lg transition ${
                      session.id === sessionId
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    {isMobileEditing ? (
                      <div className="space-y-2">
                        <input
                          ref={mobileInputRef}
                          type="text"
                          value={mobileEditTitle}
                          onChange={(e) => setMobileEditTitle(e.target.value)}
                          onKeyDown={handleMobileKeyDown}
                          onBlur={handleMobileBlur}
                          disabled={isMobileSaving}
                          maxLength={101}
                          className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          autoFocus
                        />
                        {mobileError && (
                          <p className="text-xs text-red-600">{mobileError}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          {mobileEditTitle.length}/100
                        </div>
                        {isMobileSaving && (
                          <div className="text-xs text-blue-600">Saving...</div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          router.push(`/chat/${session.id}`);
                          setShowMobileSessions(false);
                        }}
                        className="w-full text-left flex items-center gap-2"
                      >
                        <span className="font-medium text-gray-800 truncate flex-1">
                          {session.title || "Untitled Chat"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startMobileEditing(session);
                          }}
                          className="p-1.5 rounded hover:bg-gray-200"
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
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={handleCreateNewSession}
                disabled={isCreating || mobileEditingId !== null}
                className="w-full text-left p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
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
              <div className="border-t border-gray-200 pt-2">
                <SignOutButton>
                  <button className="w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-left">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          )}
        </div>
        <MessageList messages={messages} />
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

