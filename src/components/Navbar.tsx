"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import ThemeToggle from "@/components/ThemeToggle"
import AuthModal from "@/components/AuthModal"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authOpenView, setAuthOpenView] = useState<'phone'|'email'|'register' | undefined>(undefined)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
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

    // schedule a robust recalculation: initial, next animation frames and after fonts load
    const schedule = () => {
      try { setHeight() } catch {}
      // double rAF helps after layout/paint
      requestAnimationFrame(() => requestAnimationFrame(() => { try { setHeight() } catch {} }))
      // when fonts finish loading, heights may change (guard for document.fonts presence)
      try {
        const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
        fonts?.ready?.then(() => { try { setHeight() } catch {} })
      } catch {}
    }

    schedule()

    // Recalculate on window resize
    window.addEventListener('resize', schedule)
    // Recalculate when the html element's class changes (dark mode toggles may be applied on load)
    const mo = new MutationObserver((mutations: MutationRecord[]) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          schedule()
          break
        }
      }
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Also recalc on load in case some resources changed height after initial script run
    window.addEventListener('load', schedule)

    return () => {
      window.removeEventListener('resize', schedule)
      window.removeEventListener('load', schedule)
      try { mo.disconnect() } catch {}
    }
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
  }, [pathname])

  return (
    <>
      <nav
      ref={navRef}
    style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, backgroundColor: 'var(--navbar-bg)', borderBottomColor: 'var(--navbar-border)' }}
  className="backdrop-blur-sm shadow-md dark:shadow-lg px-4 py-3 border-b relative"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* logo placed before the site title, sized to navbar height via CSS variable */}
          <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ height: 'min(var(--navbar-height, 48px), 45px)', width: 'min(var(--navbar-height, 48px), 45px)' }}>
            <Image
              src="/images/source.png"
              alt="site logo"
              width={48}
              height={48}
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            />
          </div>
          <Link href="/" className="site-wordmark no-underline" aria-label="意识觉醒 - 返回首页">
            {/* Use plain text for the wordmark to reduce reserved width and improve responsiveness */}
            <span className="site-title" role="img" aria-hidden="false">意识觉醒</span>
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2 flex-nowrap whitespace-nowrap">
          <Link href="/" className="font-bold text-lg px-4 py-1 rounded hover:bg-background/10 text-foreground transition no-underline">首页</Link>
          <Link href="/about" className="font-bold text-lg px-4 py-1 rounded hover:bg-background/10 text-foreground transition no-underline">关于</Link>
          <Link href="/practice" className="font-bold text-lg px-4 py-1 rounded hover:bg-background/10 text-foreground transition no-underline">练习</Link>
          <Link href="/blog" className="font-bold text-lg px-4 py-1 rounded hover:bg-background/10 text-foreground transition no-underline">文章</Link>
          <Link href="/contact" className="font-bold text-lg px-4 py-1 rounded hover:bg-background/10 text-foreground transition no-underline">联系</Link>
          <div className="ml-auto flex items-center gap-2">
            {session?.user ? (
              // Show username plain; clicking toggles a small logout menu
              <div className="relative">
                <button
                  onClick={(e) => { e.preventDefault(); setUserMenuOpen((v) => !v) }}
                  aria-expanded={userMenuOpen}
                  className="font-bold text-lg text-foreground no-underline bg-transparent px-0 py-0"
                >
                  {session.user.name ?? session.user.email}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-background dark:bg-card rounded shadow-md z-50">
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false)
                        await signOut({ callbackUrl: pathname || '/', redirect: false })
                        try { router.refresh() } catch { window.location.href = pathname || '/' }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-background/10"
                    >退出</button>
                  </div>
                )}
              </div>
            ) : (
              // Plain text login link (no pill/button styling)
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthOpen(true); setAuthOpenView('email') }} className="font-bold text-lg text-foreground no-underline">登录</a>
            )}
            <div className="ml-auto flex-shrink-0">
              <ThemeToggle vertical />
            </div>
          </div>
        </div>

        {/* Mobile hamburger with CSS fallback */}
            <div className="md:hidden">
          {/* Button toggles React state and keeps the hidden checkbox in sync for the CSS fallback. */}
          <div className="md:hidden flex items-center gap-2">
            {/* Keep the ThemeToggle visible on small screens next to the hamburger */}
                <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
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
              className="p-2 rounded bg-background/10 dark:bg-card inline-flex"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown - rendered always but visibility controlled by JS state OR the checkbox peer state
          so it works even when client JS fails to hydrate in production. */}
      {/* Hidden checkbox used as a CSS-only toggle fallback (peer). Placed here so the dropdown can use
          the `peer-checked:` variant - the input must be a sibling that comes before the target. */}
  <input id="nav-toggle" ref={toggleInputRef} className="peer hidden" type="checkbox" aria-hidden />

            <div id="mobile-menu" className={
  "md:hidden absolute right-4 top-full mt-2 min-w-[10rem] bg-background text-foreground dark:bg-card rounded shadow-lg z-50 " +
        (open ? 'flex' : 'hidden') +
        ' peer-checked:flex'
      }>
          <div className="flex flex-col p-2">
            <Link href="/" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-background/10">首页</Link>
            <Link href="/about" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-background/10">关于</Link>
            <Link href="/practice" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-background/10">练习</Link>
            <Link href="/blog" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-background/10">文章</Link>
            <Link href="/contact" onClick={() => closeMenu()} className="w-full text-center px-4 py-2 rounded hover:bg-background/10">联系</Link>

            <div className="pt-2 border-t">
              {session?.user ? (
                <>
                  <div className="text-sm mb-2 px-4 py-2 text-center">{session.user.name ?? session.user.email}</div>
                  <button onClick={async () => { closeMenu(); await signOut({ callbackUrl: pathname || '/', redirect: false }); try { router.refresh() } catch { window.location.href = pathname || '/' } }} className="w-full text-center px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">退出</button>
                </>
              ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); setAuthOpen(true); setAuthOpenView('email') }} className="w-full text-center px-4 py-2">登录</a>
              )}
            </div>
          </div>
        </div>
      </nav>
  <AuthModal open={authOpen} onClose={() => { setAuthOpen(false); setAuthOpenView(undefined) }} openView={authOpenView} />
    </>
  )
}
