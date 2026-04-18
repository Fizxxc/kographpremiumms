import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/orders");
  }

  const [transactionsRes, topupsRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, order_id, public_order_code, status, final_amount, created_at, buyer_name, buyer_email, product_snapshot, variant_name, fulfillment_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("wallet_topups")
      .select("id, order_id, public_order_code, amount, status, created_at, fulfillment_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  const transactions = transactionsRes.data || [];
  const topups = topupsRes.data || [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.32em] text-brand-200">
              Riwayat transaksi
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Pesanan dan top up Anda</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Semua transaksi disusun dalam satu halaman agar lebih mudah dipantau, dicek ulang, dan diunduh invoicenya kapan pun dibutuhkan.
            </p>
          </div>
          <Link href="/products" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-100">
            Belanja lagi
          </Link>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Order produk</h2>
            <span className="text-sm text-slate-400">{transactions.length} transaksi</span>
          </div>
          {transactions.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.04] p-6 text-sm text-slate-300">
              Belum ada order produk. Setelah checkout berhasil, riwayatnya akan muncul di sini.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((order: any) => {
                const productName = order.product_snapshot?.name || "Produk";
                const manageHref = `/waiting-payment/${encodeURIComponent(order.order_id)}${order.public_order_code ? `?resi=${encodeURIComponent(order.public_order_code)}&type=transaction` : ""}`;
                const invoiceHref = `/api/invoice/${encodeURIComponent(order.order_id)}?${new URLSearchParams({
                  ...(order.public_order_code ? { resi: String(order.public_order_code) } : {}),
                  download: "1"
                }).toString()}`;

                return (
                  <article key={order.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_70px_rgba(2,6,23,0.24)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{order.status || "pending"}</span>
                          <span>{new Date(order.created_at).toLocaleString("id-ID")}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white">{productName}</h3>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            Order ID: <span className="font-semibold text-white">{order.order_id}</span>
                            {order.public_order_code ? (
                              <>
                                {" "}• Resi: <span className="font-semibold text-brand-200">{order.public_order_code}</span>
                              </>
                            ) : null}
                          </p>
                          {order.variant_name ? <p className="mt-1 text-sm text-slate-400">Varian: {order.variant_name}</p> : null}
                        </div>
                      </div>

                      <div className="min-w-[220px] rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                        <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Total pembayaran</div>
                        <div className="mt-2 text-2xl font-black text-white">{formatRupiah(Number(order.final_amount || 0))}</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={manageHref} className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 font-semibold text-brand-200 transition hover:bg-brand-500/20">
                            Kelola order
                          </Link>
                          <a href={invoiceHref} className="rounded-full border border-white/10 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5">
                            Invoice PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Top up saldo</h2>
            <span className="text-sm text-slate-400">{topups.length} transaksi</span>
          </div>
          {topups.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.04] p-6 text-sm text-slate-300">
              Belum ada transaksi top up.
            </div>
          ) : (
            <div className="space-y-4">
              {topups.map((topup: any) => {
                const manageHref = `/waiting-payment/${encodeURIComponent(topup.order_id)}${topup.public_order_code ? `?resi=${encodeURIComponent(topup.public_order_code)}&type=topup` : `?type=topup`}`;
                return (
                  <article key={topup.id} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.22)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Top up</div>
                        <h3 className="mt-2 text-lg font-black text-white">{formatRupiah(Number(topup.amount || 0))}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          Order ID: <span className="font-semibold text-white">{topup.order_id}</span>
                          {topup.public_order_code ? (
                            <>
                              {" "}• Resi: <span className="font-semibold text-brand-200">{topup.public_order_code}</span>
                            </>
                          ) : null}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">{new Date(topup.created_at).toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-200">
                          {topup.status || "pending"}
                        </span>
                        <Link href={manageHref} className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20">
                          Lihat status
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
