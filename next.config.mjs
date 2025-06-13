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

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     esmExternals: "loose",
//   },
//   webpack: (config, { isServer }) => {
//     if (!isServer) {
//       config.resolve = {
//         ...config.resolve,
//         extensionAlias: {
//           ".js": [".js", ".mjs"],
//         },
//       };

//       // Add fallbacks for node modules
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         path: false,
//         os: false,
//       };
//     }

//     // Handle .mjs files properly
//     config.module.rules.push({
//       test: /\.mjs$/,
//       include: /node_modules/,
//       type: "javascript/auto",
//     });

//     return config;
//   },
//   // Ensure proper transpilation of packages
//   transpilePackages: ["@imgly/background-removal"],
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

      // Add fallbacks for node modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
      };
    }

    // Handle .mjs files properly
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    // Handle .wasm files for @imgly/background-removal
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Experiments for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  // Ensure proper transpilation of packages
  transpilePackages: ["@imgly/background-removal"],

  // Add headers to allow cross-origin requests for model files
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
