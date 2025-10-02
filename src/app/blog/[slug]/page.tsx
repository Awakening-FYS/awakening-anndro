import { getAllPosts, getPostBySlug } from "@/lib/posts"
import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"

//import { MDXProvider } from "@mdx-js/react"
//import { MDXRemote } from "next-mdx-remote/rsc"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: Props) {
  // ✅ 这里要 await
  const { slug } = await params

  const posts = getAllPosts()
  const postIndex = posts.findIndex((p) => p.slug === slug)
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const prevPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null
  const nextPost = postIndex > 0 ? posts[postIndex - 1] : null

  return (
    //<main className="min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-yellow-100  max-w-1xl mx-auto">
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-yellow-100">
      {/* 返回首页和返回博客同一行，左右分布 */}
      <div className="flex justify-between items-center mt-6 mb-6">
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← 返回博客
        </Link>
        <Link href="/" className="text-blue-600 hover:underline">
          返回首页 →
        </Link>
      </div>

      {/* 封面图：恢复为最初的写法 */}
      {post.coverImage && (
          <div className="max-w-[800px] mx-auto mb-6 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg object-cover w-full h-auto"
              priority
            />
          </div>
      )}

      {/* 标题和日期同行显示，日期在最右侧 */}
      <div className="flex items-center justify-between mb-2 px-5">
        <h1 className="text-3xl font-bold m-0">{post.title}</h1>
        <span className="text-gray-500 text-base">{post.date}</span>
      </div>
      <div className="mb-6" />

      {/* 正文内容 */}
      <article
      className="prose prose-lg dark:prose-invert px-10 prose-p:mb-6 prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      /> 

      {/* 上一篇 / 下一篇 */}
      <div className="flex justify-between mt-12 pt-6 border-t">
        {prevPost ? (
          <Link href={`/blog/${prevPost.slug}`} className="text-blue-600 hover:underline">
            ← 上一篇：{prevPost.title}
          </Link>
        ) : (
          <span />
        )}
        {nextPost ? (
          <Link href={`/blog/${nextPost.slug}`} className="text-blue-600 hover:underline">
            下一篇：{nextPost.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
