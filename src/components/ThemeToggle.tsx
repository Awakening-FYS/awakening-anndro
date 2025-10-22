"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mode, setMode] = useState<'dark'|'light'|'system'>(() => {
    try {
      const v = localStorage.getItem('site-theme') as 'dark'|'light'|'system'|null
      return v || 'system'
    } catch {
      return 'system'
    }
  })

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
