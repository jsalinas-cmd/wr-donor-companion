"use client";

import { useEffect, useState } from "react";
import PasswordGate from "@/components/PasswordGate";
import ChatUI from "@/components/ChatUI";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("wr-donor-unlocked") === "1") setUnlocked(true);
    } catch {}
    setHydrated(true);
  }, []);

  function lock() {
    try {
      sessionStorage.removeItem("wr-donor-unlocked");
    } catch {}
    setUnlocked(false);
  }

  if (!hydrated) return null;
  return unlocked ? <ChatUI onLock={lock} /> : <PasswordGate onUnlock={() => setUnlocked(true)} />;
}
