import React from 'react'
import { AlertOctagon, Clock, X } from 'lucide-react'

interface QuotaLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export const QuotaLimitModal: React.FC<QuotaLimitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-hidden transition-colors flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Batas Harian Tercapai (100/100)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Kamu sudah mencapai kuota maksimal 100 email untuk hari ini. Kuota di-reset otomatis pada 00:00 UTC.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-3">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Siklus harian di-reset otomatis setiap tengah malam UTC.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
        >
          Mengerti
        </button>
      </div>
    </div>
  )
}
