import React from 'react'
import { ShieldAlert, RefreshCw, X } from 'lucide-react'

interface AdblockModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AdblockModal: React.FC<AdblockModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-hidden transition-colors flex flex-col">
        {/* Top bar with icon and close button */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Adblocker Terdeteksi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Sistem mendeteksi ekstensi pemblokir iklan (uBlock, AdGuard, atau sejenisnya) memblokir widget verifikasi Cloudflare Turnstile. Matikan sementara adblocker di domain ini agar tombol aksi bisa digunakan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="flex-1 h-11 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Refresh Halaman</span>
          </button>
        </div>
      </div>
    </div>
  )
}
