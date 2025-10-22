"use client"

import { useEffect } from "react"

export default function FaviconSwitcher() {
  useEffect(() => {
    const setIcon = (isDark: boolean) => {
      const href = isDark ? '/favicon-light.ico' : '/favicon-dark.ico'
      let el = document.querySelector('link[data-dynamic-favicon]') as HTMLLinkElement | null
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', 'icon')
        el.setAttribute('data-dynamic-favicon', 'true')
        document.head.appendChild(el)
      }
      // add a query to force-reload when we change during development
      el.href = href + (href.includes('?') ? '&' : '?') + 'v=' + Date.now()
    }

    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
    const initial = mq ? mq.matches : false
    setIcon(initial)

    const handler = (e: MediaQueryListEvent) => setIcon(e.matches)
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else mq.addListener(handler)
    }
    return () => {
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener('change', handler)
        else mq.removeListener(handler)
      }
    }
  }, [])

  return null
}
