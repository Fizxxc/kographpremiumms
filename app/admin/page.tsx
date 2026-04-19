import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductManager } from "@/components/admin/product-manager";
import { BroadcastPanel } from "@/components/admin/broadcast-panel";
import SiteSettingsManager from "@/components/admin/site-settings-manager";
import LiveChatAdminPanel from "@/components/live-chat/live-chat-admin-panel";
import VariantManager from "@/components/admin/variant-manager";
import { CouponManager } from "@/components/admin/coupon-manager";
import { BulkCredentialUpload } from "@/components/admin/bulk-credential-upload";
import { AdminOverview } from "@/components/admin/admin-overview";

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin");

  const [{ data: roles }, { data: products }, { data: popups }, { data: alerts }, { data: variants }, { data: coupons }, { data: transactions }, { data: topups }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).limit(1),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("site_popups").select("*").order("created_at", { ascending: false }),
    supabase.from("site_alerts").select("*").order("created_at", { ascending: false }),
    supabase.from("product_variants").select("*").order("created_at", { ascending: false }),
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("order_id,status,final_amount,amount,created_at,buyer_name,product_snapshot")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("wallet_topups")
      .select("order_id,status,amount,created_at")
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  const role = roles?.[0]?.role;
  if (role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-primary/10 bg-[#031227] p-6 shadow-[0_24px_100px_rgba(2,6,23,0.35)] sm:p-8">
        <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary">
          Panel admin
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
          <div>
            <h1 className="text-4xl font-black text-white sm:text-5xl">Kelola produk, penjualan, dan pengiriman credential dari satu tempat.</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Semua kebutuhan operasional toko ditata dalam satu dashboard agar Anda bisa memantau performa produk,
              mengatur stok, mengelola promosi, dan memproses pesanan tanpa pindah-pindah halaman.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
            <p>Gunakan dashboard ini untuk melihat ringkasan penjualan, memperbarui katalog, dan memastikan pengiriman credential berjalan lebih rapi.</p>
          </div>
        </div>
      </section>

      <AdminOverview
        products={(products || []) as any}
        transactions={(transactions || []) as any}
        topups={(topups || []) as any}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <BulkCredentialUpload products={(products || []) as any} />
        <CouponManager initialCoupons={(coupons || []) as any} />
      </div>

      <ProductManager products={(products || []) as any} />
      <VariantManager products={(products || []) as any} variants={(variants || []) as any} />
      <BroadcastPanel />
      <SiteSettingsManager popups={(popups || []) as any} alerts={(alerts || []) as any} />
      <LiveChatAdminPanel />
    </div>
  );
}
