import Link from "next/link"
import Image from "next/image"
import { getAllPosts } from "@/lib/posts"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">觉醒博客</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.slug} className="border-b pb-6">
            {post.coverImage && (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={800}
                height={400}
                className="rounded-lg mb-4"
              />
            )}
            <h2 className="text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-gray-500 text-sm mb-2">{post.date}</p>
            <p className="text-gray-700">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline mt-2 block"
            >
              阅读更多 →
            </Link>
          </div>
        ))}
      </div>
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
