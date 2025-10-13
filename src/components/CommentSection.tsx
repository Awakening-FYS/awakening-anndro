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
        <div id="giscus-container" />     
    </div>
  )
}
