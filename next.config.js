/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hare-media-cdn.tripadvisor.com'
      }
    ]
  },
  // Future-friendly: App Router is the default in Next 14
  experimental: {
    urlImports: [
      "https://"
    ]
  }
}

module.exports = nextConfig
