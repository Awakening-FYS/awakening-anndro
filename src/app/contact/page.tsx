"use client"
import React from "react";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  

	return (
		<div className="min-h-screen flex flex-col py-10 bg-page-gradient">
			<section id="contact" className="">
				<div className="max-w-4xl mx-auto max-w-sm px-4 sm:px-6">
					<h2 className="text-3xl font-semibold mb-6">联系我们</h2>
					<ContactForm />
					{/* <p className="text-xs text-gray-500 mt-4">表单信息将直接发送到我们的邮箱</p> */}
				</div>
			</section>
		</div>
	);
}
