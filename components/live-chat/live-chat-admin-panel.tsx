import Link from "next/link";
import { MessageCircleMore, TimerReset } from "lucide-react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function formatStatus(status?: string | null) {
  switch (status) {
    case "pending":
      return { label: "pending", className: "border-amber-300/30 bg-amber-300/12 text-amber-700 dark:text-amber-200" };
    case "closed":
      return { label: "closed", className: "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground-soft)]" };
    default:
      return { label: "open", className: "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" };
  }
}

export default async function LiveChatAdminPanel() {
  const admin = createAdminSupabaseClient();
  const { data: rooms } = await admin
    .from("live_chat_rooms")
    .select("id, room_code, customer_name, status, created_at, last_message_at")
    .order("last_message_at", { ascending: false })
    .limit(8);

  return (
    <section className="brand-shell mesh-backdrop">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
              <MessageCircleMore className="h-5 w-5" />
            </div>
            <div>
              <div className="brand-kicker">Live chat ringkas</div>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[color:var(--foreground)] sm:text-[2rem]">Room terbaru yang perlu dipantau</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--foreground-soft)]">
                Saat buyer masih tanya detail order atau briefing jasa, admin bisa cek room aktif dari sini lalu lanjut ke halaman chat penuh.
              </p>
            </div>
          </div>

          <Link
            href="/chat"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
          >
            Buka semua room
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(rooms || []).length === 0 ? (
            <div className="brand-card text-sm text-[color:var(--foreground-soft)]">Belum ada room aktif.</div>
          ) : null}

          {(rooms || []).map((room: any) => {
            const status = formatStatus(room.status);
            const lastTime = room.last_message_at || room.created_at;
            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="group brand-card transition hover:-translate-y-0.5 hover:border-[rgba(245,207,83,0.25)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-lg font-black text-[color:var(--foreground)] transition group-hover:text-[color:var(--accent-strong)]">
                    {room.customer_name || room.room_code || room.id}
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${status.className}`}>{status.label}</span>
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--foreground-soft)]">Room code: {room.room_code || room.id}</div>
                <div className="mt-4 flex items-center gap-2 text-sm text-[color:var(--foreground-soft)]">
                  <TimerReset className="h-4 w-4" />
                  Terakhir aktif: {lastTime ? new Date(lastTime).toLocaleString("id-ID") : "-"}
                </div>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-[color:var(--foreground)]">Masuk ke room</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
