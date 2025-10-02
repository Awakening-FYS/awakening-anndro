import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const postsDirectory = path.join(process.cwd(), "content")

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, "utf8")

    const { data } = matter(fileContents)

    return {
      slug: fileName.replace(/\.mdx?$/, ""),
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
    }
  })

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

// 已有的 getAllPosts 保持不变
export function getRecentPosts(limit = 3) {
  return getAllPosts().slice(0, limit)
}


export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, "utf8")

  const { data, content } = matter(fileContents)
  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()

  return {
    slug,
    title: data.title,
    date: data.date,
    coverImage: data.coverImage,
    contentHtml,
  }
}



// import fs from "fs"
// import path from "path"
// import matter from "gray-matter"
// import { remark } from "remark"
// import html from "remark-html"

// const postsDirectory = path.join(process.cwd(), "content")

// export type Post = {
//   slug: string
//   title: string
//   date: string
//   description?: string
//   contentHtml?: string
// }

// // 获取所有文章并按日期排序
// export function getAllPosts(): Post[] {
//   const fileNames = fs.readdirSync(postsDirectory)

//   const allPosts = fileNames.map((fileName) => {
//     const slug = fileName.replace(/\.md$/, "")
//     const fullPath = path.join(postsDirectory, fileName)
//     const fileContents = fs.readFileSync(fullPath, "utf8")
//     const { data } = matter(fileContents)

//     return {
//       slug,
//       title: data.title,
//       date: data.date,
//       description: data.description || "",
//       coverImage: data.coverImage,
//     }
//   })

//   // 按日期倒序排列
//   return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1))
// }

// // 获取单篇文章
// export async function getPost(slug: string): Promise<Post> {
//   const fullPath = path.join(postsDirectory, `${slug}.md`)
//   const fileContents = fs.readFileSync(fullPath, "utf8")

//   const { data, content } = matter(fileContents)
//   const processedContent = await remark().use(html).process(content)
//   const contentHtml = processedContent.toString()

//   return {
//     slug,
//     title: data.title,
//     date: data.date,
//     description: data.description || "",
//     coverImage: data.coverImage,
//     contentHtml,
//   }
// }
