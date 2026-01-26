import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, ensureUserExists } from "@/lib/auth";
import { backboard } from "@/lib/backboard";

export async function POST(request: NextRequest) {
  try {
    const clerkId = await getCurrentUser();
    const user = await ensureUserExists(clerkId);

    const thread = await backboard.createThread(user.assistantId);

    const session = await prisma.session.create({
      data: {
        title: "New Trip",
        userId: user.id,
        threadId: thread.threadId,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
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

export async function GET(request: NextRequest) {
  try {
    const clerkId = await getCurrentUser();
    const user = await ensureUserExists(clerkId);

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
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

