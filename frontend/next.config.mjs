/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/:slug*",
        destination: "https://sus-redirector.siddharthv643.workers.dev/:slug*",
      },
    ];
  },
};

export default nextConfig;
