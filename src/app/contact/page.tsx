"use client"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactPage() {
	const recaptchaRef = useRef<ReCAPTCHA>(null);
	const [captcha, setCaptcha] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		if (!captcha) {
			alert("请先完成验证码验证");
			return;
		}
		const data = {
			name: formData.get('name'),
			email: formData.get('email'),
			message: formData.get('message'),
			captcha,
		};
		const res = await fetch('/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (res.ok) {
			alert('发送成功！');
			form.reset();
			setCaptcha(null);
			if (recaptchaRef.current) recaptchaRef.current.reset();
		} else {
			alert('发送失败，请稍后再试。');
		}
	}

			return (
				<div className="min-h-screen flex flex-col py-10 bg-page-gradient">
					<section id="contact" className="">
						<div className="max-w-4xl mx-auto">
							<h2 className="text-3xl font-semibold mb-6">联系我们</h2>
							<form className="space-y-4" onSubmit={handleSubmit}>
								<Input type="text" name="name" placeholder="你的名字" required />
								<Input type="email" name="email" placeholder="你的邮箱" required />
								<Textarea name="message" placeholder="你的信息..." rows={4} required />
								<ReCAPTCHA
									sitekey="6LeFXNwrAAAAALezWu6yS8Zhmpt-e8U0lxnDsIln"
									ref={recaptchaRef}
									onChange={setCaptcha}
								/>
								<Button type="submit" className="rounded-full text-lg px-16 py-4 font-bold">
									发送
								</Button>
							</form>
							{/* <p className="text-xs text-gray-500 mt-4">表单信息将直接发送到我们的邮箱</p> */}
						</div>
					</section>
				</div>
			);
}
