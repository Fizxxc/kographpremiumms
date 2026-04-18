"use client";

import { useState } from "react";
import { Megaphone, Send, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SITE } from "@/lib/constants";

export function BroadcastPanel() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [settingWebhook, setSettingWebhook] = useState(false);

  async function sendBroadcast() {
    if (message.trim().length < 5) {
      toast.error("Tulis pesan broadcast minimal 5 karakter.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/admin/telegram/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal broadcast");

      toast.success(`Broadcast selesai. Berhasil ke ${json.sentCount} chat.`);
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal broadcast");
    } finally {
      setSending(false);
    }
  }

  async function setWebhook() {
    setSettingWebhook(true);

    try {
      const response = await fetch("/api/admin/telegram/set-webhook", { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal set webhook");
      toast.success("Webhook Telegram berhasil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal set webhook");
    } finally {
      setSettingWebhook(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,31,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.24)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-300/10 text-brand-300">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">Broadcast Telegram</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Kirim pengumuman promo, reminder pembayaran, atau update layanan ke seluruh pengguna bot dengan tampilan yang lebih rapi.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan broadcast di sini..."
            className="min-h-[140px] border-0 bg-transparent px-2 py-2 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300">
          <span>Gunakan pesan singkat, jelas, dan mudah dibaca di layar mobile.</span>
          <span>{message.trim().length} karakter</span>
        </div>

        <Button className="mt-4 w-full" onClick={sendBroadcast} disabled={sending}>
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Mengirim broadcast..." : "Kirim broadcast"}
        </Button>
      </Card>

      <Card className="border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,31,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.24)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-300">
            <Webhook className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">Webhook Telegram</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Sinkronkan bot cek order <span className="font-semibold text-white">@{SITE.botUsername}</span> dan auto order <span className="font-semibold text-white">@{SITE.autoOrderBotUsername}</span> ke endpoint terbaru.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
            Bot cek pesanan dan bot auto order akan diperbarui sekaligus agar status webhook tetap aktif dan konsisten.
          </div>
        </div>

        <Button className="mt-4 w-full" variant="secondary" onClick={setWebhook} disabled={settingWebhook}>
          {settingWebhook ? "Memasang webhook..." : "Perbarui webhook Telegram"}
        </Button>
      </Card>
    </div>
  );
}
