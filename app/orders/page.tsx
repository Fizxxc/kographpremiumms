import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, FileText, RefreshCw, Wallet } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/orders");

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
    <div className="page-section">
      <div className="site-container flex flex-col gap-8">
        <section className="brand-shell mesh-backdrop">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="badge-chip">Riwayat transaksi</div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[color:var(--foreground)] sm:text-4xl">Pesanan dan top up Anda kini tampil lebih jelas.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-[color:var(--foreground-soft)]">
                Seluruh riwayat dipisah menjadi blok yang lebih rapih agar pelanggan gampang melihat status, resi, invoice, dan aksi lanjutan tanpa layout yang membingungkan.
              </p>
            </div>
            <Link href="/products" className="primary-button">Belanja lagi</Link>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[color:var(--foreground)]">Order produk</h2>
              <span className="text-sm text-[color:var(--foreground-soft)]">{transactions.length} transaksi</span>
            </div>
            {transactions.length === 0 ? (
              <div className="surface-card text-sm text-[color:var(--foreground-soft)]">Belum ada order produk. Setelah checkout berhasil, riwayatnya akan muncul di sini.</div>
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
                    <article key={order.id} className="surface-card">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--foreground-muted)]">
                            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-1">{order.status || "pending"}</span>
                            <span>{new Date(order.created_at).toLocaleString("id-ID")}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-[color:var(--foreground)]">{productName}</h3>
                            <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">
                              Order ID: <span className="font-semibold text-[color:var(--foreground)]">{order.order_id}</span>
                              {order.public_order_code ? <> · Resi: <span className="font-semibold text-[color:var(--accent-strong)]">{order.public_order_code}</span></> : null}
                            </p>
                            {order.variant_name ? <p className="mt-1 text-sm text-[color:var(--foreground-soft)]">Varian: {order.variant_name}</p> : null}
                          </div>
                        </div>

                        <div className="w-full max-w-[250px] rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4 text-sm text-[color:var(--foreground-soft)]">
                          <div className="brand-kicker">Total pembayaran</div>
                          <div className="mt-2 text-2xl font-black text-[color:var(--foreground)]">{formatRupiah(Number(order.final_amount || 0))}</div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link href={manageHref} className="secondary-button h-10 px-4 text-xs">Kelola order</Link>
                            <a href={invoiceHref} className="secondary-button h-10 px-4 text-xs"><FileText className="mr-2 h-4 w-4" />Invoice</a>
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
              <h2 className="text-xl font-black text-[color:var(--foreground)]">Top up saldo</h2>
              <span className="text-sm text-[color:var(--foreground-soft)]">{topups.length} transaksi</span>
            </div>
            {topups.length === 0 ? (
              <div className="surface-card text-sm text-[color:var(--foreground-soft)]">Belum ada transaksi top up.</div>
            ) : (
              <div className="space-y-4">
                {topups.map((topup: any) => {
                  const manageHref = `/waiting-payment/${encodeURIComponent(topup.order_id)}${topup.public_order_code ? `?resi=${encodeURIComponent(topup.public_order_code)}&type=topup` : `?type=topup`}`;
                  return (
                    <article key={topup.id} className="surface-card">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="brand-kicker flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Top up</div>
                          <h3 className="mt-2 text-lg font-black text-[color:var(--foreground)]">{formatRupiah(Number(topup.amount || 0))}</h3>
                          <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">
                            Order ID: <span className="font-semibold text-[color:var(--foreground)]">{topup.order_id}</span>
                            {topup.public_order_code ? <> · Resi: <span className="font-semibold text-[color:var(--accent-strong)]">{topup.public_order_code}</span></> : null}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--foreground-soft)]">{new Date(topup.created_at).toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--foreground)]">{topup.status || "pending"}</span>
                          <Link href={manageHref} className="secondary-button h-10 px-4 text-xs"><RefreshCw className="mr-2 h-4 w-4" />Lihat status</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="surface-card">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[color:var(--foreground)]">Riwayat lebih nyaman dipantau</h3>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">Blok order dan top up sekarang dipisah jelas, jadi pelanggan tidak perlu scroll layar yang terlalu padat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
