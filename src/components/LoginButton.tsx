"use client"
import { signIn, useSession, signOut } from "next-auth/react"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span>欢迎, {session.user?.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          登出
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("credentials")}
      className="bg-blue-500 text-white px-4 py-1 rounded"
    >
      访客登录
    </button>
  )
}
