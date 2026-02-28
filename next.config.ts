import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  // macOS 12.6 호환성 문제(workerd 실행 불가)로 인해 로컬 개발 시에는 Cloudflare 에뮬레이터를 사용하지 않습니다.
  // import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
