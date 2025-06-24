"use client";

import { useSession } from "@/lib/auth-client";
import Dock from "./dock";

export default function DockWrapper() {
  const { data: session, isPending } = useSession();

  if (isPending === true) return null; // Optional: add loading fallback
  if (!session) return null;

  return <Dock />;
}
