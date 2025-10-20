"use client"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const pathname = usePathname()

  return (
  <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-blue-200 dark:bg-gray-900/80 shadow-md dark:shadow-lg flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="font-bold text-3xl no-underline">意识觉醒</Link>

      <div className="flex items-center gap-6 flex-nowrap whitespace-nowrap">
  <Link href="/" className="font-bold text-lg px-4 py-1 rounded hover:bg-blue-100 text-gray-800 dark:text-gray-200 transition no-underline">首页</Link>
  <Link href="/about" className="font-bold text-lg px-4 py-1 rounded hover:bg-blue-100 text-gray-800 dark:text-gray-200 transition no-underline">关于</Link>
  <Link href="/practice" className="font-bold text-lg px-4 py-1 rounded hover:bg-blue-100 text-gray-800 dark:text-gray-200 transition no-underline">练习</Link>
  <Link href="/blog" className="font-bold text-lg px-4 py-1 rounded hover:bg-blue-100 text-gray-800 dark:text-gray-200 transition no-underline">文章</Link>
  <Link href="/contact" className="font-bold text-lg px-4 py-1 rounded hover:bg-blue-100 text-gray-800 dark:text-gray-200 transition no-underline">联系</Link>

        {session?.user ? (
          <div className="ml-6 flex items-center space-x-4">
            <span className="text-sm text-gray-800 dark:text-gray-200">欢迎，{session.user.name ?? session.user.email}</span>
            <button
              onClick={async () => {
                // signOut without immediate redirect, then refresh to update UI
                await signOut({ callbackUrl: pathname || '/', redirect: false })
                try {
                  router.refresh()
                } catch {
                  // fallback to hard reload
                  window.location.href = pathname || '/'
                }
              }}
              className="font-bold text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
            >
              退出
            </button>
          </div>
        ) : (
          <div className="ml-6 flex items-center space-x-4">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`}
              className="font-bold text-lg px-6 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white transition no-underline"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="font-bold text-lg px-6 py-1 rounded bg-green-700 hover:bg-green-800 text-white transition no-underline"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
