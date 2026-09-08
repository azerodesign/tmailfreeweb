import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, Copy, X, Ticket, Sparkles } from 'lucide-react'
import { HoverBorderGradient } from './ui/hover-border-gradient'

interface VoucherItem {
  code: string
  plan: string
  days: number
  createdAt: string
}

interface VoucherSuccessModalProps {
  voucher: VoucherItem | null
  onClose: () => void
  onCopy: (code: string) => void
  isCopied: boolean
}

export const VoucherSuccessModal: React.FC<VoucherSuccessModalProps> = ({
  voucher,
  onClose,
  onCopy,
  isCopied,
}) => {
  if (!voucher) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#07050e]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-[#0f0b1a] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Token VIP Berhasil Diterbitkan!</h3>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs text-purple-300/70 font-mono">Kode lisensi siap dibagikan kepada pelanggan.</p>
            </div>
          </div>

          {/* Code Card Box */}
          <div className="bg-[#07050e]/90 border border-purple-500/30 rounded-2xl p-4.5 my-5 space-y-3 relative">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-300/60 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-purple-400" /> Lisensi Akses Premium
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {voucher.plan} • {voucher.days} HARI
              </span>
            </div>

            <div className="py-2.5 text-center bg-purple-950/30 border border-purple-500/20 rounded-xl">
              <span className="font-mono font-extrabold text-xl sm:text-2xl text-purple-200 tracking-wider select-all">
                {voucher.code}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>Status: Aktif & Siap Klaim</span>
              <span>Terbit: {voucher.createdAt}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <HoverBorderGradient
              onClick={() => onCopy(voucher.code)}
              className="w-full flex items-center justify-center gap-2 text-xs py-2.5"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Kode Berhasil Di-Copy!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-400" />
                  <span>Copy Kode Redeem</span>
                </>
              )}
            </HoverBorderGradient>

            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-slate-300 text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
