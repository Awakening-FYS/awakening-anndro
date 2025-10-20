import { NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../../lib/supabaseClient"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "昵称、邮箱和密码不能为空" }, { status: 400 })
    }

    // 检查是否已注册
    const { data: existingUser } = await supabase
      .from("SignIn")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "邮箱已注册" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from("SignIn")
      .insert({ name, email, password: hashedPassword })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: "注册成功", user: data })
  } catch {
    return NextResponse.json({ error: "注册失败" }, { status: 500 })
  }
}
