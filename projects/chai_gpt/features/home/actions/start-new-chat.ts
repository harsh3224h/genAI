"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";

export async function startNewChat(){
  const user = await requireUser();
  const conversation = prisma.conversation.create({
    data: {
      userId: user.id,
      title: "New Chat"
    }
  });

  return (await conversation).id
}