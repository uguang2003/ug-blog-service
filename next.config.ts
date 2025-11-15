import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 生成 standalone 输出，便于把构建产物打包并在没有源码的服务器上运行
  output: 'standalone',
};

export default nextConfig;
