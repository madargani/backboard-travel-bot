import { auth } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { prisma } from "./prisma"

export async function getCurrentUser(): Promise<string> {
  const { userId } = await auth()

  if (userId) {
    return userId
  }

  if (process.env.NODE_ENV === "development") {
    const headersList = await headers()
    const devUserId = headersList.get("x-dev-user-id")

    if (devUserId) {
      console.log("⚠️ USING DEV BYPASS USER ID:", devUserId)
      return devUserId
    }
  }

  throw new Error("Unauthorized: User not authenticated")
}

export async function ensureUserExists(clerkId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        assistantId: "",
        email: "user@example.com",
        name: null,
      },
    })
  }

  return user
}