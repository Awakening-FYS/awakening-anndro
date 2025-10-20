import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
  }

  // 查询用户（先精确匹配，再尝试不区分大小写匹配）
  const res1 = await supabase
    .from("SignIn")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  let user = res1.data ?? null;
  if (!user) {
    const res2 = await supabase
      .from("SignIn")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (res2.error) {
      return NextResponse.json({ error: "查询用户时出错" }, { status: 500 });
    }
    user = res2.data ?? null;
  }

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 401 });
  }

  // 验证密码
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  // 登录成功，返回用户信息（可在客户端保存 session）
  return NextResponse.json({ message: "登录成功", user: { id: user.id, name: user.name, email: user.email } });
}
