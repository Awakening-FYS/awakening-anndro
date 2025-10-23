"use client"

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthModal({ open, onClose, openView }: { open: boolean, onClose: () => void, openView?: 'phone'|'email'|'register' }) {
  const [view, setView] = useState<'phone'|'email'|'register'>('email')
  const [regDraft, setRegDraft] = useState<{ email?: string; username?: string; password?: string; phone?: string }>({})
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const router = useRouter()

  // login state for modal
  const [emailInput, setEmailInput] = useState<string>('')
  const [phoneInput, setPhoneInput] = useState<string>('')
  const [passwordInput, setPasswordInput] = useState<string>('')
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false)
  const [showRegConfirm, setShowRegConfirm] = useState<boolean>(false)

  // Load saved registration draft from localStorage when modal mounts
  useEffect(() => {
    try {
      const raw = localStorage.getItem('registrationDraft')
      if (raw) setRegDraft(JSON.parse(raw))
    } catch {}
  }, [])

  // Helper to update draft and persist
  const updateDraft = (patch: Partial<typeof regDraft>) => {
    const next = { ...regDraft, ...patch }
    // Do not persist empty phone values
    if (next.phone === '') {
      delete next.phone
    }
    setRegDraft(next)
    try {
      // Do not persist password in localStorage for security
      const toPersist = { ...next }
      if (toPersist.password) delete toPersist.password
      localStorage.setItem('registrationDraft', JSON.stringify(toPersist))
    } catch {}
  }

  // Modal login handler (works for email and phone tabs)
  const handleLogin = async (mode: 'email' | 'phone') => {
    setErrorMsg(null)
    setLoading(true)
    const identity = mode === 'email' ? emailInput : phoneInput

    try {
      const res = await signIn('credentials', { email: identity, password: passwordInput, redirect: false })
      // read callbackUrl from the current location
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('')
      const callbackUrl = params.get('callbackUrl') || '/'

      if (res?.error) {
        setErrorMsg('邮箱或密码错误，请重试。')
      } else {
        // close modal and navigate
        try { onClose() } catch {}
        try { router.push(callbackUrl) } catch { window.location.href = callbackUrl }
      }
    } catch (err) {
      console.error('login error', err)
      setErrorMsg('登录失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  // Registration handler wired to /api/auth/register
  const handleRegister = async () => {
    setErrorMsg(null)
    // simple validation
    const name = regDraft.username?.trim() || ''
    const email = regDraft.email?.trim() || ''
    const password = regDraft.password || ''
    if (!name) return alert('请输入用户名')
    if (!email) return alert('请输入邮箱')
    if (password !== confirmPassword) return alert('两次输入的密码不一致')

    setLoading(true)
    try {
      const payload: { name: string; email: string; password: string; handy?: string } = { name, email, password }
      // If user provided phone, send it as handy (optional column)
      if (regDraft.phone) payload.handy = regDraft.phone

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert('注册成功，请登录')
        // clear password from memory and persisted draft
        setRegDraft((d) => ({ ...d, password: undefined }))
        try { localStorage.removeItem('registrationDraft') } catch {}
        // switch to email login and prefill email field
        setEmailInput(email)
        setPasswordInput('')
        setConfirmPassword('')
        setView('email')
      } else {
        const data = await res.json()
        alert(data.error || '注册失败')
      }
    } catch (err) {
      console.error('register error', err)
      alert('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // Sync external openView into internal view when it changes (useful for opening register directly)
  useEffect(() => {
    if (!open || !openView) return
    setView(openView)
  }, [open, openView])

  

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
  <div className="relative bg-[#171824] text-gray-100 w-[520px] max-w-[calc(100%-2rem)] mx-4 p-6 rounded-lg h-auto max-h-[90vh]">
        {/* Close control: prominent 'X' in top-right */}
  <a href="#" aria-label="关闭" onClick={(e) => { e.preventDefault(); onClose() }} className="absolute top-4 right-4 text-gray-300 text-2xl leading-6">×</a>

        {view === 'register' ? (
          // Registration-only view: when the user chooses to register, show only the register form
            <div className="space-y-4">
              <div className="flex items-center justify-start">
                <a href="#" onClick={(e) => { e.preventDefault(); setView('email') }} className="text-lg font-semibold text-sky-400 hover:text-sky-400">返回登录</a>
              </div>
              <div>
                <input value={regDraft.username || ''} onChange={(e) => updateDraft({ username: e.target.value })} className="mt-1 w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" type="text" placeholder="请输入用户名" />
              </div>
              <div>
                <input value={regDraft.email || ''} onChange={(e) => updateDraft({ email: e.target.value })} className="mt-1 w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" type="email" placeholder="请输入邮箱" />
              </div>
              <div>
                <input value={regDraft.phone || ''} onChange={(e) => updateDraft({ phone: e.target.value })} className="mt-1 w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" type="tel" placeholder="请输入手机号（可选）" />
              </div>
              <div className="relative">
                <input value={regDraft.password || ''} onChange={(e) => updateDraft({ password: e.target.value })} className="mt-1 w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" type={showRegPassword ? 'text' : 'password'} placeholder="请输入密码" />
                <a href="#" onClick={(e) => { e.preventDefault(); setShowRegPassword(v => !v) }} role="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-pressed={showRegPassword} aria-label={showRegPassword ? '隐藏密码' : '显示密码'} title={showRegPassword ? '隐藏密码' : '显示密码'}>{showRegPassword ? '🙈' : '👁️'}</a>
              </div>
              <div className="relative">
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" type={showRegConfirm ? 'text' : 'password'} placeholder="请再次输入密码" />
                <a href="#" onClick={(e) => { e.preventDefault(); setShowRegConfirm(v => !v) }} role="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-pressed={showRegConfirm} aria-label={showRegConfirm ? '隐藏密码' : '显示密码'} title={showRegConfirm ? '隐藏密码' : '显示密码'}>{showRegConfirm ? '🙈' : '👁️'}</a>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); handleRegister() }} aria-disabled={loading} className={`w-full mt-4 py-3 rounded-md ${loading ? 'bg-gray-400' : 'bg-green-600'} text-white text-lg text-center block`}>{loading ? '注册中...' : '注册'}</a>
            </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center justify-start gap-8 mb-6">
              <a href="#" onClick={(e) => { e.preventDefault(); setView('email') }} className={`text-lg ${view==='email' ? 'text-sky-400 font-semibold' : 'text-gray-400'}`}>邮箱登录</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('phone') }} className={`text-lg ${view==='phone' ? 'text-sky-400 font-semibold' : 'text-gray-400'}`}>手机号登录</a>
            </div>

            {view === 'phone' ? (
              <div className="space-y-4">
                {/* Phone input */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center px-3 py-2 rounded-md bg-[#202433] border border-[#2b3340] text-gray-100">+86 <svg className="ml-2 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="flex-1 max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" placeholder="请输入手机号" />
                </div>

                {/* Password input with eye icon */}
                <div className="relative">
                  <input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type={showLoginPassword ? 'text' : 'password'} className="w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" placeholder="请输入密码" />
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowLoginPassword(v => !v) }} role="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-pressed={showLoginPassword} aria-label={showLoginPassword ? '隐藏密码' : '显示密码'} title={showLoginPassword ? '隐藏密码' : '显示密码'}>{showLoginPassword ? '🙈' : '👁️'}</a>
                </div>

                {/* Forget password link */}
                <div className="text-right text-sm text-gray-400">忘记密码?</div>

                {/* Login link */}
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogin('phone') }} aria-disabled={loading} className={`w-full mt-4 py-3 rounded-md ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-[#0c7cbd] to-[#0b6aa6]'} text-white text-lg opacity-90 text-center block`}>{loading ? '登录中...' : '登录'}</a>

                {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

                <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                  <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" /> 自动登录</label>
                  <div>没有账号? <a href="#" onClick={(e) => { e.preventDefault(); setView('register') }} className="text-sky-400">立即 注册</a></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Email login */}
                <div>
                  <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} type="email" className="w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" placeholder="请输入邮箱" />
                </div>
                <div className="relative">
                  <input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type={showLoginPassword ? 'text' : 'password'} className="w-full max-w-[min(495px,calc(100vw-4rem))] px-3 py-3 rounded-md bg-transparent border border-[#2b3340] placeholder:text-gray-500 text-gray-100" placeholder="请输入密码" />
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowLoginPassword(v => !v) }} role="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-pressed={showLoginPassword} aria-label={showLoginPassword ? '隐藏密码' : '显示密码'} title={showLoginPassword ? '隐藏密码' : '显示密码'}>{showLoginPassword ? '🙈' : '👁️'}</a>
                </div>
                <div className="text-right text-sm text-gray-400">忘记密码?</div>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogin('email') }} aria-disabled={loading} className={`w-full mt-4 py-3 rounded-md ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-[#0c7cbd] to-[#0b6aa6]'} text-white text-lg opacity-90 text-center block`}>{loading ? '登录中...' : '登录'}</a>
                {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
                <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                  <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" /> 自动登录</label>
                  <div>没有账号? <a href="#" onClick={(e) => { e.preventDefault(); setView('register') }} className="text-sky-400">立即 注册</a></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
