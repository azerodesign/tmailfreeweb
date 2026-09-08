import { useState } from 'react'
import { Crown, Zap, Sparkles, ArrowLeft, QrCode } from 'lucide-react'
import { SpotlightCard } from '../components/SpotlightCard'
import { createKisoraQrisOrder } from '../services/kisoraPgService'
import { QrisCheckoutModal } from '../components/QrisCheckoutModal'
import { useThemeConfig } from '../hooks/useThemeConfig'

const TIERS_DETAIL = [
  {
    id: 'VIP',
    name: 'VIP Standard',
    price: 'Rp 15.000',
    amount: 15000,
    days: 30,
    period: '/30 hari',
    color: 'from-purple-500 to-indigo-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-950/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: <Crown className="w-5 h-5 text-purple-400" />,
    specs: [
      { label: 'Kuota Generate Harian', val: '300 Email / Hari' },
      { label: 'Retensi Email Masuk', val: '90 Hari' },
      { label: 'Domain Slot Pribadi', val: '1 Custom Domain' },
      { label: 'Layanan API Access', val: 'REST API Bearer Token' },
      { label: 'Kecepatan Polling', val: '3 Detik Auto Refresh' },
    ],
  },
  {
    id: 'VIP_PLUS',
    name: 'VIP+ Special',
    price: 'Rp 20.000',
    amount: 20000,
    days: 30,
    period: '/30 hari',
    color: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-950/20',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    popular: true,
    icon: <Crown className="w-5 h-5 text-indigo-400" />,
    specs: [
      { label: 'Kuota Generate Harian', val: '1.000 Email / Hari' },
      { label: 'Retensi Email Masuk', val: '180 Hari' },
      { label: 'Domain Slot Pribadi', val: '2 Custom Domain' },
      { label: 'Layanan API Access', val: 'REST API Bearer Token' },
      { label: 'Kecepatan Polling', val: '3 Detik Auto Refresh' },
    ],
  },
  {
    id: 'PRO',
    name: 'PRO Unlimited',
    price: 'Rp 40.000',
    amount: 40000,
    days: 30,
    period: '/30 hari',
    color: 'from-amber-500 to-yellow-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    specs: [
      { label: 'Kuota Generate Harian', val: '2.000 Email / Hari' },
      { label: 'Retensi Email Masuk', val: '365 Hari (1 Tahun)' },
      { label: 'Domain Slot Pribadi', val: '8 Custom Domain' },
      { label: 'Layanan API Access', val: 'Full API + TMailnie Web' },
      { label: 'Dukungan Prioritas', val: 'VIP Diskusi Group' },
    ],
  },
  {
    id: 'MAX',
    name: 'MAX Enterprise',
    price: 'Rp 230.000',
    amount: 230000,
    days: 30,
    period: '/bulan',
    color: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: <Zap className="w-5 h-5 text-emerald-400" />,
    specs: [
      { label: 'Kuota Generate Harian', val: '6.000 Email / Hari' },
      { label: 'Fitur Auto Rotate Domain', val: 'Aktif (Auto Switch)' },
      { label: 'Domain Slot Pribadi', val: 'Free 2 .my.id + .com' },
      { label: 'Layanan API Access', val: 'Unlimited Bearer Token' },
      { label: 'Akses Fitur Terbaru', val: 'Update Prioritas Awal' },
    ],
  },
]

export function BenefitPanel() {
  const theme = useThemeConfig()
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null)
  const [qrisOrder, setQrisOrder] = useState<{
    orderId: string
    amount: number
    qrisPayload: string
    expiresAt: string
    checkoutUrl: string
    qrImageUrl: string
    planId: string
    days: number
  } | null>(null)

  const handleBuyQris = async (tier: typeof TIERS_DETAIL[0]) => {
    setPurchasingPlan(tier.id)
    try {
      const order = await createKisoraQrisOrder({
        planId: tier.id,
        amount: tier.amount,
        planName: `TMail VIP ${tier.name}`,
        days: tier.days,
      })
      setQrisOrder({ ...order, planId: tier.id, days: tier.days })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat QRIS Order')
    } finally {
      setPurchasingPlan(null)
    }
  }

  return (
    <div className={`min-h-screen bg-[#07050e] text-slate-100 flex flex-col justify-between ${theme.selection} selection:text-white relative overflow-hidden font-sans`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 py-4 sm:py-6 flex-1">
        {/* Header Navigation */}
        <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-b ${theme.borderStyle} pb-5 mb-8 gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${theme.badgeStyle} flex items-center justify-center border shadow-inner shrink-0`}>
              <Crown className={`w-5 h-5 ${theme.textPrimary}`} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Benefit & Tier Matrix</h1>
              <p className={`text-xs ${theme.textMuted} font-mono mt-0.5`}>Perbandingan Lengkap Spesifikasi Paket TMail Prem</p>
            </div>
          </div>

          <a
            href="/inbox"
            className={`px-4 py-2 rounded-xl bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} text-xs font-mono font-semibold transition flex items-center gap-2 cursor-pointer`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Inbox</span>
          </a>
        </header>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TIERS_DETAIL.map((tier) => (
            <SpotlightCard
              key={tier.id}
              className={`bg-[#0f0b1a]/90 backdrop-blur-xl rounded-3xl p-6 border ${tier.border} shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6`}
              spotlightColor="rgba(168, 85, 247, 0.15)"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl ${tier.bg} border ${tier.border}`}>
                    {tier.icon}
                  </div>
                  {tier.popular && (
                    <span className="text-[9px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-500 text-white shadow-lg">
                      Terpopuler
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-2xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">{tier.period}</span>
                  </div>
                </div>

                {/* Specs List */}
                <div className="space-y-3 pt-4 border-t border-white/10 font-mono text-xs">
                  {tier.specs.map((spec, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{spec.label}</span>
                      <span className="font-bold text-slate-200 block">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Buy QRIS Button */}
              <button
                onClick={() => handleBuyQris(tier)}
                disabled={purchasingPlan === tier.id}
                className="w-full h-11 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 flex items-center justify-center gap-2 cursor-pointer text-xs font-mono font-bold transition disabled:opacity-50"
              >
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>{purchasingPlan === tier.id ? 'Memproses QRIS...' : 'Beli Instan QRIS'}</span>
              </button>
            </SpotlightCard>
          ))}
        </div>

        {/* Footer Support Bar */}
        <div className={`p-6 rounded-3xl bg-[#0f0b1a]/90 border ${theme.borderStyle} font-mono text-xs text-center space-y-2`}>
          <p className="text-slate-300 font-bold">Butuh Bantuan / Pemulihan Pembelian?</p>
          <p className={theme.textMuted}>
            Udah beli?, chat <a href="https://t.me/aztors" target="_blank" rel="noreferrer" className="text-white font-bold underline hover:text-purple-300">@aztors</a> untuk proses pulihkan pembelian
          </p>
        </div>
      </div>

      {/* QRIS Checkout Modal */}
      {qrisOrder && (
        <QrisCheckoutModal
          orderData={qrisOrder}
          onClose={() => setQrisOrder(null)}
          onSuccess={(voucherCode) => {
            setQrisOrder(null)
            localStorage.setItem('tmail_prem_redeem_token', voucherCode)
            window.location.href = '/inbox'
          }}
        />
      )}
    </div>
  )
}
