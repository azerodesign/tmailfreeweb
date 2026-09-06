import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Zap,
  History,
  CheckCircle2,
  AlertTriangle,
  Send,
  XCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react'

const ONBOARDING_KEY = 'tmail_onboarded'

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'guide' | 'features' | 'changelog'>('guide')

  useEffect(() => {
    try {
      const onboarded = localStorage.getItem(ONBOARDING_KEY)
      if (!onboarded) {
        setIsOpen(true)
      }
    } catch {
      setIsOpen(true)
    }
  }, [])

  const handleDismiss = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {
      // ignore
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xl w-full mx-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-7 transition-colors flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Halo! Selamat Datang di TMail
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Inbox email instan dan gratis tanpa ribet daftar. Langsung pakai, langsung beres.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5 border border-slate-200/60 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Panduan &amp; Catatan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Kelebihan &amp; Batasan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('changelog')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'changelog'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Changelog &amp; Status</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {activeTab === 'guide' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed space-y-1">
                  <span className="font-semibold text-amber-900 dark:text-amber-200 block">
                    Catatan Penting Sebelum Pakai
                  </span>
                  <p className="text-amber-800/90 dark:text-amber-300/90 text-xs">
                    Inbox ini sifatnya sementara dan publik ya. Gunakan dengan bijak buat testing atau verifikasi akun.
                  </p>
                  <p className="text-amber-800/90 dark:text-amber-300/90 text-xs font-medium">
                    Tolong jangan dipakai untuk spam massal, bot liar, atau hal-hal aneh yang merugikan orang lain.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40 space-y-2">
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed">
                  <li>Email bakal bersih otomatis setelah beberapa hari.</li>
                  <li>Jangan dipakai buat nyimpen akun krusial (perbankan/investasi).</li>
                  <li>Cocok banget buat aktivasi OTP atau daftar layanan yang nggak mau nyepam email utama kamu.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Kelebihan
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">100% Gratis &amp; Tanpa Daftar</span>
                      <span className="text-slate-500 dark:text-slate-400">Langsung dapet alamat email detik ini juga.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Auto-Detect OTP</span>
                      <span className="text-slate-500 dark:text-slate-400">Kode verifikasi langsung kebaca tanpa harus obrak-abrik isi email.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Bebas Ganti Domain &amp; Alias</span>
                      <span className="text-slate-500 dark:text-slate-400">Sesuaikan username sesuka hati.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                  Batasan
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
                    <Send className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <span className="font-semibold text-rose-900 dark:text-rose-200 block">Hanya Terima Email</span>
                      <span className="text-rose-700/90 dark:text-rose-300/90">Khusus inbox masuk, belum bisa buat kirim email keluar.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <span className="font-semibold text-rose-900 dark:text-rose-200 block">Sesi Browser</span>
                      <span className="text-rose-700/90 dark:text-rose-300/90">Kalau clear cache/data browser, alamat email saat ini bakal ganti baru.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Status Badge */}
              <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Semua Sistem Normal (Edge Worker &amp; D1 Active)</span>
              </div>

              {/* Changelog List */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                      <Layers className="w-3.5 h-3.5" /> v1.2 Release
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal">Terbaru</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Two-column desktop split view, dark/light theme toggle, dan integrasi Cloudflare Turnstile bot protection.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Layers className="w-3.5 h-3.5" /> v1.1 Release
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Auto-detection kode OTP murni numerik dengan quick-copy badge &amp; penataan floating alert disclaimer.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Layers className="w-3.5 h-3.5" /> v1.0 Launch
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Launching domain catch-all mandiri via Cloudflare Email Routing &amp; PostalMime edge parsing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-4">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>Siap, Mulai Pakai!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
