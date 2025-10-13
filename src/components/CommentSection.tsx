"use client"

import { useState, useEffect } from "react"

// 留言类型定义
type Comment = {
  name: string
  text: string
  date: string
}

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 敏感词黑名单
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

  

  const sanitizeInput = (input: string) => {
    // 去掉 HTML 标签
    return input.replace(/<[^>]*>?/gm, "")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (isSubmitting) {
      setError("请不要频繁提交留言。")
      return
    }

    // 校验输入
    const cleanName = sanitizeInput(name.trim())
    const cleanText = sanitizeInput(text.trim())

    if (!cleanName || !cleanText) {
      setError("请填写姓名和留言内容。")
      return
    }

    if (cleanText.length > 500) {
      setError("留言内容不能超过 500 字。")
      return
    }

    if (bannedWords.some((word) => cleanText.includes(word))) {
      setError("留言中包含不合适的内容，请修改后再试。")
      return
    }

    // 添加留言
    const newComment = {
      name: cleanName,
      text: cleanText,
      date: new Date().toLocaleString(),
    }

    setComments([newComment, ...comments])
    setName("")
    setText("")
    setSuccess("留言发布成功！")
    setIsSubmitting(true)

    // 防止灌水：3 秒内不能再次提交
    setTimeout(() => setIsSubmitting(false), 3000)
  }

  return (
    <div className="mt-1 mb-1 border-t border-gray-300 pt-1 px-10">
      <h2 className="text-2xl font-semibold mb-6">💬 留言区</h2>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="写下你的留言（最多 500 字）..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 focus:ring-2 focus:ring-blue-500"
        />

        {/* 错误与成功提示 */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-lg transition`}
        >
          {isSubmitting ? "正在提交..." : "发表留言"}
        </button>
      </form>

      {/* 显示留言 */}
      {comments.length === 0 ? (
        <p className="text-gray-500 italic">还没有留言，快来抢沙发吧！</p>
      ) : (
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
      )}
    </div>
  )
}
