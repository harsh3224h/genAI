import { startNewChat } from "@/features/home/actions/start-new-chat";
import React from "react";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const page = async () => {
  const conversationId = await startNewChat();
  if (conversationId) {
    redirect(`/c/${conversationId}`);
  }
  return (
    <div>
      <UserButton />
    </div>
  );
};

export default page;
