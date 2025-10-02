import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  console.log("API /api/contact 被调用");
  const data = await request.json();
  const { name, email, message } = data;

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
