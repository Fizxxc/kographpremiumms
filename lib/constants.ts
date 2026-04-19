export const SITE = {
  name: "Kograph Premium",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kographpremiapp.vercel.app",
  description:
    "Marketplace layanan digital dengan pengalaman belanja yang rapi, nyaman, dan mudah dipantau dari awal sampai pesanan selesai.",
  botUsername: "@cs_KographBot",
  autoOrderBotUsername: "@KographmarketsBot",
  support: {
    whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "kographh@gmail.com",
    telegram: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "@cs_KographBot"
  },
  socials: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
    tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "",
    telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || "@KographmarketsBot"
  },
  legal: {
    termsUrl: "/terms",
    privacyUrl: "/privacy-policy",
    faqUrl: "/faq",
    reportIssueUrl: "/report"
  }
} as const;

export const NAV_CATEGORIES = [
  "Streaming",
  "Aplikasi Premium",
  "Voucher",
  "Game",
  "Panel",
  "Top Up",
  "Sosial Media",
  "Membership",
  "Lainnya"
] as const;

export const QUICK_TOPUP_AMOUNTS = [10000, 20000, 50000, 100000, 200000] as const;

export const PANEL_RAM_PRESETS = [
  { key: "1gb", label: "1 GB", ramMb: 1024 },
  { key: "2gb", label: "2 GB", ramMb: 2048 },
  { key: "4gb", label: "4 GB", ramMb: 4096 },
  { key: "8gb", label: "8 GB", ramMb: 8192 },
  { key: "16gb", label: "16 GB", ramMb: 16384 }
] as const;