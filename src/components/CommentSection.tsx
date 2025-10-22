"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Comment = {
  name: string
  text: string
  date: string
}

export default function CommentSection() {
  // Hooks 必须放在最顶端
  const { data: session } = useSession()
  const pathname = usePathname()
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bannedWords = ["广告", "http://", "https://", "色情", "赌博", "推广","www."]

  useEffect(() => {
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
    document.getElementById("giscus-container")?.appendChild(script)
  }, [])

  // 如果用户已登录，使用 session 中的名字或邮箱作为留言名，并同步到 state
  useEffect(() => {
    if (session?.user) {
      const user = session.user as { name?: string; email?: string }
      const displayName = user?.name || user?.email || "用户"
      setName(displayName)
    }
  }, [session])

  // Clear name when user logs out so the form doesn't keep the previous user's display name
  useEffect(() => {
    if (!session) {
      setName("")
    }
  }, [session])

  const sanitizeInput = (input: string) => input.replace(/<[^>]*>?/gm, "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return alert("请先登录再发表评论")

    setError(null)
    setSuccess(null)

    const cleanName = sanitizeInput(name.trim())
    const cleanText = sanitizeInput(text.trim())

    if (!cleanName || !cleanText) return setError("留言内容不能为空。")
    if (cleanText.length > 500) return setError("留言内容不能超过 500 字。")
    if (bannedWords.some((word) => cleanText.includes(word))) return setError("留言中包含不合适的内容，请修改后再试。")

    const newComment = {
      name: cleanName,
      text: cleanText,
      date: new Date().toLocaleString(),
    }

  // Optimistic UI
  setComments([newComment, ...comments])
  // If user is logged in, keep their display name; anonymous input clears
  if (!session?.user) setName("")
  setText("")
    setSuccess("留言发布成功！")
    setIsSubmitting(true)

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
          console.log('GitHub Discussions response', data)
            // Refresh comments after successful post to get canonical data from server
            try {
              const listRes = await fetch(`/api/github-discussions?path=${encodeURIComponent(window.location.pathname)}`)
              if (listRes.ok) {
                const listData = await listRes.json()
                if (Array.isArray(listData.comments)) setComments(listData.comments)
              }
            } catch {
              // ignore refresh errors
            }
        }
      } catch (err) {
        console.error(err)
        setError('网络错误：无法发布到 GitHub')
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  // Load existing comments (including discussion initial body) on mount
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/github-discussions?path=${encodeURIComponent(window.location.pathname)}`)
        const data = await res.json()
        if (res.ok && Array.isArray(data.comments)) setComments(data.comments)
      } catch (err) {
        console.error('Failed to load comments', err)
      }
    })()
  }, [])

  return (
    <div id="comments" className="mt-1 mb-1 border-t border-gray-300 pt-1 px-10">
      <h2 className="text-2xl font-semibold mb-2">💬 留言区</h2>

      {!session && (
        <p className="text-gray-500 mb-4">
          请先{' '}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent((pathname || '/') + '#comments')}`}
            className="text-blue-600 hover:underline"
          >
            登录
          </Link>{' '}
          再发表评论
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {session?.user && (
          <div className="w-full px-4 py-2 text-gray-800">
            {name}：
          </div>
        )}
        <textarea
          placeholder="写下你的留言（最多 500 字）..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-600 rounded-lg px-4 py-2 h-28 focus:ring-2 focus:ring-blue-1200"
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
