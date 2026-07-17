import Image from "next/image";
import { ModeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      Theme <ModeToggle />
      <UserButton />
    </div>
  );
}
