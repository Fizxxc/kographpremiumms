"use client";

import { useMemo, useState } from "react";
import { DatabaseZap, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function BulkCredentialUpload({
  products
}: {
  products: Array<{ id: string; name: string }>;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [format, setFormat] = useState<"txt" | "csv">("txt");
  const [payload, setPayload] = useState("");
  const [uploading, setUploading] = useState(false);

  const helperText = useMemo(() => {
    return format === "csv"
      ? "Format CSV: email,username,password atau username,password. Satu baris untuk satu credential."
      : "Format TXT: username:demo123 password:rahasia atau email:user@mail.com username:demo123 password:rahasia. Satu baris untuk satu credential.";
  }, [format]);

  async function upload() {
    if (!productId) {
      toast.error("Pilih produk terlebih dahulu.");
      return;
    }

    if (!payload.trim()) {
      toast.error("Masukkan credential yang ingin diunggah.");
      return;
    }

    setUploading(true);

    try {
      const response = await fetch("/api/admin/credentials/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, format, payload })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal upload credential.");

      toast.success(`${json.inserted} credential berhasil disimpan.`);
      setPayload("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal upload credential.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,31,0.96))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.24)]">
      <div className="mb-5 flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-300/10 text-brand-300">
          <DatabaseZap className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-black text-white">Bulk upload credential</div>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Tambahkan banyak akun sekaligus untuk stok produk digital. Data yang diunggah akan siap dipakai saat order berhasil masuk.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Produk</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none transition focus:border-brand-300"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id} className="bg-slate-900 text-slate-100">
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "txt" | "csv")}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none transition focus:border-brand-300"
          >
            <option value="txt" className="bg-slate-900 text-slate-100">TXT / key:value</option>
            <option value="csv" className="bg-slate-900 text-slate-100">CSV / comma separated</option>
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">Data credential</div>
        <Textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="min-h-[190px] border-0 bg-transparent text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
          placeholder={
            format === "csv"
              ? "email@example.com,username123,password123"
              : "email:email@example.com username:username123 password:password123"
          }
        />
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm leading-6 text-slate-300">
        {helperText}
      </div>

      <Button className="mt-4 w-full" onClick={upload} disabled={uploading}>
        <UploadCloud className="mr-2 h-4 w-4" />
        {uploading ? "Mengunggah credential..." : "Upload credential"}
      </Button>
    </Card>
  );
}
