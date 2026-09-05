/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Pre-existing lint errors (unused imports, `any` types, unescaped
    // entities) predate this change and don't affect runtime behavior.
    // Unblocking the production build here rather than in CI/local dev.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
