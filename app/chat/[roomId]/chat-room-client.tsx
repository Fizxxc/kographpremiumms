"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink, ImagePlus, Link2, MessageCircleMore, Send, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";

export function ChatRoomClient({ roomId }: { roomId: string }) {
  const [data, setData] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/live-chat/messages?roomId=${roomId}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal memuat chat");
    setData(json);
  }

  async function loadCatalog() {
    const res = await fetch("/api/live-chat/catalog", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) setCatalog(json.products || []);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
    loadCatalog().catch(() => null);
    const id = setInterval(() => load().catch(() => null), 5000);
    return () => clearInterval(id);
  }, [roomId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [data?.messages?.length]);

  async function send(imageUrl?: string) {
    if (!message.trim() && !linkUrl.trim() && !imageUrl) return;
    setSending(true);
    try {
      const res = await fetch("/api/live-chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, message, linkUrl, imageUrl })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal kirim");
      setMessage("");
      setLinkUrl("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal kirim");
    } finally {
      setSending(false);
    }
  }

  async function upload(file?: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/live-chat/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal");
      await send(json.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function orderFromChat(productId: string) {
    const paymentMethod = "qris" as const;
    setOrdering(`${productId}:${paymentMethod}`);
    try {
      const res = await fetch("/api/live-chat/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, productId, paymentMethod })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat order");
      toast.success("QRIS pembayaran sudah dikirim ke room chat.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat order");
    } finally {
      setOrdering(null);
    }
  }

  const roomTitle = useMemo(
    () => (data?.room ? (Array.isArray(data.room.products) ? data.room.products[0]?.name : data.room.products?.name) : "Live chat"),
    [data]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="brand-shell mesh-backdrop">
          <div className="space-y-4">
            <span className="brand-pill">
              <MessageCircleMore className="h-3.5 w-3.5" />
              Room aktif
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--foreground)] sm:text-4xl">
                {data?.room?.title || roomTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--foreground-soft)]">
                Semua admin bisa melihat room ini. Anda dapat briefing, mengirim referensi, upload gambar, lalu lanjut
                order langsung dari room yang sama agar percakapan tetap rapi.
              </p>
            </div>
          </div>
        </section>

        <section className="brand-panel border-[rgba(245,207,83,0.22)] bg-[linear-gradient(135deg,rgba(245,207,83,0.14),transparent_60%),var(--card)]">
          <div className="flex items-center gap-3 text-[color:var(--foreground)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-slate-950">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Order langsung dari live chat</h2>
              <p className="text-sm text-[color:var(--foreground-soft)]">Hanya produk ready stock yang ditampilkan.</p>
            </div>
          </div>

          <div className="mt-5 max-h-[380px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
            {catalog.length ? (
              catalog.map((item) => (
                <div key={item.id} className="brand-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-bold text-[color:var(--foreground)]">{item.name}</div>
                      <div className="mt-1 text-sm text-[color:var(--foreground-soft)]">
                        {formatRupiah(item.price)} • stok {item.stock}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-strong)] p-2 text-[color:var(--foreground)]">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                  <Button
                    className="mt-4 h-11 w-full rounded-full bg-[color:var(--accent)] text-sm font-bold text-slate-950 hover:-translate-y-0.5"
                    disabled={ordering !== null}
                    onClick={() => orderFromChat(item.id)}
                  >
                    {ordering === `${item.id}:qris` ? "Memproses..." : "Bayar via QRIS dinamis"}
                  </Button>
                </div>
              ))
            ) : (
              <div className="brand-card text-sm leading-7 text-[color:var(--foreground-soft)]">
                Belum ada produk ready stock untuk order cepat dari chat.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section ref={listRef} className="brand-shell max-h-[68vh] space-y-4 overflow-y-auto scrollbar-thin">
          {data?.messages?.length ? (
            data.messages.map((item: any) => {
              const isAdmin = item.sender_role === "admin";
              const isSystem = item.sender_role === "system";
              return (
                <div
                  key={item.id}
                  className={`max-w-[90%] rounded-[26px] border p-4 sm:p-5 ${
                    isAdmin
                      ? "ml-auto border-[rgba(245,207,83,0.25)] bg-[rgba(245,207,83,0.12)]"
                      : isSystem
                        ? "mx-auto border-emerald-500/20 bg-emerald-500/10"
                        : "border-[color:var(--border)] bg-[color:var(--card)]"
                  }`}
                >
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--foreground-soft)]">
                    {item.sender_role} • {new Date(item.created_at).toLocaleString("id-ID")}
                  </div>
                  {item.message ? <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[color:var(--foreground)]">{item.message}</div> : null}
                  {item.image_url ? <img src={item.image_url} alt="chat image" className="mt-3 max-h-80 rounded-[22px] object-cover" /> : null}
                  {item.link_url ? (
                    <button
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300"
                      onClick={() => setPreviewUrl(item.link_url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buka link / pembayaran
                    </button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="brand-card text-sm leading-7 text-[color:var(--foreground-soft)]">Belum ada pesan. Silakan mulai percakapan.</div>
          )}
        </section>

        <aside className="brand-panel space-y-4">
          <div>
            <div className="brand-kicker">Kirim pesan</div>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Jelaskan kebutuhan Anda dengan lebih rapi</h2>
            <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">
              Tambahkan pesan, link referensi, atau gambar agar admin lebih mudah memahami kebutuhan Anda.
            </p>
          </div>

          <Textarea
            rows={7}
            placeholder="Tulis pesan ke admin..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-[24px] border-[color:var(--border)] bg-[color:var(--card-strong)] text-[color:var(--foreground)]"
          />

          <div className="relative">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--foreground-soft)]" />
            <Input
              className="h-12 rounded-full border-[color:var(--border)] bg-[color:var(--card-strong)] pl-11 text-[color:var(--foreground)]"
              placeholder="Tempel link referensi jika ada"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
            <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5">
              <ImagePlus className="h-4 w-4" />
              Upload gambar
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0] || null)} />
            </label>
            <Button
              onClick={() => send()}
              disabled={sending || uploading}
              className="h-12 rounded-full bg-[color:var(--accent)] text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
            >
              {sending || uploading ? "Mengirim..." : (
                <>
                  Kirim pesan
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </aside>
      </div>

      {previewUrl ? (
        <div className="fixed inset-0 z-50 bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[color:var(--background-soft)] shadow-[var(--shadow)]">
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border)] px-4 py-3">
              <div className="truncate text-sm font-medium text-[color:var(--foreground)]">{previewUrl}</div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]"
                onClick={() => setPreviewUrl(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe src={previewUrl} className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
