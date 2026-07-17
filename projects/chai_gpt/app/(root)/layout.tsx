import { auth } from "@clerk/nextjs/server";
import React from "react";
import { onBoard } from "@/features/auth/action/onboards";

const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
  await auth.protect();
  await onBoard();
  return <div>{children}</div>;
};

export default RootGroupLayout;
