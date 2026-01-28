"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      title: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/");
      return;
    }

    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError("Failed to load sessions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
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

  return <ChatInterface sessionId={sessionId} sessions={sessions} />;
}