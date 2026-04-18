"use client";

import { useMemo, useState } from "react";
import { BadgePercent, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CouponManager({ initialCoupons }: { initialCoupons: any[] }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [quota, setQuota] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState(initialCoupons);

  const preview = useMemo(() => {
    if (!value) return "Atur benefit kupon agar mudah dikenali pelanggan.";
    return type === "percentage"
      ? `Diskon ${value}%${maxDiscount ? ` hingga Rp ${Number(maxDiscount || 0).toLocaleString("id-ID")}` : ""}`
      : `Potongan langsung Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }, [maxDiscount, type, value]);

  async function saveCoupon() {
    if (!code.trim() || !value) {
      toast.error("Kode kupon dan nilai diskon wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value: Number(value),
          minOrder: minOrder ? Number(minOrder) : 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
          quota: quota ? Number(quota) : null,
          active
        })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal menyimpan kupon.");

      setCoupons((prev) => [json.coupon, ...prev]);
      toast.success("Kupon berhasil disimpan.");
      setCode("");
      setValue("");
      setMinOrder("");
      setMaxDiscount("");
      setQuota("");
      setActive(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan kupon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,31,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.24)]">
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-300/10 text-brand-300">
            <BadgePercent className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">Buat kupon promo</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Atur promo dengan tampilan yang lebih rapi agar mudah dibagikan ke pelanggan dan lebih nyaman dikelola dari dashboard.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Kode kupon</label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="border-white/10 bg-white/5 text-slate-100" placeholder="Mis. WELCOME10" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Tipe diskon</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none transition focus:border-brand-300"
            >
              <option value="percentage" className="bg-slate-900 text-slate-100">Percentage</option>
              <option value="fixed" className="bg-slate-900 text-slate-100">Nominal tetap</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Nilai diskon</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} className="border-white/10 bg-white/5 text-slate-100" placeholder={type === "percentage" ? "Contoh: 10" : "Contoh: 5000"} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Minimal belanja</label>
            <Input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="border-white/10 bg-white/5 text-slate-100" placeholder="Opsional" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Maksimal potongan</label>
            <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} className="border-white/10 bg-white/5 text-slate-100" placeholder="Opsional" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Kuota penggunaan</label>
            <Input value={quota} onChange={(e) => setQuota(e.target.value)} className="border-white/10 bg-white/5 text-slate-100" placeholder="Opsional" />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-amber-400"
          />
          <span>Aktifkan kupon setelah disimpan</span>
        </label>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-300">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Preview promo</div>
          <div className="mt-2 font-semibold text-white">{preview}</div>
        </div>

        <Button className="mt-4 w-full" onClick={saveCoupon} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          {loading ? "Menyimpan kupon..." : "Simpan kupon"}
        </Button>
      </Card>

      <Card className="border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,31,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.24)]">
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-300">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">Daftar kupon</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">Ringkasan kupon aktif maupun nonaktif yang sudah tersedia di sistem.</p>
          </div>
        </div>

        <div className="space-y-3">
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-black tracking-wide text-white">{coupon.code}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {coupon.type === "percentage" ? `${coupon.value}%` : `Rp ${Number(coupon.value || 0).toLocaleString("id-ID")}`}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${coupon.active ? "bg-emerald-300/15 text-emerald-300" : "bg-slate-300/10 text-slate-400"}`}>
                    {coupon.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="mt-3 text-xs leading-6 text-slate-400">
                  Minimal belanja: Rp {Number(coupon.min_order || 0).toLocaleString("id-ID")} • Dipakai {Number(coupon.used_count || 0)} kali
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
              Belum ada kupon yang dibuat.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
