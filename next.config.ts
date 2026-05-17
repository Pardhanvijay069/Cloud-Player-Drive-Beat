import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_GOOGLE_PICKER_API_KEY: process.env.GOOGLE_PICKER_API_KEY
  }
};

export default nextConfig;
