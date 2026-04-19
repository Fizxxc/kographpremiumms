"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleMore, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveChatLauncher({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleOpenChat() {
    setLoading(true);
    try {
      const response = await fetch("/api/live-chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Gagal membuka live chat.");
      router.push(`/chat/${result.roomId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuka live chat.";
      window.alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="brand-panel mesh-backdrop">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <span className="brand-pill">
            <MessageCircleMore className="h-3.5 w-3.5" />
            Konsultasi lebih cepat
          </span>
          <div>
            <h3 className="text-2xl font-black tracking-[-0.03em] text-[color:var(--foreground)]">Perlu tanya dulu sebelum beli?</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--foreground-soft)]">
              Buka room live chat khusus untuk produk ini supaya briefing, revisi kebutuhan, dan arahan dari admin tetap rapi
              dalam satu alur percakapan.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Cocok untuk jasa, custom request, dan follow up progres
          </div>
        </div>

        <Button onClick={handleOpenChat} disabled={loading} className="h-12 rounded-full bg-[color:var(--accent)] px-6 text-sm font-bold text-slate-950">
          {loading ? "Menyiapkan room..." : "Buka live chat"}
        </Button>
      </div>
    </div>
  );
}
