"use client";

import { useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          style={{
            minHeight: "48px",
            maxHeight: "200px",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}