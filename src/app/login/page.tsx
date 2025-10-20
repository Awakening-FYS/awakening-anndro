"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 🔹 使用 redirect: false，自己控制跳转
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    // read callbackUrl from the current location
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('')
    const callbackUrl = params.get("callbackUrl") || "/"

    if (res?.error) {
      setError("邮箱或密码错误，请重试。")
    } else {
      router.push(callbackUrl) // 登录成功跳回来源页面或首页
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">登录</h1>
      <form onSubmit={handleLogin} className="space-y-4 w-80">
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
          onChange={(e) => setPassword(e.target.value)} // ✅ 去掉“如何改”文字
          className="border px-4 py-2 rounded w-full"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded w-full`}
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        还没有账号？{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          注册
        </Link>
      </p>
    </div>
  )
}
