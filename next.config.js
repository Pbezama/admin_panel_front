/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/chat/:path*',
        destination: '/chat'
      }
    ]
  }
}

module.exports = nextConfig
