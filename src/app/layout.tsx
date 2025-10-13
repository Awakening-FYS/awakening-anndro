import "./globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/Navbar"   // 关键：引入 Navbar

export const metadata: Metadata = {
  title: "意识觉醒",
  description: "探索内心觉察与平静的空间",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="antialiased">
        <Navbar />   {/* 全局导航栏 */}
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
