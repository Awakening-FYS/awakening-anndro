import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "../../../../lib/supabaseClient"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "邮箱登录",
      credentials: {
        email: { label: "邮箱", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null

        const { email, password } = credentials
        console.log('[nextauth] authorize called for', email)

        // 尝试精确匹配（maybeSingle 避免单条结果报错），找不到再尝试不区分大小写的 ilike
        const res1 = await supabase
          .from("SignIn")
          .select("*")
          .eq("email", email)
          .maybeSingle()

        let user: any = res1.data ?? null
        if (res1.error) {
          console.warn('[nextauth] supabase exact-match error (ignored):', res1.error)
        }

        if (!user) {
          const res2 = await supabase
            .from("SignIn")
            .select("*")
            .ilike("email", email)
            .maybeSingle()
          if (res2.error) {
            console.error('[nextauth] supabase ilike error:', res2.error)
            return null
          }
          user = res2.data ?? null
        }

        console.log('[nextauth] user fetched:', user ? { id: user.id, email: user.email } : null)

        if (!user || !user.password) {
          console.warn('[nextauth] user not found or missing password')
          return null
        }

        const isValid = await bcrypt.compare(password, user.password)
        console.log('[nextauth] password compare result:', isValid)
        if (!isValid) return null

        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  // ✅ 设置登录、错误、回调页面
  pages: {
    signIn: "/login",   // 登录页面路径
    error: "/",          // 发生错误时跳回首页
  },  
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
