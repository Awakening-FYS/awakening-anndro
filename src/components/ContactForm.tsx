"use client"

import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function ContactForm() {
  const recaptchaRef = React.useRef<ReCAPTCHA>(null)
  const [captcha, setCaptcha] = React.useState<string | null>(null)

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    if (!captcha) {
      alert('请先完成验证码验证')
      return
    }
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      captcha,
    }
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      alert('发送成功！')
      form.reset()
      setCaptcha(null)
      if (recaptchaRef.current) recaptchaRef.current.reset()
    } else {
      alert('发送失败，请稍后再试。')
    }
  }

  return (
    <form
      className="space-y-4 mx-auto w-full max-w-[min(720px,100%)] box-border px-4"
      onSubmit={handleContactSubmit}
    >
      <Input type="text" name="name" placeholder="你的名字" required />
      <Input type="email" name="email" placeholder="你的邮箱" required />
      <Textarea name="message" placeholder="你的信息..." rows={4} required />
      <div className="flex justify-center">
        <div className="-mx-0">{
          /* ReCAPTCHA: use compact size to avoid horizontal overflow on narrow screens */
        }
          <ReCAPTCHA
            sitekey="6LeFXNwrAAAAALezWu6yS8Zhmpt-e8U0lxnDsIln"
            ref={recaptchaRef}
            onChange={setCaptcha}
            
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Button type="submit" className="rounded-full text-base px-4 py-3 w-full md:w-auto font-bold">
          发送
        </Button>
      </div>
    </form>
  )
}
