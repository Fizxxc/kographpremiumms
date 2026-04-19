import { SITE } from "@/lib/constants";

export default function ReportPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="surface-card p-8 md:p-10">
          <div className="badge-chip">Report</div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Laporkan kendala</h1>
          <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
            Jika Anda menemukan kendala pada pembayaran, pengiriman credential, invoice, atau detail pesanan lainnya, silakan hubungi tim kami melalui kanal resmi berikut.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a href={`mailto:${SITE.support.email}`} className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-5 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-amber-300/30 dark:hover:bg-white/10">
              Email support<br />
              <span className="text-base font-black">{SITE.support.email}</span>
            </a>
            <a href={`https://t.me/${SITE.support.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-5 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-amber-300/30 dark:hover:bg-white/10">
              Telegram bot<br />
              <span className="text-base font-black">{SITE.support.telegram}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
