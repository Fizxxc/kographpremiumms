"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Sparkles, UserRoundPlus } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      toast.success("Akun berhasil dibuat. Kalau verifikasi email aktif, cek inbox kamu ya.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Register gagal");
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
              <div className="badge-chip">Buat akun baru</div>
              <h1 className="text-4xl font-black leading-tight text-[color:var(--foreground)]">Daftar sekali, lalu semua pesanan terasa lebih gampang dipantau.</h1>
              <p className="max-w-md text-sm leading-8 text-[color:var(--foreground-soft)]">
                Halaman pendaftaran juga ikut diperbarui agar sejalan dengan desain baru: form ringan, CTA jelas, dan tampilan tetap elegan di layar mobile.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: UserRoundPlus, title: "Onboarding lebih jelas", body: "User baru langsung tahu field penting yang harus diisi tanpa distraksi berlebihan." },
                { icon: Sparkles, title: "Nuansa marketplace modern", body: "Warna, card, dan tombol dibuat lebih konsisten seperti referensi desain yang Anda minta." },
                { icon: BadgeCheck, title: "Siap lanjut checkout", body: "Setelah daftar, pelanggan bisa langsung login dan kembali ke katalog dengan alur yang rapi." }
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
                <div className="badge-chip lg:hidden">Mulai lebih nyaman</div>
                <div className="hidden lg:block brand-kicker">Mulai lebih nyaman</div>
                <h2 className="mt-3 text-3xl font-black text-[color:var(--foreground)]">Daftar dan siapkan akunmu sekarang.</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">Isi data dasar dulu, setelah itu kamu bisa langsung lanjut ke katalog.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--foreground)]">Nama lengkap</label>
                  <Input placeholder="Nama lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--foreground)]">Email</label>
                  <Input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--foreground)]">Password</label>
                  <Input type="password" placeholder="Buat password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <Button className="w-full" onClick={submit} disabled={loading}>
                {loading ? "Membuat akun..." : "Buat akun"}
              </Button>

              <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4 text-sm leading-7 text-[color:var(--foreground-soft)]">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-[color:var(--foreground)] underline underline-offset-4">
                  Masuk sekarang
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
