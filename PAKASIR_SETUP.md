# Pakasir setup

Tambahkan environment variable berikut di Vercel dan `.env.local`:

```env
PAKASIR_PROJECT_SLUG=slug_project_anda
PAKASIR_API_KEY=api_key_project_anda
PAKASIR_BASE_URL=https://app.pakasir.com
```

Webhook Pakasir arahkan ke:

```txt
https://domain-anda.com/api/webhook
```

Contoh halaman redirect status:

```txt
https://domain-anda.com/payment-status/[orderId]
```
