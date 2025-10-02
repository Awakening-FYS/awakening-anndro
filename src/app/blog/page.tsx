import Link from "next/link"
import Image from "next/image"
import { getAllPosts } from "@/lib/posts"

export default function BlogPage() {
  const posts = getAllPosts()
  const latestPost = posts[0]

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">觉醒博客</h1>
      {/* 仅显示最近博客的图片 */}
      {latestPost?.coverImage && (
        <Image
          src={latestPost.coverImage}
          alt={latestPost.title}
          width={800}
          height={400}
          className="rounded-lg mb-8"
        />
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





// import Link from "next/link"
// import { getAllPosts } from "@/lib/posts"

// export default function BlogPage() {
//   const posts = getAllPosts()

//   return (
//     <main className="max-w-3xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">文章列表</h1>
//       <ul className="space-y-6">
//         {posts.map((post) => (
//           <li key={post.slug} className="border-b pb-4">
//             <Link
//               href={`/blog/${post.slug}`}
//               className="text-xl font-semibold text-blue-600 hover:underline"
//             >
//               {post.title}
//             </Link>
//             <p className="text-sm text-gray-500">{post.date}</p>
//             <p className="text-gray-700 mt-2">{post.description}</p>
//           </li>
//         ))}
//       </ul>
//     </main>
//   )
// }



// import Link from "next/link"
// import { getAllPosts } from "@/lib/posts"

// export default function BlogPage() {
//   const posts = getAllPosts()

//   return (
//     <main className="max-w-3xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">文章列表</h1>
//       <ul className="space-y-4">
//         {posts.map((post) => (
//           <li key={post.slug}>
//             <Link
//               href={`/blog/${post.slug}`}
//               className="text-blue-600 hover:underline"
//             >
//               {post.title}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </main>
//   )
// }
