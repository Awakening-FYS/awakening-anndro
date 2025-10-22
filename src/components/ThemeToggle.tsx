"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle({ vertical }: { vertical?: boolean }) {
  // Do NOT read localStorage when initializing state — that runs during server render and
  // will cause hydration mismatches. Start with a deterministic default and hydrate
  // the real preference on the client in an effect.
  const [mode, setMode] = useState<'dark'|'light'|'system'>('system')
  const [isDark, setIsDark] = useState<boolean>(false)

  // On mount, read saved preference (client-only) and update state.
  useEffect(() => {
    try {
      const v = localStorage.getItem('site-theme') as 'dark'|'light'|'system'|null
      if (v) setMode(v)
    } catch {}
  }, [])

  // Apply the selected mode whenever it changes (runs only on client).
  useEffect(() => {
    const apply = (m: string) => {
      if (m === 'dark') document.documentElement.classList.add('dark')
      else if (m === 'light') document.documentElement.classList.remove('dark')
      else {
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
      // update derived state so UI can reflect the actually-applied theme
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    apply(mode)
    try { localStorage.setItem('site-theme', mode) } catch {}

    // If mode is 'system', listen for changes to the OS color scheme and update live.
    let mq: MediaQueryList | null = null
    const handler = () => apply('system')
    if (mode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else mq.addListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => any)
    }

    return () => {
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener('change', handler)
        else mq.removeListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => any)
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
        >
          {mode === 'dark' ? '浅色主题' : '深色主题'}
        </button>
        <button
          onClick={() => setMode('system')}
          className={`${btnPadding} rounded border inline-flex items-center shadow-sm btn-theme`}
        >
          系统主题
        </button>
    </div>
  )
}
