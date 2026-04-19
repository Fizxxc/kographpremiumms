import { formatDate, formatRupiah } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  category?: string | null;
  stock?: number | null;
  sold_count?: number | null;
  price?: number | null;
  is_active?: boolean | null;
};

type TransactionRow = {
  order_id: string;
  status?: string | null;
  final_amount?: number | null;
  amount?: number | null;
  created_at?: string | null;
  buyer_name?: string | null;
  product_snapshot?: { product_name?: string | null } | null;
};

type TopupRow = {
  order_id: string;
  status?: string | null;
  amount?: number | null;
  created_at?: string | null;
};

type Props = {
  products: ProductRow[];
  transactions: TransactionRow[];
  topups: TopupRow[];
};

function normalizePaid(status?: string | null) {
  return ["settlement", "success", "paid", "completed"].includes(String(status || "").toLowerCase());
}

export function AdminOverview({ products, transactions, topups }: Props) {
  const paidTransactions = transactions.filter((item) => normalizePaid(item.status));
  const pendingTransactions = transactions.filter((item) => String(item.status || "pending").toLowerCase() === "pending");
  const paidTopups = topups.filter((item) => normalizePaid(item.status));
  const totalRevenue = paidTransactions.reduce((sum, item) => sum + Number(item.final_amount || item.amount || 0), 0);
  const totalTopup = paidTopups.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const activeProducts = products.filter((item) => item.is_active !== false).length;

  const chartLabels = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  const chartData = chartLabels.map((date) => {
    const key = date.toISOString().slice(0, 10);
    const value = paidTransactions
      .filter((item) => String(item.created_at || "").slice(0, 10) === key)
      .reduce((sum, item) => sum + Number(item.final_amount || item.amount || 0), 0);
    return {
      label: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(date),
      value
    };
  });

  const maxChart = Math.max(...chartData.map((item) => item.value), 1);
  const topProducts = [...products].sort((a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0)).slice(0, 6);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(String(b.created_at || 0)).getTime() - new Date(String(a.created_at || 0)).getTime())
    .slice(0, 6);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="brand-kicker">Ringkasan admin</div>
          <h2 className="mt-2 text-3xl font-black text-[color:var(--foreground)] sm:text-4xl">Pantau penjualan, stok, dan transaksi dari satu tampilan.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--foreground-soft)] sm:text-base">
            Dashboard utama sekarang ikut dirapikan supaya angka penting, grafik, dan tabel transaksi terasa lebih ringan dibaca.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Produk aktif", value: String(activeProducts), note: "Produk yang sedang ditampilkan" },
          { label: "Pesanan dibayar", value: String(paidTransactions.length), note: "Transaksi berhasil" },
          { label: "Menunggu pembayaran", value: String(pendingTransactions.length), note: "Perlu dipantau" },
          { label: "Omzet produk", value: formatRupiah(totalRevenue), note: `Top up masuk ${formatRupiah(totalTopup)}` }
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="brand-kicker">{item.label}</div>
            <div className="mt-3 text-3xl font-black text-[color:var(--foreground)]">{item.value}</div>
            <p className="mt-2 text-sm text-[color:var(--foreground-soft)]">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="surface-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="brand-kicker">Grafik 7 hari terakhir</div>
              <h3 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Penjualan harian</h3>
            </div>
            <div className="text-sm text-[color:var(--foreground-soft)]">Total {formatRupiah(totalRevenue)}</div>
          </div>
          <div className="mt-6 flex h-64 items-end gap-3 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4">
            {chartData.map((item) => (
              <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-3">
                <div className="relative flex-1 rounded-2xl bg-white">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-2xl bg-[linear-gradient(180deg,#ffd95c_0%,#f3b203_100%)]"
                    style={{ height: `${Math.max(12, Math.round((item.value / maxChart) * 100))}%` }}
                  />
                </div>
                <div className="text-center text-xs font-semibold text-[color:var(--foreground-soft)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <div className="brand-kicker">Produk terlaris</div>
          <h3 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Pergerakan stok & penjualan</h3>
          <div className="mt-5 space-y-3">
            {topProducts.length ? topProducts.map((item) => (
              <div key={item.id} className="brand-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-bold text-[color:var(--foreground)]">{item.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.25em] text-[color:var(--foreground-muted)]">{item.category || "Produk"}</div>
                  </div>
                  <div className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold text-[color:var(--accent-strong)]">
                    {formatRupiah(Number(item.price || 0))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-3">
                    <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--foreground-muted)]">Stok</div>
                    <div className="mt-2 text-2xl font-black text-[color:var(--foreground)]">{Number(item.stock || 0)}</div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-3">
                    <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--foreground-muted)]">Terjual</div>
                    <div className="mt-2 text-2xl font-black text-[color:var(--foreground)]">{Number(item.sold_count || 0)}</div>
                  </div>
                </div>
              </div>
            )) : <div className="rounded-[22px] border border-dashed border-[color:var(--border)] p-4 text-sm text-[color:var(--foreground-soft)]">Belum ada data produk untuk ditampilkan.</div>}
          </div>
        </div>
      </div>

      <div className="surface-card overflow-x-auto">
        <div className="brand-kicker">Transaksi terbaru</div>
        <h3 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Ringkasan order terakhir</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-[color:var(--foreground)]">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-xs uppercase tracking-[0.25em] text-[color:var(--foreground-muted)]">
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Produk</th>
                <th className="px-3 py-3">Pembeli</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Nominal</th>
                <th className="px-3 py-3">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length ? recentTransactions.map((item) => (
                <tr key={item.order_id} className="border-b border-[color:var(--border)] last:border-0">
                  <td className="px-3 py-4 font-semibold">{item.order_id}</td>
                  <td className="px-3 py-4">{item.product_snapshot?.product_name || "Produk digital"}</td>
                  <td className="px-3 py-4">{item.buyer_name || "Guest"}</td>
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--foreground)]">
                      {String(item.status || "pending")}
                    </span>
                  </td>
                  <td className="px-3 py-4">{formatRupiah(Number(item.final_amount || item.amount || 0))}</td>
                  <td className="px-3 py-4 text-[color:var(--foreground-soft)]">{item.created_at ? formatDate(item.created_at) : "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-[color:var(--foreground-soft)]">Belum ada transaksi yang tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
