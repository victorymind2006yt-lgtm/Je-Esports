const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.anyimage.io",
      },
    ],
  },
};

module.exports = nextConfig;
