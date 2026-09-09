import React, { useState } from 'react'
import { Terminal, Key, Activity, Copy, Check } from 'lucide-react'
import { SpotlightCard } from './SpotlightCard'
import { getOrCreateApiKey, maskApiKey } from '../utils/apiKey'

interface LogItem {
  id: string
  timestamp: string
  event: string
  status: 'SUCCESS' | 'INFO' | 'WARN'
}

interface ActivityLogsCardProps {
  token: string | null
  createdCount: number
  logs: LogItem[]
}

export const ActivityLogsCard: React.FC<ActivityLogsCardProps> = ({
  token,
  createdCount,
  logs,
}) => {
  const [copiedKey, setCopiedKey] = useState(false)
  const userPlan = (localStorage.getItem('tmail_prem_plan') || 'VIP_PREMIUM').toUpperCase()

  const getLimitByPlan = (plan: string) => {
    if (plan.includes('MAX')) return 6000
    if (plan.includes('PRO')) return 2000
    if (plan.includes('VIP_PLUS') || plan.includes('VIP+')) return 1000
    if (plan.includes('VIP')) return 300
    return 20
  }

  const maxLimit = getLimitByPlan(userPlan)
  const remainingLimit = Math.max(0, maxLimit - createdCount)
  const fullApiKey = getOrCreateApiKey(token)
  const apiKeyDisplay = maskApiKey(fullApiKey)

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(fullApiKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <SpotlightCard
      className="bg-[#0f0b1a]/90 backdrop-blur-xl rounded-3xl p-5 border border-purple-500/20 shadow-2xl space-y-4 font-mono w-full overflow-hidden"
      spotlightColor="rgba(168, 85, 247, 0.25)"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400/80 flex items-center gap-1.5 truncate">
          <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" /> API Key & Quota Engine
        </span>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] border border-purple-500/30 shrink-0 font-bold">
          VIP ACTIVE
        </span>
      </div>

      {/* API Key Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-purple-300/60 uppercase tracking-wider">
          <span>Session REST Key</span>
          <span>SDK Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={apiKeyDisplay}
            className="w-0 flex-1 min-w-0 h-9 px-3 text-[11px] font-mono bg-[#07050e]/90 border border-purple-500/30 rounded-xl text-purple-300 select-all focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyKey}
            className="h-9 px-3 bg-[#07050e] border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
            title="Copy Full REST API Key"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quota Limit Gauge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-purple-300/70">Kuota Generate Harian:</span>
          <span className="font-bold text-white">
            {remainingLimit} / {maxLimit} /Hari
          </span>
        </div>
        <div className="w-full bg-[#07050e] h-2 rounded-full border border-purple-500/20 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(remainingLimit / maxLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Realtime Terminal Logs */}
      <div className="pt-2 border-t border-purple-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400/80 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Terminal Activity
          </span>
          <div className="flex items-center gap-1 text-[9px] text-purple-400/60 shrink-0">
            <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>STREAM</span>
          </div>
        </div>

        <div className="bg-[#07050e] border border-purple-500/20 rounded-xl p-3 h-32 overflow-y-auto space-y-1.5 text-[10px] font-mono">
          {logs.length === 0 ? (
            <div className="text-purple-400/40 text-center py-8">Belum ada aktivitas tercatat.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-purple-400/40 shrink-0">[{log.timestamp}]</span>
                <span
                  className={`font-bold shrink-0 ${
                    log.status === 'SUCCESS'
                      ? 'text-emerald-400'
                      : log.status === 'WARN'
                      ? 'text-rose-400'
                      : 'text-purple-300'
                  }`}
                >
                  [{log.status}]
                </span>
                <span className="text-purple-200/80 break-all">{log.event}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </SpotlightCard>
  )
}
