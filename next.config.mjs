import createMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"], // 支持 .md/.mdx 页面
}

const withMDX = createMDX()
export default withMDX(nextConfig)
