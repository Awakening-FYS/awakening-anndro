import Link from "next/link"
import { getRecentPosts } from "@/lib/posts"
import Image from "next/image"

export default function LatestPosts() {
  const recentPosts = getRecentPosts(5)

  // Determine a fallback src for the image
  const latest = recentPosts?.[0]
  const raw = latest?.coverImage
  let src = "/images/source.png"
  if (raw) {
    if (/^https?:\/\//.test(raw) || raw.startsWith('/')) {
      src = raw
    } else {
      src = `/images/${raw}`
    }
  }

  return (
    <section id="articles" className="w-full py-0 relative">
      {/* Full-bleed left image on md+ */}
      <div className="hidden md:block absolute left-10 top-20 w-[400px] h-[248px] overflow-hidden">
        <Image src={src} alt={latest?.title ?? '最新文章'} width={112} height={112} className="object-cover w-full h-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:pl-[480px] text-left">
        {/* stacked image for small screens */}
        <div className="md:hidden w-full h-40 mb-4 overflow-hidden relative">
          <Image src={src} alt={latest?.title ?? '最新文章'} fill className="object-cover" />
        </div>

        <h2 className="text-2xl font-semibold mb-2">最新文章</h2>

        <div className="bg-transparent">
          <div className="flex flex-col md:flex-row md:gap-6 gap-4">
            {/* On md+, left column is the space reserved for the full-bleed image (we already offset via md:pl) */}
            <div className="flex-1">
              <ul className="space-y-2">
                {recentPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {post.title}
                    </Link>
                    <span className="block text-sm text-gray-500">{post.date}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 py-2 text-right md:text-right">
                <Link href="/blog" className="text-blue-600 hover:underline">
                  查看所有文章 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}