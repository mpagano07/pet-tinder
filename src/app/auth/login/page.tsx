"use client"

import { login } from '../actions'
import { PawPrint, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/LanguageProvider'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingButton } from '@/components/ui/LoadingButton'

export default function LoginPage() {
  const dict = useTranslation()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="text-primary w-8 h-8" />
            <span className="text-gradient font-bold text-2xl tracking-tight">PetMatch</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">{dict.common.welcomeBack}</h2>

        <form className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={dict.common.email}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/40"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={dict.common.password}
              className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/40"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-3.5 text-white/40 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {message && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg">
              {message}
            </p>
          )}

          <LoadingButton
            formAction={login}
            label={dict.common.login}
            loadingLabel="Iniciando sesión..."
          />
        </form>

        <p className="text-center text-white/60 mt-6">
          {dict.common.noAccount}{' '}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            {dict.common.signup}
          </Link>
        </p>
      </div>
    </div>
  )
}
