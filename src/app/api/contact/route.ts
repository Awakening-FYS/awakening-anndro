import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  // /api/contact called
  const data = await request.json();
  const { name, email, message, captcha } = data;

  // 校验 reCAPTCHA
  if (!captcha) {
    return NextResponse.json({ success: false, error: "验证码未通过" }, { status: 400 });
  }
  
    const secret = "6LeFXNwrAAAAAMgRkdNGEmA9WVebKTCTPGDpud8M";
  const verifyRes = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captcha}`,
    { method: "POST" }
  );
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return NextResponse.json({ success: false, error: "验证码校验失败" }, { status: 400 });
  }

  // 配置 SMTP（以 gmail 为例）
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nhoj.wong@gmail.com', // 你的邮箱
      pass: 'svgg vlnm cbui vrnq' // 推荐用应用专用密码
    }
  });

  try {
    await transporter.sendMail({
      from: 'nhoj.wong@gmail.com',
      to: 'nhoj.wong@gmail.com',
      subject: `网站联系表单 - 来自 ${name}`,
      text: `姓名: ${name}\n邮箱: ${email}\n信息: ${message}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("邮件发送失败:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
