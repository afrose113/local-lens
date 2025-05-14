import type { NextConfig } from "next";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  // Keep your existing configs heres
};

export default nextConfig;