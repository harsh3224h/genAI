import Image from "next/image";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div>
      Theme <ModeToggle />
    </div>
  );
}
