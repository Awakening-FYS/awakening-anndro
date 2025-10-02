import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const data = await request.json();
  const { name, email, message } = data;

  // 配置 SMTP（以 Outlook 为例）
  const transporter = nodemailer.createTransport({
    service: 'Outlook',
    auth: {
      user: 'life_wisdom@outlook.com', // 你的邮箱
      pass: 'dccctpiqireaktcc' // 推荐用应用专用密码
    }
  });

  try {
    await transporter.sendMail({
      from: 'life_wisdom@outlook.com',
      to: 'life_wisdom@outlook.com',
      subject: `网站联系表单 - 来自 ${name}`,
      text: `姓名: ${name}\n邮箱: ${email}\n信息: ${message}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
