"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle({ vertical }: { vertical?: boolean }) {
  // Start in 'follow system' mode on the client until we read a saved preference.
  // We don't read localStorage during render to avoid hydration mismatch; mount
  // effect will hydrate the real preference.
  const [mode, setMode] = useState<'dark'|'light'|'follow'>('follow')
  const [appliedDark, setAppliedDark] = useState(false)

  // Hydrate preference from localStorage on mount. If a stored value exists and is
  // 'dark' or 'light' we use it; otherwise we keep 'follow' which means follow the
  // OS setting and listen for changes.
  useEffect(() => {
    try {
      const v = localStorage.getItem('site-theme')
      if (v === 'dark' || v === 'light') setMode(v)
      else setMode('follow')
    } catch {
      setMode('follow')
    }
  }, [])

  // Apply the selected mode whenever it changes (client-only) and manage the
  // media query listener when in 'follow' mode.
  useEffect(() => {
    const apply = (m: 'dark'|'light'|'follow') => {
      if (m === 'dark') document.documentElement.classList.add('dark')
      else if (m === 'light') document.documentElement.classList.remove('dark')
      else {
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
      setAppliedDark(document.documentElement.classList.contains('dark'))
    }

    apply(mode)

    // Persist only explicit user choices (dark/light). If following system, remove saved key.
    try {
      if (mode === 'dark' || mode === 'light') localStorage.setItem('site-theme', mode)
      else localStorage.removeItem('site-theme')
    } catch {}

    // When following the system, attach a listener so the UI updates live when the
    // OS color scheme changes. When the user has explicitly chosen dark/light we do
    // not auto-toggle on system changes.
    let mq: MediaQueryList | null = null
    const handler = () => apply('follow')
    if (mode === 'follow' && typeof window !== 'undefined' && window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else mq.addListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void)
    }

    return () => {
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener('change', handler)
        else mq.removeListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void)
      }
    }
  }, [mode])

  const containerClass = vertical ? 'flex flex-col items-end gap-1' : 'flex items-center gap-2'
  const btnPadding = vertical ? 'px-2 py-0.5 text-sm' : 'px-2 py-1'

  return (
    <div className={containerClass}>
        <button
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          className={`${btnPadding} rounded border inline-flex items-center shadow-sm btn-theme`}
          aria-pressed={mode === 'dark'}
          title={mode === 'dark' ? '切换到浅色' : '切换到深色'}
        >
          {appliedDark ? '浅' : '深'}
        </button>
        {/* Removed explicit "system" control. The component uses system preference on
            first load and will listen for system changes as long as the user has not
            chosen an explicit theme. */}
    </div>
  )
}
