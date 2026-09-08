import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, QrCode, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { checkKisoraOrderStatus, mintVoucherOnPaymentSuccess } from '../services/kisoraPgService'
import { HoverBorderGradient } from './ui/hover-border-gradient'

interface QrisCheckoutModalProps {
  orderData: {
    orderId: string
    amount: number
    qrisPayload: string
    expiresAt: string
    checkoutUrl: string
    qrImageUrl: string
    planId: string
    days: number
  } | null
  onClose: () => void
  onSuccess: (voucherCode: string, plan: string) => void
}

export const QrisCheckoutModal: React.FC<QrisCheckoutModalProps> = ({
  orderData,
  onClose,
  onSuccess,
}) => {
  const [isPaid, setIsPaid] = useState(false)
  const [mintedVoucher, setMintedVoucher] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    if (!orderData) return

    let isSubscribed = true
    setIsPaid(false)
    setMintedVoucher(null)

    // Polling Order Status every 4 seconds
    const interval = setInterval(async () => {
      if (!isSubscribed) return
      try {
        const res = await checkKisoraOrderStatus(orderData.orderId)
        if (res.status === 'verified') {
          clearInterval(interval)
          const voucher = await mintVoucherOnPaymentSuccess(orderData.planId, orderData.days)
          if (isSubscribed) {
            setMintedVoucher(voucher.code)
            setIsPaid(true)
          }
        }
      } catch (err) {
        console.error('Polling Error:', err)
      }
    }, 4000)

    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [orderData])

  if (!orderData) return null

  const handleCopyVoucher = () => {
    if (!mintedVoucher) return
    navigator.clipboard.writeText(mintedVoucher)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#07050e]/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative z-10 w-full max-w-md bg-[#0f0b1a] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden font-mono text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-purple-300/60 hover:text-white hover:bg-purple-950/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!isPaid ? (
            <div className="space-y-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Pembayaran Kisora QRIS</h3>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs">
                <span className="text-purple-300/70">Total Tagihan: </span>
                <span className="font-extrabold text-lg text-purple-200 ml-1">
                  Rp {orderData.amount.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Native Kisora QRIS Image */}
              <div className="bg-white p-3 rounded-2xl border-2 border-purple-500/30 inline-block shadow-xl">
                <img src={orderData.qrImageUrl} alt="Kisora QRIS" className="w-48 h-48 mx-auto object-contain" />
              </div>

              <div className="space-y-3">
                <a
                  href={orderData.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <span>Buka Halaman Checkout Kisora (/order)</span>
                </a>

                <div className="space-y-1 text-xs text-purple-300/70">
                  <p className="flex items-center justify-center gap-1.5 font-bold text-purple-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    Menunggu Pembayaran QRIS...
                  </p>
                  <p className="text-[10px] text-purple-400/50">
                    Scan QR di atas atau klik tombol Halaman Checkout di atas.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Pembayaran Lunas!</h3>
                <p className="text-xs text-purple-300/70 mt-1">Kode Voucher VIP Anda telah diterbitkan instan.</p>
              </div>

              <div className="bg-[#07050e] border border-purple-500/30 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] text-purple-400/60 uppercase tracking-wider block">Kode Voucher Lisensi</span>
                <span className="font-extrabold text-xl text-purple-200 tracking-wider block select-all">
                  {mintedVoucher}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <HoverBorderGradient onClick={handleCopyVoucher} className="w-full py-2.5 text-xs">
                  {copiedCode ? (
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Copied!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Copy className="w-4 h-4 text-purple-400" /> Copy Voucher
                    </span>
                  )}
                </HoverBorderGradient>

                <button
                  onClick={() => {
                    if (mintedVoucher) {
                      onSuccess(mintedVoucher, orderData.planId)
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Masuk Inbox
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
