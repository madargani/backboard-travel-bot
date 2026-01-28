"use client";

import { useEffect, useState } from "react";
import ChatContent from "./ChatContent";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ChatInterfaceProps {
  sessionId: string;
  sessions: Array<{
    id: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function ChatInterface({
  sessionId,
  sessions,
}: ChatInterfaceProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [initialMessages, setInitialMessages] = useState<any[] | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
      return;
    }

    async function fetchMessages() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) return;
        const sessionData = await response.json();
        const messages = (sessionData.messages || [])
          .filter((msg: any) => msg.content)
          .map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            parts: [
              {
                type: "text" as const,
                text: msg.content,
              },
            ],
          }));
        setInitialMessages(messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setInitialMessages([]);
      }
    }

    fetchMessages();
  }, [sessionId, isSignedIn, router]);

  if (initialMessages === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ChatContent
      sessionId={sessionId}
      initialMessages={initialMessages}
      sessions={sessions}
    />
  );
}

