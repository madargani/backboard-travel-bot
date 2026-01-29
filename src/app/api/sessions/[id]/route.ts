import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const updateSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkId = await getCurrentUser()

    const params = await context.params
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.user.clerkId !== clerkId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const response = {
      id: session.id,
      title: session.title,
      threadId: session.threadId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      })),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized: User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkId = await getCurrentUser()

    const params = await context.params
    const body = await request.json()

    const validationResult = updateSessionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title } = validationResult.data

    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.user.clerkId !== clerkId) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to update this session" }, { status: 403 })
    }

    const updatedSession = await prisma.session.update({
      where: { id: params.id },
      data: { title },
      include: { user: true },
    })

    const response = {
      id: updatedSession.id,
      title: updatedSession.title,
      threadId: updatedSession.threadId,
      createdAt: updatedSession.createdAt,
      updatedAt: updatedSession.updatedAt,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized: User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}