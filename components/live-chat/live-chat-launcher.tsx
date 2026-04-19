"use client";

import { useState } from "react";
import { MessageCircleMore, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LiveChatLauncher({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startChat = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/live-chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Gagal membuat room live chat.");
      router.push(`/chat/${data.roomId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuka live chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-panel mesh-backdrop overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <span className="brand-pill">
            <MessageCircleMore className="h-3.5 w-3.5" />
            Live chat siap membantu
          </span>
          <div>
            <h3 className="text-2xl font-black tracking-[-0.03em] text-[color:var(--foreground)]">Butuh tanya dulu sebelum checkout?</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--foreground-soft)]">
              Anda bisa membuka room chat khusus untuk produk ini agar proses konsultasi, pengarahan, dan tindak lanjut
              pesanan terasa lebih jelas di satu tempat.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Cocok untuk briefing, revisi, dan tanya progres pesanan
          </div>
        </div>

        <Button
          type="button"
          onClick={startChat}
          disabled={loading}
          className="h-12 rounded-full bg-[color:var(--accent)] px-6 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
        >
          {loading ? "Membuka room..." : "Buka live chat"}
          {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
