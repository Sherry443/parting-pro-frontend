/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/deooa4jwy/**',
      },
    ],
  },
}
