"use client"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
			async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
					<section id="contact" className="bg-gray-50 dark:bg-gray-900 py-16 px-6 flex-1">
						<div className="max-w-4xl mx-auto">
							<h2 className="text-2xl font-semibold mb-6">联系我</h2>
							<form className="space-y-4" onSubmit={handleSubmit}>
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
				</div>
			);
}
