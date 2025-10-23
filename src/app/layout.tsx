

import "./globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import Providers from "@/components/Providers"
import FaviconSwitcher from "@/components/FaviconSwitcher"

import localFont from 'next/font/local'
import { Roboto, Noto_Sans_SC } from 'next/font/google'

const roboto = Roboto({ weight: ['400','700'], subsets: ['latin'], display: 'swap', variable: '--font-roboto' })
const noto = Noto_Sans_SC({ weight: ['400','700'], subsets: ['latin'], display: 'swap', variable: '--font-noto' })

const zcoolXiao = localFont({ src: '../../public/fonts/ZCOOLXiaoWei-Regular.woff2', display: 'swap', variable: '--font-title-local' })
const zcoolQing = localFont({ src: '../../public/fonts/ZCOOLQingKeHuangYou-Regular.woff2', display: 'swap', variable: '--font-display-local' })

export const metadata: Metadata = {
  title: "意识觉醒",
  description: "探索内心觉察与平静的空间",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${roboto.variable} ${noto.variable} ${zcoolXiao.variable} ${zcoolQing.variable}`}>
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
