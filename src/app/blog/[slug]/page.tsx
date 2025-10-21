import fs from "fs"
import path from "path"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import matter from "gray-matter"
import CommentSection from "@/components/CommentSection"


import { getAllPosts } from "@/lib/posts"
import Spacer from "@/components/Spacer"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  // ✅ 读取所有文章元信息（封面、标题、日期）
  const posts = getAllPosts()
  const postIndex = posts.findIndex((p) => p.slug === slug)
  const post = posts[postIndex]

  if (!post) {
    notFound()
  }

  // ✅ 读取并解析 .mdx 文件
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`)
  if (!fs.existsSync(filePath)) notFound()

  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { content, data } = matter(fileContent) // ✅ 用 gray-matter 分离 frontmatter 与正文

  const prevPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null
  const nextPost = postIndex > 0 ? posts[postIndex - 1] : null

  // ✅ 渲染页面
  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-bleed gradient wrapper using calc margins so it spans viewport width
          even when rendered inside a centered parent. */}
      <div className="bg-page-gradient" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          {/* 顶部导航 (remove top margin so it sits close to the fixed navbar) */}
          <div className="flex justify-between items-center mt-0 mb-6">
            <Link href="/blog" className="text-blue-600 hover:underline">
              ← 返回博客
            </Link>
            <Link href="/" className="text-blue-600 hover:underline">
              返回首页 →
            </Link>
          </div>

          {/* 封面图（优先 frontmatter 中的 coverImage） */}
          {data.coverImage && (
            <div className="max-w-full mx-auto mb-1 overflow-hidden">
              <Image
                src={data.coverImage}
                alt={data.title}
                width={800}
                height={400}
                className="rounded-lg object-cover w-full h-auto"
                priority
              />
            </div>
          )}

          {/* 标题 + 日期 */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{data.title}</h1>
            <span className="text-gray-600">{data.date}</span>
          </div>

          {/* ✅ 正文：仅渲染 content，不再包含 frontmatter */}
          <article className="prose prose-lg dark:prose-invert prose-p:mb-6 prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3">
            <MDXRemote
              source={content}
              options={{
                mdxOptions: { remarkPlugins: [remarkGfm] },
              }}
              components={{
                Spacer,
                // Make raw MDX images responsive on mobile
                img: ({ src, alt, className }: React.ImgHTMLAttributes<HTMLImageElement>) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={alt} className={(className || "") + " w-full h-auto rounded-lg"} />
                ),
              }}
            />
          </article>

          {/* 上一篇 / 下一篇 */}
          <div className="flex justify-between mt-12 pt-6 border-t mb-5">
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
      </div>
      <CommentSection />
    </div>
  )
}
