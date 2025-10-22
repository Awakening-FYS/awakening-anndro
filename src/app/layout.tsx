

import "./globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import Providers from "@/components/Providers"
import FaviconSwitcher from "@/components/FaviconSwitcher"

export const metadata: Metadata = {
  title: "意识觉醒",
  description: "探索内心觉察与平静的空间",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="antialiased">
        <Providers>
          <FaviconSwitcher />
          <Navbar />
          <main className="max-w-5xl mx-auto px-0 sm:px-0 py-0 bg-transparent" style={{ paddingTop: 'var(--navbar-height, 1rem)' }}>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
