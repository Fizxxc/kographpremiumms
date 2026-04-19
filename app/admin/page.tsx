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
import BannerManager from "@/components/admin/banner-manager";

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin");

  const [{ data: roles }, { data: products }, { data: popups }, { data: alerts }, { data: variants }, { data: coupons }, { data: transactions }, { data: topups }, { data: banners }] = await Promise.all([
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
      .limit(50),
    supabase.from("site_banners").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false })
  ]);

  const role = roles?.[0]?.role;
  if (role !== "admin") redirect("/");

  return (
    <div className="page-section">
      <div className="site-container space-y-8">
        <section className="brand-shell mesh-backdrop">
          <div className="badge-chip">Panel admin</div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
            <div>
              <h1 className="text-4xl font-black text-[color:var(--foreground)] sm:text-5xl">Kelola produk, penjualan, dan pengiriman credential dari satu tempat.</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--foreground-soft)] sm:text-lg">
                Bagian admin ikut diperbarui secara visual supaya dashboard utama lebih modern, rapi, dan nyaman dipakai untuk aktivitas operasional harian.
              </p>
            </div>
            <div className="brand-card text-sm leading-7 text-[color:var(--foreground-soft)]">
              Gunakan dashboard ini untuk melihat ringkasan penjualan, memperbarui katalog, mengelola promosi, dan memastikan pengiriman credential berjalan lebih rapi.
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

        <BannerManager banners={(banners || []) as any} />
        <ProductManager products={(products || []) as any} />
        <VariantManager products={(products || []) as any} variants={(variants || []) as any} />
        <BroadcastPanel />
        <SiteSettingsManager popups={(popups || []) as any} alerts={(alerts || []) as any} />
        <LiveChatAdminPanel />
      </div>
    </div>
  );
}
