"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Images, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export type BannerItem = {
  id: string;
  title?: string | null;
  image_url: string;
  button_href?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

const initialForm = {
  title: "",
  image_url: "",
  button_href: "",
  sort_order: 0,
  is_active: true
};

export default function BannerManager({ banners }: { banners: BannerItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<BannerItem | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const [deleteLabel, setDeleteLabel] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.image_url.trim()) return toast.error("Link banner wajib diisi.");

    try {
      setLoading(true);
      const response = await fetch("/api/admin/site-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          image_url: form.image_url,
          button_href: form.button_href,
          sort_order: Number(form.sort_order || 0),
          is_active: form.is_active
        })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(json.error || "Gagal menyimpan banner."));
      toast.success("Banner berhasil ditambahkan.");
      setForm(initialForm);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Gagal menyimpan banner.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItem) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/site-banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(json.error || "Gagal mengubah banner."));
      toast.success("Banner berhasil diperbarui.");
      setEditingItem(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Gagal mengubah banner.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/site-banners?id=${encodeURIComponent(deleteId)}`, { method: "DELETE" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(json.error || "Gagal menghapus banner."));
      toast.success("Banner berhasil dihapus.");
      setDeleteId("");
      setDeleteLabel("");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus banner.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(4,14,31,0.98)_0%,_rgba(9,24,49,0.97)_55%,_rgba(14,39,71,0.95)_100%)] p-5 text-white shadow-[0_30px_90px_-45px_rgba(2,6,23,0.9)] sm:p-6 lg:p-7">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">
            Banner hero
          </div>
          <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-[2rem]">Kelola banner halaman depan langsung dari dashboard admin.</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Tempel link gambar banner secara manual, atur urutan tampil, lalu aktifkan banner yang ingin dimasukkan ke slider hero di halaman utama.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                <Images className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Tambah banner</div>
                <div className="mt-1 text-xl font-black text-white">Masukkan banner baru untuk hero.</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Judul internal banner (opsional)" />
              <Input value={form.image_url} onChange={(e) => setForm((s) => ({ ...s, image_url: e.target.value }))} placeholder="https://... atau public URL banner" />
              <Input value={form.button_href} onChange={(e) => setForm((s) => ({ ...s, button_href: e.target.value }))} placeholder="Link tujuan saat banner diklik (opsional)" />
              <Input type="number" value={String(form.sort_order)} onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value || 0) }))} placeholder="Urutan tampil" />
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))} />
                Tampilkan banner ini di halaman utama
              </label>
              <Button type="submit" disabled={loading || !form.image_url.trim()} className="w-fit rounded-full bg-amber-300 px-6 text-slate-950 hover:bg-amber-200 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Menyimpan..." : "Simpan banner"}
              </Button>
            </form>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {banners.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-slate-300 lg:col-span-2">
                Belum ada banner tersimpan. Setelah SQL baru dijalankan, admin bisa mulai menambahkan banner manual dari panel ini.
              </div>
            ) : null}

            {banners.map((banner) => (
              <div key={banner.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="relative aspect-[16/8] overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/40">
                  <Image src={banner.image_url} alt={banner.title || "Banner hero"} fill className="object-cover" unoptimized />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {banner.is_active ? <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">aktif</span> : <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">draft</span>}
                  <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">urutan {banner.sort_order || 0}</span>
                </div>
                <div className="mt-3 text-lg font-black text-white">{banner.title || "Banner tanpa judul"}</div>
                <div className="mt-2 break-all text-xs leading-6 text-slate-400">{banner.image_url}</div>
                {banner.button_href ? <div className="mt-1 break-all text-xs leading-6 text-amber-200">Tujuan: {banner.button_href}</div> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" className="h-9 rounded-full px-4" onClick={() => setEditingItem(banner)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" className="h-9 rounded-full px-4" onClick={() => { setDeleteId(banner.id); setDeleteLabel(banner.title || "Banner tanpa judul"); }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,_rgba(4,14,31,0.98)_0%,_rgba(9,24,49,0.97)_55%,_rgba(14,39,71,0.95)_100%)] p-5 text-white shadow-[0_30px_90px_-45px_rgba(2,6,23,0.9)] sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Edit banner</div>
            <div className="mt-2 text-2xl font-black text-white">Perbarui banner hero</div>
            <form onSubmit={handleUpdate} className="mt-5 grid gap-4">
              <Input value={editingItem.title || ""} onChange={(e) => setEditingItem((s) => (s ? { ...s, title: e.target.value } : s))} placeholder="Judul internal banner" />
              <Input value={editingItem.image_url || ""} onChange={(e) => setEditingItem((s) => (s ? { ...s, image_url: e.target.value } : s))} placeholder="Link gambar banner" />
              <Input value={editingItem.button_href || ""} onChange={(e) => setEditingItem((s) => (s ? { ...s, button_href: e.target.value } : s))} placeholder="Link tujuan saat banner diklik" />
              <Input type="number" value={String(editingItem.sort_order || 0)} onChange={(e) => setEditingItem((s) => (s ? { ...s, sort_order: Number(e.target.value || 0) } : s))} placeholder="Urutan tampil" />
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" checked={Boolean(editingItem.is_active)} onChange={(e) => setEditingItem((s) => (s ? { ...s, is_active: e.target.checked } : s))} />
                Tampilkan banner ini di halaman utama
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={loading || !editingItem.image_url.trim()} className="rounded-full bg-amber-300 px-6 text-slate-950 hover:bg-amber-200 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? "Menyimpan..." : "Simpan perubahan"}
                </Button>
                <Button type="button" variant="secondary" className="rounded-full px-6" onClick={() => setEditingItem(null)}>
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Hapus banner?"
        description={`Banner \"${deleteLabel}\" akan dihapus dari daftar hero.`}
        confirmText="Ya, hapus"
        cancelText="Batal"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (loading) return;
          setDeleteId("");
          setDeleteLabel("");
        }}
      />
    </>
  );
}
