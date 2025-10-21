"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const toggleInputRef = useRef<HTMLInputElement | null>(null)
  const closeMenu = () => {
    setOpen(false)
    try { if (toggleInputRef.current) toggleInputRef.current.checked = false } catch {}
  }

  // Set CSS variable --navbar-height so layout can inset content to avoid overlap
  useEffect(() => {
    const setHeight = () => {
      const el = navRef.current
      if (!el) return
      const h = Math.ceil(el.getBoundingClientRect().height)
      document.documentElement.style.setProperty('--navbar-height', `${h}px`)
    }
    setHeight()
    window.addEventListener('resize', setHeight)
    return () => window.removeEventListener('resize', setHeight)
  }, [])

  // Close menu when clicking outside the navbar
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return
      const target = e.target as Node | null
      if (!navRef.current) return
      if (target && !navRef.current.contains(target)) {
        closeMenu()
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [open])

  // Close the mobile menu when resizing to desktop (md breakpoint) or when navigation happens
  useEffect(() => {
    const onResize = () => {
      try {
        if (window.innerWidth >= 768 && open) {
          closeMenu()
        }
      } catch {}
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  // Close menu on pathname change
  useEffect(() => {
    closeMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <nav
      ref={navRef}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
      className="backdrop-blur-sm bg-blue-200 dark:bg-gray-900/80 shadow-md dark:shadow-lg px-4 py-3 border-b relative"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-3xl no-underline">意识觉醒</Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-nowrap whitespace-nowrap">
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
                  await signOut({ callbackUrl: pathname || '/', redirect: false })
                  try { router.refresh() } catch { window.location.href = pathname || '/' }
                }}
                className="font-bold text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="ml-6 flex items-center space-x-4">
              <Link href={`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`} className="font-bold text-lg px-6 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white transition no-underline">登录</Link>
              <Link href="/register" className="font-bold text-lg px-6 py-1 rounded bg-green-700 hover:bg-green-800 text-white transition no-underline">注册</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger with CSS fallback */}
        <div className="md:hidden">
          {/* Button toggles React state and keeps the hidden checkbox in sync for the CSS fallback. */}
          <button
            onClick={() => {
              setOpen((v) => {
                const next = !v
                // keep the hidden checkbox in sync so the CSS peer selector matches
                try { if (toggleInputRef.current) toggleInputRef.current.checked = next } catch {}
                return next
              })
            }}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            className="p-2 rounded bg-blue-100 dark:bg-gray-800 inline-flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown - rendered always but visibility controlled by JS state OR the checkbox peer state
          so it works even when client JS fails to hydrate in production. */}
      {/* Hidden checkbox used as a CSS-only toggle fallback (peer). Placed here so the dropdown can use
          the `peer-checked:` variant - the input must be a sibling that comes before the target. */}
  <input id="nav-toggle" ref={toggleInputRef} className="peer hidden" type="checkbox" aria-hidden />

      <div id="mobile-menu" className={
        "md:hidden absolute right-4 top-full mt-2 min-w-[10rem] bg-white dark:bg-gray-800 rounded shadow-lg z-50 " +
        (open ? 'flex' : 'hidden') +
        ' peer-checked:flex'
      }>
          <div className="flex flex-col p-2">
            <Link href="/" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-blue-100">首页</Link>
            <Link href="/about" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-blue-100">关于</Link>
            <Link href="/practice" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-blue-100">练习</Link>
            <Link href="/blog" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-blue-100">文章</Link>
            <Link href="/contact" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-blue-100">联系</Link>

            {session?.user ? (
              <div className="pt-2 border-t">
                <div className="text-sm mb-2 px-4 py-2 text-center">欢迎，{session.user.name ?? session.user.email}</div>
                <button onClick={async () => { closeMenu(); await signOut({ callbackUrl: pathname || '/', redirect: false }); try { router.refresh() } catch { window.location.href = pathname || '/' } }} className="w-full text-center px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">退出</button>
              </div>
            ) : (
                <div className="pt-2 border-t flex flex-col space-y-2">
                <Link href={`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`} onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded bg-blue-700 text-white">登录</Link>
                <Link href="/register" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded bg-green-700 text-white">注册</Link>
              </div>
            )}
          </div>
        </div>
    </nav>
  )
}
