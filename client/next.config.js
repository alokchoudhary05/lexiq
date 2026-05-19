/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow streaming responses from FastAPI
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Environment variables available server-side (not exposed to browser)
  env: {
    FASTAPI_URL: process.env.FASTAPI_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
