import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
  <Link href="/" className="font-bold text-3xl">意识觉醒</Link>
  <div className="space-x-5">
  <Link href="/" className="font-bold text-lg px-10 py-1 rounded hover:bg-blue-500 transition">首页</Link>
  <Link href="/about" className="font-bold text-lg px-10 py-1 rounded hover:bg-blue-500 transition">关于</Link>
  <Link href="/practice" className="font-bold text-lg px-10 py-1 rounded hover:bg-blue-500 transition">练习</Link>
  <Link href="/blog" className="font-bold text-lg px-10 py-1 rounded hover:bg-blue-500 transition">文章</Link>
  <Link href="/contact" className="font-bold text-lg px-10 py-1 rounded hover:bg-blue-500 transition">联系</Link>
      </div>
    </nav>
  )
}
