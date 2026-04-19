import { Boxes, LayoutGrid, ShieldCheck, Tags } from "lucide-react";
import ProductCard from "@/components/product-card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const admin = createAdminSupabaseClient();
  const { data: products } = await admin
    .from("products")
    .select(`id, name, description, price, category, image_url, stock, sold_count, is_active, featured,
      product_variants ( id, price, is_active )`)
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const list = (products || []).map((item: any) => ({
    ...item,
    product_variants: Array.isArray(item.product_variants) ? item.product_variants.filter((variant: any) => variant.is_active) : []
  }));

  return (
    <div className="page-section">
      <div className="site-container space-y-8">
        <section className="brand-shell mesh-backdrop reveal-up">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div className="space-y-4">
              <div className="badge-chip">Katalog produk</div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[color:var(--foreground)] md:text-5xl">
                Semua produk kini tampil <span className="text-gradient">lebih rapih, ringan, dan gampang dibandingkan</span>
              </h1>
              <p className="max-w-3xl text-sm leading-8 text-[color:var(--foreground-soft)] md:text-base">
                Referensi gaya UI baru diadaptasi ke katalog ini supaya pelanggan langsung fokus ke nama produk, harga,
                kategori, dan tombol beli tanpa tampilan yang terasa ramai.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="brand-card">
                <div className="flex items-center gap-2 text-sm font-black text-[color:var(--foreground)]"><LayoutGrid className="h-4 w-4 text-[color:var(--accent-strong)]" /> Kartu lebih jelas</div>
                <p className="mt-2 text-sm leading-7">Heading, harga, stok, dan status populer kini dipisah dengan hirarki visual yang lebih enak dibaca.</p>
              </div>
              <div className="brand-card">
                <div className="flex items-center gap-2 text-sm font-black text-[color:var(--foreground)]"><ShieldCheck className="h-4 w-4 text-[color:var(--accent-strong)]" /> Lebih meyakinkan</div>
                <p className="mt-2 text-sm leading-7">Warna CTA, badge, dan grid dibuat lebih konsisten agar pengalaman belanja terasa profesional.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <div className="flex items-center gap-2 brand-kicker"><Boxes className="h-3.5 w-3.5" /> Total produk</div>
              <div className="mt-3 text-3xl font-black">{list.length}</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 brand-kicker"><Tags className="h-3.5 w-3.5" /> Featured</div>
              <div className="mt-3 text-3xl font-black">{list.filter((item: any) => item.featured).length}</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 brand-kicker"><LayoutGrid className="h-3.5 w-3.5" /> Varian aktif</div>
              <div className="mt-3 text-3xl font-black">{list.reduce((sum: number, item: any) => sum + (item.product_variants?.length || 0), 0)}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {list.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </div>
    </div>
  );
}
