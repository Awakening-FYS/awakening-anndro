import Link from "next/link"
import { getRecentPosts } from "@/lib/posts"

export default function LatestPosts() {
  const recentPosts = getRecentPosts(3)

  return (
    <section id="articles" className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-semibold mb-6">最新文章</h2>
      <ul className="space-y-4">
        {recentPosts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {post.title}
            </Link>
            <span className="block text-sm text-gray-500">{post.date}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/blog" className="text-blue-600 hover:underline">
          查看所有文章 →
        </Link>
      </div>
    </section>
  )
}
