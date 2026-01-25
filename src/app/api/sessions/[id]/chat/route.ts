import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
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
          const apiKey = process.env.BACKBOARD_API_KEY
          const apiUrl = process.env.BACKBOARD_API_URL

          if (!apiKey || !apiUrl) {
            throw new Error("Backboard API configuration missing")
          }

          const response = await fetch(`${apiUrl}/threads/${session.threadId}/run`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              threadId: session.threadId,
              message: userMessage.content,
            }),
          })

          if (!response.ok) {
            throw new Error(`Backboard API returned ${response.status}`)
          }

          const chunks: string[] = []
          const reader = response.body?.getReader()

          if (!reader) {
            throw new Error("No response body")
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            chunks.push(chunk)
            controller.enqueue(encoder.encode(chunk))
          }

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