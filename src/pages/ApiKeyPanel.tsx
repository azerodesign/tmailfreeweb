import { useState } from 'react'
import { Key, Copy, Check, Zap, ArrowLeft } from 'lucide-react'
import { SpotlightCard } from '../components/SpotlightCard'
import { HoverBorderGradient } from '../components/ui/hover-border-gradient'
import { MoltenMetal } from '../components/MoltenMetal'
import { Header } from '../components/Header'

interface ApiKeyPanelProps {
  token: string | null
  createdCount: number
}

export function ApiKeyPanel({ token, createdCount }: ApiKeyPanelProps) {
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedDocs, setCopiedDocs] = useState(false)
  const userPlan = (localStorage.getItem('tmail_prem_plan') || 'VIP').toUpperCase()
  
  const getLimitByPlan = (plan: string) => {
    if (plan.includes('MAX')) return 6000
    if (plan.includes('PRO')) return 2000
    if (plan.includes('VIP_PLUS') || plan.includes('VIP+')) return 1000
    if (plan.includes('VIP')) return 300
    return 20
  }

  const maxLimit = getLimitByPlan(userPlan)
  const remainingLimit = Math.max(0, maxLimit - createdCount)
  const fullApiKey = token ? `TML-VIP-${token}` : 'TML-VIP-SESSION-TOKEN'

  const handleCopyKey = async () => {
    if (!token) return
    try {
      await navigator.clipboard.writeText(fullApiKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } catch {
      // fallback
    }
  }

  const sampleCurl = `curl -X GET "https://tmail-prem-web.vercel.app/api/v1/messages" \\
  -H "Authorization: Bearer ${fullApiKey}"`

  const handleCopyDocs = async () => {
    try {
      await navigator.clipboard.writeText(sampleCurl)
      setCopiedDocs(true)
      setTimeout(() => setCopiedDocs(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 p-4 sm:p-8 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
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

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <Header />

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-purple-500/20 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">VIP REST API & Credentials</h1>
              <p className="text-xs text-purple-300/70 font-mono">Kelola API Key, rate-limit, dan dokumentasi REST SDK.</p>
            </div>
          </div>

          <a
            href="/inbox"
            className="px-4 py-2 rounded-xl bg-[#0f0b1a] hover:bg-purple-950/50 border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Kembali ke Inbox</span>
          </a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* API Key Box */}
          <SpotlightCard className="md:col-span-2 bg-[#0f0b1a]/90 border border-purple-500/20 rounded-3xl p-6 space-y-5 font-mono shadow-2xl" spotlightColor="rgba(168, 85, 247, 0.25)">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" /> Active Session Bearer Key
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30 font-bold">
                SDK / REST ACTIVE
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-purple-300/60 uppercase tracking-wider mb-2">
                Full Bearer Token
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullApiKey}
                  className="flex-1 h-11 px-4 text-xs font-mono bg-[#07050e]/90 border border-purple-500/30 rounded-xl text-purple-200 select-all focus:outline-none"
                />
                <HoverBorderGradient onClick={handleCopyKey} className="px-4 py-2.5 text-xs">
                  {copiedKey ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Check className="w-4 h-4" /> Copied
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Copy className="w-4 h-4 text-purple-400" /> Copy Key
                    </div>
                  )}
                </HoverBorderGradient>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300/70">Sample cURL Request</span>
                <button onClick={handleCopyDocs} className="text-purple-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer">
                  {copiedDocs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDocs ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-[#07050e] border border-purple-500/20 rounded-2xl text-[11px] text-purple-200/90 overflow-x-auto">
                {sampleCurl}
              </pre>
            </div>
          </SpotlightCard>

          {/* Quota & Engine Card */}
          <SpotlightCard className="bg-[#0f0b1a]/90 border border-purple-500/20 rounded-3xl p-6 space-y-5 font-mono shadow-2xl" spotlightColor="rgba(168, 85, 247, 0.25)">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Rate Quota
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300/70">Plan Tier:</span>
                <span className="font-bold text-purple-300">{userPlan}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300/70">Sisa Kuota Harian:</span>
                <span className="font-bold text-white">{remainingLimit} / {maxLimit} Generate/Hari</span>
              </div>
              <div className="w-full bg-[#07050e] h-2.5 rounded-full border border-purple-500/20 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${(remainingLimit / maxLimit) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-purple-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between text-purple-300/70">
                <span>Protocol:</span>
                <span className="text-white font-bold">HTTPS / TLS 1.3</span>
              </div>
              <div className="flex items-center justify-between text-purple-300/70">
                <span>Format:</span>
                <span className="text-white font-bold">JSON REST API</span>
              </div>
              <div className="flex items-center justify-between text-purple-300/70">
                <span>Authentication:</span>
                <span className="text-emerald-400 font-bold">Bearer Token</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}
