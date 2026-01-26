import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { backboard } from "@/lib/backboard"
import { z } from "zod"

const chatRequestSchema = z.object({
  content: z.string().min(1, "Message content is required"),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkId = await getCurrentUser()

    const body = await request.json()
    const { content } = chatRequestSchema.parse(body)

    const params = await context.params
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.user.clerkId !== clerkId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userMessage = await prisma.message.create({
      data: {
        role: "user",
        content,
        sessionId: params.id,
      },
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await backboard.addMessage(session.threadId, {
            content: userMessage.content,
            stream: true,
            llm_provider: "openai",
            model_name: "gpt-5-nano",
          }) as AsyncGenerator<{ type: string; content?: string }>

          const chunks: string[] = []

          for await (const chunk of responseStream) {
            if (chunk.type === "content_streaming" && chunk.content) {
              chunks.push(chunk.content)
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
              )
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))

          await prisma.message.create({
            data: {
              role: "assistant",
              content: chunks.join(""),
              sessionId: params.id,
            },
          })

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized: User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}