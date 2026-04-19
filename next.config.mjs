const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseHostname;

try {
  supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
} catch {
  supabaseHostname = undefined;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**"
            },
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/sign/**"
            }
          ]
        : []),
      {
        protocol: "https",
        hostname: "**.supabase.co"
      }
    ]
  }
};

export default nextConfig;
