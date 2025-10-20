"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert("请输入昵称")
    if (password !== confirm) return alert("两次输入的密码不一致")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (res.ok) {
      alert("注册成功，请登录")
      router.push("/login")
    } else {
      const data = await res.json()
      alert(data.error || "注册失败")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">注册</h1>
      <form onSubmit={handleRegister} className="space-y-4 w-80">
        <input
          type="text"
          placeholder="昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="确认密码"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
        >
          注册
        </button>
      </form>
      <p className="mt-4 text-sm">
        已有账号？{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          登录
        </Link>
      </p>
    </div>
  )
}
