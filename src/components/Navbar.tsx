import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="font-bold text-xl">意识觉醒</Link>
      <div className="space-x-6">

        <Link href="/">首页</Link>
        <Link href="/about">关于</Link>
        <Link href="/practice">练习</Link>
        <Link href="/blog">文章</Link>
        <Link href="/contact">联系</Link>
      </div>
    </nav>
  )
}
