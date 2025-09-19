import { getAllPosts, getPostBySlug } from "@/lib/posts"
import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"

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
    //<main className="min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-yellow-100">
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-yellow-100">
      {/* 返回按钮 */}
      <Link href="/" className="inline-block mb-6 text-blue-600 hover:underline">
        ← 返回首页     
      </Link>
      
      {/* 返回按钮 */}
      <Link href="/blog" className="inline-block mb-6 text-blue-600 hover:underline">
        ← 返回博客
      </Link>

      {/* 封面图 */}
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={800}
          height={400}
          className="rounded-lg mb-6"
        />
      )}

      {/* 标题和日期 */}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-6">{post.date}</p>

      {/* 正文内容 */}
      <article
        className="prose prose-lg"
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


//"max-w-3xl mx-auto px-4 py-12"
     // <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-yellow-100"></div>
// import { getAllPosts, getPostBySlug } from "@/lib/posts"
// import Image from "next/image"
// import { notFound } from "next/navigation"
// import Link from "next/link"

// type Props = {
//   params: { slug: string }
// }

// export default async function PostPage({ params }: Props) {
  
//   const posts = getAllPosts()
//   const postIndex = posts.findIndex((p) => p.slug === params.slug)
//   const post = await getPostBySlug(params.slug)

//   if (!post) {
//     notFound()
//   }

//   const prevPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null
//   const nextPost = postIndex > 0 ? posts[postIndex - 1] : null

//   return (
//     <main className="max-w-3xl mx-auto px-4 py-12">
//       <Link href="/blog" className="inline-block mb-6 text-blue-600 hover:underline">
//         ← 返回博客
//       </Link>

//       {post.coverImage && (
//         <Image
//           src={post.coverImage}
//           alt={post.title}
//           width={800}
//           height={400}
//           className="rounded-lg mb-6"
//         />
//       )}

//       <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
//       <p className="text-gray-500 mb-6">{post.date}</p>

//       <article
//         className="prose prose-lg"
//         dangerouslySetInnerHTML={{ __html: post.contentHtml }}
//       />

//       <div className="flex justify-between mt-12 pt-6 border-t">
//         {prevPost ? (
//           <Link href={`/blog/${prevPost.slug}`} className="text-blue-600 hover:underline">
//             ← 上一篇：{prevPost.title}
//           </Link>
//         ) : (
//           <span />
//         )}
//         {nextPost ? (
//           <Link href={`/blog/${nextPost.slug}`} className="text-blue-600 hover:underline">
//             下一篇：{nextPost.title} →
//           </Link>
//         ) : (
//           <span />
//         )}
//       </div>
//     </main>
//   )
// }




// import { getAllPosts, getPostBySlug } from "@/lib/posts"
// import Image from "next/image"
// import { notFound } from "next/navigation"
// import { MDXRemote } from "next-mdx-remote/rsc"
// import Link from "next/link"

// type Props = {
//   params: { slug: string }
// }

// export default function PostPage({ params }: Props) {
//   const posts = getAllPosts()
//   const postIndex = posts.findIndex((p) => p.slug === params.slug)
//   const post = getPostBySlug(params.slug)

//   if (!post) {
//     notFound()
//   }

//   const prevPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null
//   const nextPost = postIndex > 0 ? posts[postIndex - 1] : null

//   return (
//     <main className="max-w-3xl mx-auto px-4 py-12">
//       {/* 返回按钮 */}
//       <Link
//         href="/blog"
//         className="inline-block mb-6 text-blue-600 hover:underline"
//       >
//         ← 返回博客
//       </Link>

//       {/* 封面图 */}
//       {post.coverImage && (
//         <Image
//           src={post.coverImage}
//           alt={post.title}
//           width={800}
//           height={400}
//           className="rounded-lg mb-6"
//         />
//       )}

//       {/* 标题和日期 */}
//       <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
//       <p className="text-gray-500 mb-6">{post.date}</p>

//       {/* 正文内容 */}
//       <article className="prose prose-lg">
//         <MDXRemote source={post.content} />
//       </article>

//       {/* 上一篇 / 下一篇 */}
//       <div className="flex justify-between mt-12 pt-6 border-t">
//         {prevPost ? (
//           <Link href={`/blog/${prevPost.slug}`} className="text-blue-600 hover:underline">
//             ← 上一篇：{prevPost.title}
//           </Link>
//         ) : (
//           <span />
//         )}
//         {nextPost ? (
//           <Link href={`/blog/${nextPost.slug}`} className="text-blue-600 hover:underline">
//             下一篇：{nextPost.title} →
//           </Link>
//         ) : (
//           <span />
//         )}
//       </div>
//     </main>
//   )
// }











// import { getPost } from "@/lib/posts"
// import { notFound } from "next/navigation"

// type Props = {
//   params: { slug: string }
// }

// export default async function BlogPost({ params }: Props) {
//   try {
//     const post = await getPost(params.slug)

//     return (
//       <main className="max-w-3xl mx-auto p-6">
//         <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
//         <article
//           className="prose"
//           dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
//         />
//       </main>
//     )
//   } catch (e) {
//     notFound()
//   }
// }
