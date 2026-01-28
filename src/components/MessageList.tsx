"use client";

import type { UIMessage } from "@ai-sdk/react";

interface MessageListProps {
  messages: UIMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const getMessageContent = (message: UIMessage): string => {
    if (!message.parts || message.parts.length === 0) return "";

    return message.parts
      .map((part) => {
        if (part.type === "text") {
          return part.text;
        }
        return "";
      })
      .join("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Start a conversation by sending a message...</p>
        </div>
      ) : (
        messages.map((message) => {
          const content = getMessageContent(message);
          if (!content) return null;

          return (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

