import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://rqneahjmfgavjopmosda.supabase.co/**")],
  },
};

export default nextConfig;
