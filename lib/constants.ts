export const SITE = {
  name: "Kograph Premium",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kographpremiapp.vercel.app",
  description:
    "Marketplace layanan digital dengan alur belanja yang rapi, pembayaran yang jelas, dan proses pesanan yang nyaman diikuti.",
  botUsername: "@KographcekBot",
  autoOrderBotUsername: "@KographmarketsBot",
  support: {
    whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@kographpremium.com",
    telegram: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "@KographcekBot"
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
    reportIssueUrl: "/report-issue"
  }
} as const;
