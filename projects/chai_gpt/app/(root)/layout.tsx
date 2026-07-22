import { auth } from "@clerk/nextjs/server";
import React from "react";
import { onBoard } from "@/features/auth/action/onboards";
import { ChatShell } from "../../features/conversation/components/chat-shell";

const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
  await auth.protect();
  await onBoard();
  return (
    <div>
      <ChatShell>{children}</ChatShell>
    </div>
  );
};

export default RootGroupLayout;
