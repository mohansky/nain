import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-761e45150f674d1c908c265aa496f1b0.r2.dev",
        port: "",
        pathname: "/**",
      },
      // If you plan to use a custom domain later, add it here too:
      // {
      //   protocol: 'https',
      //   hostname: 'images.yourdomain.com',
      //   port: '',
      //   pathname: '/**',
      // }
    ],
  },
};

export default nextConfig;
