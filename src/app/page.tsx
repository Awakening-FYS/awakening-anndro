"use client"
//"use client"

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import Hero from "@/components/Hero"

export const dynamic = "force-static" // 或 "force-dynamic"

export default function Home() {
  type Post = {
    slug: string;
    title: string;
    date: string;
    // 可根据实际数据结构补充字段
  };
  const [recentPosts, setRecentPosts] = React.useState<Post[]>([]);
  React.useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setRecentPosts(data));
  }, []);
  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert('发送成功！');
      form.reset();
    } else {
      alert('发送失败，请稍后再试。');
    }
  }

  return (
   <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-yellow-100">
    {/* </div><div className="min-h-screen flex flex-col"> */}
      
      <Hero />
      
      {/* About */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-16">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">关于我们</h2>
          <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
              了解更多 →
          </Link>
        </div> 

        

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          意识觉醒致力于帮助人们通过正念练习与冥想，提升觉察力与内在平衡。我们相信每个人都能在繁杂世界中找到属于自己的安宁与力量。
        </p>
      </section>

      {/* Practice */}
      <section id="practice" className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-10 text-center">每日练习</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">呼吸冥想</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  专注于呼吸，帮助你放松身心，回归当下。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">身体扫描</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  逐步觉察身体的感受，释放压力与紧张。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">感恩日记</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  每天记录三件值得感恩的事情，培养积极心态。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section id="articles" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-6">最新文章</h2>
        <ul className="space-y-4">
          {recentPosts.map((post: Post) => (
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
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            查看所有文章 →
          </Link>
        </div>
      </section>
      
      
      {/* Courses */}
      <section id="courses" className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">课程推荐</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">7天冥想入门</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  带你循序渐进地了解冥想的基本方法。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">21天正念觉醒</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  深度培养觉察力与专注力，建立持久习惯。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">订阅通讯</h2>
        <form
          action="https://xxxx.us21.list-manage.com/subscribe/post?u=你的ID&amp;id=列表ID"
          method="POST"
          target="_blank"
          noValidate
          className="space-y-4"
        >
          <Input
            type="email"
            name="EMAIL"
            placeholder="输入你的邮箱"
            required
          />
          <Button type="submit" className="rounded-full w-full">
            订阅
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            我们尊重你的时间，不会发送垃圾邮件。
          </p>
        </form>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">联系我们</h2>
          <form className="space-y-4" onSubmit={handleContactSubmit}>
            <Input type="text" name="name" placeholder="你的名字" required />
            <Input type="email" name="email" placeholder="你的邮箱" required />
            <Textarea name="message" placeholder="你的信息..." rows={4} required />
            <Button type="submit" className="rounded-full">
              发送
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-4">表单信息将直接发送到我们的邮箱</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t text-center text-sm text-gray-500">
        © {new Date().getFullYear()} 意识觉醒. 保留所有权利.
      </footer>
    </div>
  )
}
