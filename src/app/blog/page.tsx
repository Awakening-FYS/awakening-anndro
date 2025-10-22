import Link from "next/link"
import Image from "next/image"
import { getAllPosts } from "@/lib/posts"

export default function BlogPage() {
  const posts = getAllPosts()
  const latestPost = posts[0]

  return (
    <main className="min-h-screen flex flex-col px-5 py-0 bg-page-gradient">
      <h1 className="text-3xl font-bold mb-4">觉醒博客</h1>
      {/* 仅显示最近博客的图片 */}
      {latestPost?.coverImage && (
        <div className ="w-full mx-auto mb-1 overflow-hidden rounded-lg relative h-48 md:h-86 border-1 border-blue-500">
          <Image
            src={latestPost.coverImage}
            alt={latestPost.title}
            fill
            className="object-cover object-[50%_50%]"
            priority
          />
        </div>
      )}
      {/* 列出所有博客链接 */}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <div className="flex items-center justify-between">
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline text-xl font-semibold">
                {post.title}
              </Link>
              <span className="text-gray-500 text-sm">{post.date}</span>
            </div>
            {post.excerpt && (
              <p className="text-gray-700 mt-1">{post.excerpt}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}