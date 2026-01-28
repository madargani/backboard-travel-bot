"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function redirectToChat() {
      if (isSignedIn) {
        try {
          const response = await fetch("/api/sessions");
          if (!response.ok) throw new Error("Failed to fetch sessions");

          const sessions = await response.json();

          if (sessions.length > 0) {
            router.push(`/chat/${sessions[0].id}`);
          } else {
            const createResponse = await fetch("/api/sessions", {
              method: "POST",
            });
            if (!createResponse.ok) throw new Error("Failed to create session");

            const newSession = await createResponse.json();
            router.push(`/chat/${newSession.id}`);
          }
        } catch (error) {
          console.error("Error redirecting to chat:", error);
        }
      }
    }

    redirectToChat();
  }, [isSignedIn, userId, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Backboard Travel-Bot</h1>
      <p className="mt-4 text-gray-600">
        An AI-powered travel assistant with persistent memory
      </p>
      <div className="mt-8">
        <SignInButton mode="modal">
          <button className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}