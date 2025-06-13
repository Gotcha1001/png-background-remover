// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     esmExternals: "loose", // Allows Next.js to handle ESM dependencies flexibly
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        extensionAlias: {
          ".js": [".js", ".mjs"],
        },
      };
    }
    return config;
  },
};

export default nextConfig;
