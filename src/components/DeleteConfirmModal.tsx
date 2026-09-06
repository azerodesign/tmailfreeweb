import React from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  address: string | null
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  address,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-hidden transition-colors flex flex-col">
        {/* Header Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Hapus Mailbox Saat Ini?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Semua email yang tersimpan di alamat ini akan dihapus permanen dari server dan diganti dengan alamat email baru.
          </p>

          {address && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 font-mono text-xs text-rose-600 dark:text-rose-400 font-medium truncate select-all">
              {address}
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900/90 dark:text-amber-300/90 mt-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada kode verifikasi penting yang tertinggal.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-11 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-11 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
          </button>
        </div>
      </div>
    </div>
  )
}
