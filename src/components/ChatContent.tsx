"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState } from "react";
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
  sessions,
}: ChatContentProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [showMobileSessions, setShowMobileSessions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
      <SessionList sessions={sessions} currentSessionId={sessionId} />
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
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    router.push(`/chat/${session.id}`);
                    setShowMobileSessions(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    session.id === sessionId
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="font-medium text-gray-800 truncate">
                    {session.title || "Untitled Chat"}
                  </div>
                </button>
              ))}
              <button
                onClick={handleCreateNewSession}
                disabled={isCreating}
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

