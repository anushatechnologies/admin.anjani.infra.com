'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { loginAdminServerAction } from '@/lib/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    startTransition(async () => {
      const res = await loginAdminServerAction({ email, password });
      if (res.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please check your credentials.');
      }
    });
  };

  const handleFillDemo = () => {
    setEmail('admin@anjaniinfra.com');
    setPassword('admin@anjani2026');
    setErrorMessage('');
  };

  const mainWebsiteUrl = process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL || 'http://localhost:3002';

  return (
    <div className="min-h-screen bg-[#070d13] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C5A059]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#101b26]/90 border border-slate-800/90 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg mx-auto mb-2">
            <img
              src="/anjani-logo.png"
              alt="Anjani Infra Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#E5C178] text-[11px] font-bold uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              ADMIN LOGIN
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with your administrator account to manage banners, projects, blogs &amp; media.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-800/80 rounded-xl p-3.5 flex items-start gap-3 text-rose-200 text-xs animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Admin Email / Username</span>
              <span className="text-[10px] text-slate-500">Required</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin@anjaniinfra.com or admin"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#091119] border border-slate-700/80 rounded-xl pl-9 pr-3 py-3 text-white placeholder-slate-500 outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Password</span>
              <span className="text-[10px] text-slate-500">Required</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#091119] border border-slate-700/80 rounded-xl pl-9 pr-10 py-3 text-white placeholder-slate-500 outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#C5A059] to-[#DFBA73] hover:from-[#b59049] hover:to-[#cfab63] text-[#0d1622] font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="pt-4 border-t border-slate-800/80 bg-slate-950/40 rounded-xl p-3 border text-center space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-[#E5C178]">
              <Sparkles className="w-3.5 h-3.5" />
              Default Admin Account:
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#C5A059] hover:underline font-bold text-[10px] cursor-pointer"
            >
              Autofill Credentials
            </button>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-around bg-black/40 py-1.5 px-2 rounded border border-slate-800">
            <span><strong>Email:</strong> admin@anjaniinfra.com</span>
            <span><strong>Pass:</strong> admin@anjani2026</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <a
            href={mainWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <span>Back to Public Website ({mainWebsiteUrl})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070d13] flex flex-col justify-center items-center px-4 py-12">
          <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

