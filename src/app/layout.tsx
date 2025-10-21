import "./globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import Providers from "@/components/Providers"

export const metadata: Metadata = {
  title: "意识觉醒",
  description: "探索内心觉察与平静的空间",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6" style={{ paddingTop: 'var(--navbar-height, 5rem)' }}>{children}</main>
        </Providers>
      </body>
    </html>
  )
}

