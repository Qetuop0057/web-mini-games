import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁止开发服务器重新生成 AI 助手说明文件。
  agentRules: false,
  // 当前游戏全部运行在浏览器端，导出静态页面即可公开托管。
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
