"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"

type Comment = {
  name: string
  text: string
  date: string
}

export default function CommentSection() {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bannedWords = ["广告", "http://", "https://", "色情", "赌博", "推广", "www."]
  const lastSubmitRef = useRef<number | null>(null)
  const cooldownMs = 8_000
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const container = document.getElementById("giscus-container")
    if (container) {
      const existing = Array.from(container.querySelectorAll('script')).some(
        (s) => s.getAttribute('data-repo') === 'Awakening-FYS/awakening-anndro'
      )
      if (!existing) {
        const script = document.createElement("script")
        script.src = "https://giscus.app/client.js"
        script.async = true
        script.crossOrigin = "anonymous"
        script.setAttribute("data-repo", "Awakening-FYS/awakening-anndro")
        script.setAttribute("data-repo-id", "R_kgDOPy9OfA")
        script.setAttribute("data-category", "General")
        script.setAttribute("data-category-id", "DIC_kwDOPy9OfM4CwmOn")
        script.setAttribute("data-mapping", "pathname")
        script.setAttribute("data-reactions-enabled", "1")
        script.setAttribute("data-theme", "preferred_color_scheme")
        script.setAttribute("data-lang", "zh-CN")
        container.appendChild(script)
      }
    }
  }, [])

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/github-discussions?path=${encodeURIComponent(window.location.pathname)}`)
      if (!res.ok) {
        console.error('Failed to load comments', await res.text())
        return
      }
      const json = await res.json()
      if (json?.comments) {
        setComments(json.comments)
      }
    } catch (err) {
      console.error('Error loading comments', err)
    }
  }, [])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  function getDisplayName(user: unknown) {
    if (!user || typeof user !== 'object') return '用户'
    const u = user as Record<string, unknown>
    const n = typeof u.name === 'string' ? u.name : undefined
    const email = typeof u.email === 'string' ? u.email : undefined
    return n || email || '用户'
  }

  useEffect(() => {
    if (session?.user) {
      setName(getDisplayName(session.user))
    }
  }, [session])

  const sanitizeInput = (input: string) => input.replace(/<[^>]*>?/gm, "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return alert("请先登录再发表评论")

    setError(null)
    setSuccess(null)

    const cleanName = sanitizeInput(name.trim())
    const cleanText = sanitizeInput(text.trim())

    if (!cleanName || !cleanText) return setError("请填写姓名和留言内容。")
    if (cleanText.length > 500) return setError("留言内容不能超过 500 字。")
    if (bannedWords.some((word) => cleanText.includes(word))) return setError("留言中包含不合适的内容，请修改后再试。")

    const now = Date.now()
    if (lastSubmitRef.current && now - lastSubmitRef.current < cooldownMs) {
      return setError(`请等待 ${(Math.ceil((cooldownMs - (now - lastSubmitRef.current)) / 1000))} 秒后再试`)
    }

    if (comments.some(c => c.text.trim() === cleanText.trim())) {
      return setError('您已提交相同内容，请修改后再试。')
    }

    const newComment = {
      name: cleanName,
      text: cleanText,
      date: new Date().toLocaleString(),
    }

    const prevComments = comments
    setComments([newComment, ...comments])
    if (!session?.user) setName("")

    setText("")
    setSuccess("留言发布中…")
    setIsSubmitting(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const ac = new AbortController()
    abortControllerRef.current = ac

    try {
      const res = await fetch('/api/github-discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname, name: newComment.name, text: newComment.text }),
        signal: ac.signal,
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Failed to post discussion', data)
        setComments(prevComments)
        setError(data?.error || '发布到 GitHub 讨论失败')
        setSuccess(null)
      } else {
        setSuccess(data?.result?.data?.createDiscussion?.discussion?.url ? '发布成功，已创建讨论' : '发布成功')
        lastSubmitRef.current = Date.now()
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('request aborted')
      } else {
        console.error(err)
        setComments(prevComments)
        setError('网络错误：无法发布到 GitHub')
        setSuccess(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-1 mb-1 border-t border-gray-300 pt-1 px-10">
      <h2 className="text-2xl font-semibold mb-6">💬 留言区</h2>

      {!session && <p className="text-gray-500 mb-4">请先登录再发表评论</p>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {session?.user ? (
          <div className="w-full px-4 py-2 text-gray-800">
            {name}：
          </div>
        ) : (
          <input
            type="text"
            placeholder="你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            disabled={!session}
          />
        )}
        <textarea
          placeholder="写下你的留言（最多 500 字）..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 focus:ring-2 focus:ring-blue-500"
          disabled={!session}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={!session || isSubmitting}
          className={`${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-2 rounded-lg transition`}
        >
          {isSubmitting ? "正在提交..." : "发表留言"}
        </button>
      </form>

      <ul className="space-y-6">
        {comments.map((comment, index) => (
          <li key={index} className="border-b pb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{comment.name}</span>
              <span className="text-sm text-gray-500">{comment.date}</span>
            </div>
            <p className="text-gray-800 whitespace-pre-line">{comment.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
      }
    } finally {
      setIsSubmitting(false)
    }
=======
    // Send to GitHub Discussions
    ;(async () => {
      try {
        const res = await fetch('/api/github-discussions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname, name: newComment.name, text: newComment.text }),
        })
        const data = await res.json()
        if (!res.ok) {
          console.error('Failed to post discussion', data)
          setError('发布到 GitHub 讨论失败')
        } else {
          // optionally show link or returned result
          // server response logged during development; remove in production
        }
      } catch (err) {
        console.error(err)
        setError('网络错误：无法发布到 GitHub')
      } finally {
        setIsSubmitting(false)
      }
    })()
>>>>>>> restore/comments-2025-10-20
  }

  return (
    <div className="mt-1 mb-1 border-t border-gray-300 pt-1 px-10">
      <h2 className="text-2xl font-semibold mb-6">💬 留言区</h2>

      {!session && <p className="text-gray-500 mb-4">请先登录再发表评论</p>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {session?.user ? (
          <div className="w-full px-4 py-2 text-gray-800">
            {name}：
          </div>
        ) : (
          <input
            type="text"
            placeholder="你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            disabled={!session}
          />
        )}
        <textarea
          placeholder="写下你的留言（最多 500 字）..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 focus:ring-2 focus:ring-blue-500"
          disabled={!session}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={!session || isSubmitting}
          className={`${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-2 rounded-lg transition`}
        >
          {isSubmitting ? "正在提交..." : "发表留言"}
        </button>
      </form>

      <ul className="space-y-6">
        {comments.map((comment, index) => (
          <li key={index} className="border-b pb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{comment.name}</span>
              <span className="text-sm text-gray-500">{comment.date}</span>
            </div>
            <p className="text-gray-800 whitespace-pre-line">{comment.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
