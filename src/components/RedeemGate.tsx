import { useState } from 'react'
import { KeyRound, ShieldCheck, Sparkles, CheckCircle2, QrCode, Loader2 } from 'lucide-react'
import { validateVoucherRemote } from '../services/voucherService'
import { createKisoraQrisOrder } from '../services/kisoraPgService'
import { SpotlightCard } from './SpotlightCard'
import { HoverBorderGradient } from './ui/hover-border-gradient'
import { MoltenMetal } from './MoltenMetal'
import { QrisCheckoutModal } from './QrisCheckoutModal'

interface RedeemGateProps {
  onRedeemSuccess: (token: string, plan: string) => void
}

const PRICING_TIERS = [
  {
    id: 'VIP',
    name: 'VIP Standard',
    price: 'Rp 15.000',
    amount: 15000,
    days: 30,
    period: '/30 hari',
    features: ['300 Generate/Hari', 'Retensi Email 90 Hari', '1 Custom Domain Slot'],
  },
  {
    id: 'VIP_PLUS',
    name: 'VIP+ Special',
    price: 'Rp 20.000',
    amount: 20000,
    days: 30,
    period: '/30 hari',
    features: ['1.000 Generate/Hari', 'Retensi Email 180 Hari', '2 Custom Domain Slot'],
    popular: true,
  },
  {
    id: 'PRO',
    name: 'PRO Unlimited',
    price: 'Rp 40.000',
    amount: 40000,
    days: 30,
    period: '/30 hari',
    features: ['2.000 Generate/Hari', 'Retensi 365 Hari', '8 Domain Slot + Web Access'],
  },
  {
    id: 'MAX',
    name: 'MAX Enterprise',
    price: 'Rp 230.000',
    amount: 230000,
    days: 30,
    period: '/bulan',
    features: ['6.000 Generate/Hari', 'Auto Rotate Domain', 'Free 2 Custom Domain .my.id'],
  },
]

export function RedeemGate({ onRedeemSuccess }: RedeemGateProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'redeem' | 'pricing'>('redeem')

  // Kisora QRIS Modal States
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

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return

    setLoading(true)
    setError('')

    try {
      const remoteRes = await validateVoucherRemote(cleanCode)
      if (remoteRes.valid && remoteRes.code && remoteRes.plan) {
        localStorage.setItem('tmail_prem_redeem_token', remoteRes.code)
        localStorage.setItem('tmail_prem_plan', remoteRes.plan)
        onRedeemSuccess(remoteRes.code, remoteRes.plan)
        return
      }

      if (!/^(VIP\+?|PRO|MAX)-[A-Z0-9-]+$/i.test(cleanCode) && cleanCode.length < 8) {
        throw new Error('Kode Voucher / Access Key tidak valid. Contoh format: VIP-ABC123XYZ')
      }

      // Auto detect plan tier from prefix if not found in remote DB
      let detectedPlan = 'VIP'
      if (cleanCode.startsWith('MAX')) detectedPlan = 'MAX'
      else if (cleanCode.startsWith('PRO')) detectedPlan = 'PRO'
      else if (cleanCode.startsWith('VIP+') || cleanCode.startsWith('VIP90')) detectedPlan = 'VIP_PLUS'
      else if (cleanCode.startsWith('VIP')) detectedPlan = 'VIP'

      localStorage.setItem('tmail_prem_redeem_token', cleanCode)
      localStorage.setItem('tmail_prem_plan', detectedPlan)

      onRedeemSuccess(cleanCode, detectedPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memverifikasi kode redeem.')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectBuyQris = async (tier: (typeof PRICING_TIERS)[0]) => {
    setPurchasingPlan(tier.id)
    try {
      const order = await createKisoraQrisOrder({
        planId: tier.id,
        amount: tier.amount,
        planName: tier.name,
        days: tier.days,
      })
      setQrisOrder(order)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuat tagihan QRIS Kisora')
    } finally {
      setPurchasingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      <MoltenMetal
        color1="#2e1065"
        color2="#6b21a8"
        color3="#c084fc"
        speed={0.2}
        scale={3.8}
        glow={1.4}
        opacity={0.35}
        backgroundColor="#07050e"
      />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">TMail Prem</h1>
          </div>
          <p className="text-xs text-purple-300/70 font-mono">
            High-Speed VIP Disposable Mailbox • Kisora PG Automated QRIS
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 pt-3">
            <button
              onClick={() => setActiveTab('redeem')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'redeem'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'text-purple-300/60 hover:text-white bg-[#0f0b1a]/60'
              }`}
            >
              🔑 Input Access Key
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'pricing'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'text-purple-300/60 hover:text-white bg-[#0f0b1a]/60'
              }`}
            >
              💎 Beli Voucher VIP (Kisora QRIS)
            </button>
          </div>
        </div>

        {/* Tab 1: Redeem Code Form */}
        {activeTab === 'redeem' && (
          <SpotlightCard
            className="bg-[#0f0b1a]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            spotlightColor="rgba(168, 85, 247, 0.25)"
          >
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Aktivasi Mailbox VIP</h2>
              <p className="text-xs text-purple-300/70 font-mono">
                Masukkan Kode Redeem / Access Key Premium untuk membuka mailbox.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5">
                  Kode Redeem / Access Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Contoh: VIP-TDHY5-DAYU7"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#07050e]/90 border border-purple-500/30 rounded-xl px-4 py-3.5 pl-11 text-white font-mono placeholder-purple-400/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-xs"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-purple-400/60 absolute left-4 top-4 pointer-events-none" />
                </div>
              </div>

              <HoverBorderGradient className="w-full h-12 flex items-center justify-center gap-2 text-xs font-bold">
                {loading ? 'Verifikasi Kode...' : '🔓 Unlock VIP Mailbox'}
              </HoverBorderGradient>
            </form>

            <div className="pt-4 border-t border-purple-500/20 text-center font-mono">
              <p className="text-xs text-purple-300/60 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Belum punya token VIP?{' '}
                <button onClick={() => setActiveTab('pricing')} className="text-purple-300 font-bold hover:underline">
                  Beli via Kisora QRIS
                </button>
              </p>
            </div>
          </SpotlightCard>
        )}

        {/* Tab 2: Pricing & Auto Buy (Kisora PG Integration) */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRICING_TIERS.map((tier) => (
                <SpotlightCard
                  key={tier.id}
                  className={`bg-[#0f0b1a]/90 backdrop-blur-xl border rounded-3xl p-5 space-y-4 font-mono shadow-2xl relative ${
                    tier.popular ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-purple-500/20'
                  }`}
                  spotlightColor="rgba(168, 85, 247, 0.25)"
                >
                  {tier.popular && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30 uppercase">
                      Best Value
                    </span>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-extrabold text-purple-200">{tier.price}</span>
                      <span className="text-[10px] text-purple-400/60">{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-purple-300/80 pt-2 border-t border-purple-500/20">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleDirectBuyQris(tier)}
                    disabled={purchasingPlan === tier.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {purchasingPlan === tier.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Membuat QRIS...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Beli Instan QRIS (Kisora)</span>
                      </>
                    )}
                  </button>
                </SpotlightCard>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0b1a]/70 border border-purple-500/20 text-xs font-mono text-center text-purple-300/60 space-y-1.5">
              <p>⚡ Otomatisasi Pembayaran QRIS didukung oleh <b>Kisora Payment Gateway</b> (Instant Auto-Verify & Minting)</p>
              <p className="text-[11px] text-purple-300/80">
                Udah beli?, chat <a href="https://t.me/aztors" target="_blank" rel="noreferrer" className="text-purple-300 font-bold hover:underline">@aztors</a> untuk proses pulihkan pembelian
              </p>
            </div>
          </div>
        )}
      </div>

      {/* QRIS Checkout Popup Modal */}
      <QrisCheckoutModal
        orderData={qrisOrder}
        onClose={() => setQrisOrder(null)}
        onSuccess={(voucherCode, plan) => {
          setQrisOrder(null)
          localStorage.setItem('tmail_prem_redeem_token', voucherCode)
          localStorage.setItem('tmail_prem_plan', plan)
          onRedeemSuccess(voucherCode, plan)
        }}
      />
    </div>
  )
}
