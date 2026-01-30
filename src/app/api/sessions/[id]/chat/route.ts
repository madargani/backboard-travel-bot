import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { backboard } from "@/lib/backboard";
import { executeTool } from "@/lib/tools";
import { z } from "zod";

const messagePartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(messagePartSchema),
});

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const clerkId = await getCurrentUser();

    const body = await request.json();
    const { messages } = chatRequestSchema.parse(body);

    const params = await context.params;
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user.clerkId !== clerkId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 },
      );
    }

    const content = lastMessage.parts
      .map((part: any) => (part.type === "text" ? part.text : ""))
      .join("");

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    const userMessage = await prisma.message.create({
      data: {
        role: "user",
        content,
        sessionId: params.id,
      },
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = (await backboard.addMessage(session.threadId, {
            content: userMessage.content,
            stream: true,
            llm_provider: "openai",
            model_name: "gpt-5-nano",
          })) as AsyncGenerator<any>;

          const chunks: string[] = [];
          for await (const chunk of responseStream) {
            if (chunk.type === "content_streaming" && chunk.content) {
              chunks.push(chunk.content);
              controller.enqueue(chunk.content);
            } else if (
              chunk.type === "tool_submit_required" &&
              chunk.tool_calls
            ) {
              const toolOutputs = chunk.tool_calls.map((tc: any) => {
                let toolArgs = JSON.parse(tc.function.arguments);

                const output = executeTool(tc.function.name, toolArgs);

                return {
                  tool_call_id: tc.id,
                  output,
                };
              });

              const toolStream = (await backboard.submitToolOutputs(
                session.threadId,
                chunk.run_id,
                toolOutputs,
                true,
              )) as AsyncGenerator<any, any, any>;

              for await (const toolChunk of toolStream) {
                if (
                  toolChunk.type === "content_streaming" &&
                  toolChunk.content
                ) {
                  chunks.push(toolChunk.content);
                  controller.enqueue(toolChunk.content);
                } else if (toolChunk.type === "message_complete") {
                  break;
                }
              }

              await prisma.message.create({
                data: {
                  role: "assistant",
                  content: chunks.join(""),
                  sessionId: params.id,
                },
              });

              controller.close();
              return;
            } else if (chunk.type === "message_complete") {
              break;
            }
          }

          if (chunks.length > 0) {
            await prisma.message.create({
              data: {
                role: "assistant",
                content: chunks.join(""),
                sessionId: params.id,
              },
            });
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "Unauthorized: User not authenticated"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
