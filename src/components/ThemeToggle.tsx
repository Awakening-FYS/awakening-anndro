"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  // Do NOT read localStorage when initializing state — that runs during server render and
  // will cause hydration mismatches. Start with a deterministic default and hydrate
  // the real preference on the client in an effect.
  const [mode, setMode] = useState<'dark'|'light'|'system'>('system')

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
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
    }
    apply(mode)
    try { localStorage.setItem('site-theme', mode) } catch {}
  }, [mode])

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} className="px-2 py-1 rounded border">
        {mode === 'dark' ? 'Dark' : 'Light'}
      </button>
      <button onClick={() => setMode('system')} className="px-2 py-1 rounded border">
        System
      </button>
    </div>
  )
}
