import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { getConversation } from "@/features/conversation/actions/conversation-actions";
import { ConversationView } from "@/features/conversation/components/conversation-view";
import { notFound } from "next/navigation";
import React from "react";

type ConversationPageProp = {
  params: Promise<{ id: string }>;
};

const page = async ({ params }: ConversationPageProp) => {
  const { id } = await params;

  try {
    await getConversation(id);
  } catch (error) {
    notFound();
  }

  const initialMessages = await loadChatMessages(id);

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={initialMessages}
    />
  );
};

export default page;
