"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BadgeCheck, LayoutGrid, ShieldCheck } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/profile");
      }
    });
  }, [router]);

  async function submit() {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-section">
      <div className="site-container">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="brand-shell mesh-backdrop hidden min-h-[560px] lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-5">
              <div className="badge-chip">Masuk ke akun</div>
              <h1 className="text-4xl font-black leading-tight text-[color:var(--foreground)]">Masuk dan lanjutkan order dengan UI yang sekarang lebih clean dan profesional.</h1>
              <p className="max-w-md text-sm leading-8 text-[color:var(--foreground-soft)]">
                Halaman login dirapikan agar sesuai dengan tampilan marketplace digital modern: rapi, ringan, dan tetap fokus ke aksi utama.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: LayoutGrid, title: "Visual lebih ringan", body: "Form dan informasi pendukung dipisah jelas supaya mata user tidak cepat lelah." },
                { icon: ShieldCheck, title: "Terlihat meyakinkan", body: "Hierarki judul, tombol, dan field dibuat lebih konsisten di seluruh flow." },
                { icon: BadgeCheck, title: "Nyambung ke katalog", body: "Setelah login, pelanggan bisa langsung lanjut ke produk, pesanan, atau status transaksi." }
              ].map((item) => (
                <div key={item.title} className="brand-card flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[color:var(--foreground)]">{item.title}</div>
                    <p className="mt-1 text-sm leading-7">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5 sm:p-8">
            <div className="mx-auto max-w-xl space-y-6">
              <div>
                <div className="badge-chip lg:hidden">Selamat datang kembali</div>
                <div className="hidden lg:block brand-kicker">Selamat datang kembali</div>
                <h2 className="mt-3 text-3xl font-black text-[color:var(--foreground)]">Masuk untuk melanjutkan pesananmu.</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">Gunakan email dan password yang sudah terdaftar.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--foreground)]">Email</label>
                  <Input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--foreground)]">Password</label>
                  <Input type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <Button className="w-full" onClick={submit} disabled={loading}>
                {loading ? "Masuk..." : "Masuk ke akun"}
              </Button>

              <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4 text-sm leading-7 text-[color:var(--foreground-soft)]">
                Belum punya akun?{" "}
                <Link href="/register" className="font-semibold text-[color:var(--foreground)] underline underline-offset-4">
                  Buat akun sekarang
                </Link>
              </div>

              <Link href="/products" className="brand-link">
                Lihat katalog dulu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
