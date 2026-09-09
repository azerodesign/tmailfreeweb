import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, PlusCircle, Loader2, Sparkles, Trash2, Globe, ChevronDown, Mail } from 'lucide-react'
import { fetchActiveDomains, type DomainItem } from '../services/mailApi'
import { SpotlightCard } from './SpotlightCard'
import { HoverBorderGradient } from './ui/hover-border-gradient'
import { useThemeConfig } from '../hooks/useThemeConfig'

interface GmailSidebarControlProps {
  email: string | null
  isGenerating: boolean
  isFetching: boolean
  countdown: number
  createdCount: number
  onRefresh: () => void
  onGenerateNew: () => void
  onOpenCustom: () => void
  onSelectDomain: (domain: string) => void
  onDeleteMailbox: () => void
  lastChecked: Date | null
}

export const GmailSidebarControl: React.FC<GmailSidebarControlProps> = ({
  email,
  isGenerating,
  isFetching,
  countdown,
  createdCount,
  onRefresh,
  onGenerateNew,
  onOpenCustom,
  onSelectDomain,
  onDeleteMailbox,
  lastChecked,
}) => {
  const [copied, setCopied] = useState(false)
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const theme = useThemeConfig()

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

  const currentDomain = email ? email.split('@')[1] || '' : ''

  useEffect(() => {
    fetchActiveDomains().then(setDomains)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDomainDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopy = async () => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleDomainSelect = (domain: string) => {
    setIsDomainDropdownOpen(false)
    if (domain !== currentDomain) {
      onSelectDomain(domain)
    }
  }

  return (
    <div className="space-y-4">
      {/* Primary Mailbox Address Box */}
      <SpotlightCard
        className={`${theme.bgBox} backdrop-blur-xl rounded-3xl p-4 sm:p-6 border ${theme.borderStyle} shadow-2xl relative overflow-hidden space-y-3 sm:space-y-4`}
        spotlightColor={theme.spotlightColor}
      >
        <div className={`flex items-center justify-between border-b ${theme.borderStyle} pb-2.5`}>
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${theme.textMuted} flex items-center gap-1.5`}>
            <Mail className={`w-3.5 h-3.5 ${theme.textPrimary}`} /> Active Mailbox
          </span>
          <div className={`flex items-center gap-1.5 bg-[#07050e] border ${theme.borderStyle} px-2.5 py-0.5 rounded-full text-[10px] font-mono ${theme.textPrimary}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-current ${theme.textPrimary} ${isFetching ? 'animate-ping' : ''}`}></span>
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full bg-current ${theme.textPrimary}`}></span>
            </span>
            <span>{countdown}s</span>
          </div>
        </div>

        <div>
          <label className={`block text-[10px] font-mono ${theme.textMuted} uppercase tracking-wider mb-1`}>
            Alamat Email Aktif
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={isGenerating ? 'Generating VIP address...' : email || ''}
              className={`w-full h-10 sm:h-11 pl-3 pr-9 text-xs font-mono bg-[#07050e]/90 border ${theme.borderStyle} rounded-xl ${theme.textPrimary} select-all focus:outline-none transition`}
            />
            {isGenerating && (
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textPrimary}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Copy Email Button */}
        <HoverBorderGradient
          onClick={handleCopy}
          className="w-full h-10 sm:h-11 flex items-center justify-center gap-2 cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Email Copied!</span>
            </>
          ) : (
            <>
              <Copy className={`w-4 h-4 ${theme.textPrimary}`} />
              <span>Copy Email Address</span>
            </>
          )}
        </HoverBorderGradient>

        {/* Domain Selector */}
        <div className="relative" ref={dropdownRef}>
          <label className={`block text-[10px] font-mono ${theme.textMuted} uppercase tracking-wider mb-1`}>
            Domain Aktif VIP
          </label>
          <button
            onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
            disabled={isGenerating || domains.length === 0}
            className={`h-9 sm:h-10 px-3 bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} text-xs font-mono font-semibold rounded-xl flex items-center justify-between gap-2 transition disabled:opacity-50 w-full cursor-pointer`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Globe className={`w-3.5 h-3.5 ${theme.textPrimary} shrink-0`} />
              <span className="truncate">@{currentDomain || 'domain'}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 ${theme.textPrimary} transition-transform shrink-0 ${isDomainDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDomainDropdownOpen && (
            <div className={`absolute left-0 right-0 top-14 z-50 bg-[#07050e] border ${theme.borderStyle} rounded-2xl p-2 shadow-2xl max-h-48 overflow-y-auto`}>
              {domains.map((d) => (
                <button
                  key={d.domain}
                  onClick={() => handleDomainSelect(d.domain)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                    d.domain === currentDomain
                      ? `${theme.badgeStyle} font-bold`
                      : `${theme.textMuted} hover:bg-white/[0.04] hover:text-white`
                  }`}
                >
                  <span className="truncate">@{d.domain}</span>
                  {d.domain === currentDomain && <Check className={`w-3.5 h-3.5 ${theme.textPrimary} shrink-0`} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quota Limit Strip */}
        <div className={`bg-[#07050e]/90 border ${theme.borderStyle} rounded-xl p-2.5 sm:p-3 space-y-1.5 font-mono`}>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className={`${theme.textMuted} font-semibold truncate`}>Kuota Harian ({userPlan}):</span>
            <span className="font-bold text-white shrink-0">{remainingLimit} / {maxLimit}</span>
          </div>
          <div className={`w-full bg-[#07050e] h-1.5 sm:h-2 rounded-full border ${theme.borderStyle} overflow-hidden`}>
            <div
              className={`bg-gradient-to-r ${theme.progressGrad} h-full transition-all duration-300`}
              style={{ width: `${(remainingLimit / maxLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Controls Grid */}
        <div className={`pt-2 border-t ${theme.borderStyle} space-y-2`}>
          {lastChecked && (
            <div className={`text-[9px] sm:text-[10px] ${theme.textMuted} font-mono text-center pb-0.5`}>
              Updated: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRefresh}
              disabled={isFetching || isGenerating}
              className={`h-9 sm:h-10 bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${theme.textPrimary} ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={onGenerateNew}
              disabled={isGenerating}
              className={`h-9 sm:h-10 bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer`}
            >
              <PlusCircle className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
              <span>Acak Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenCustom}
              disabled={isGenerating}
              className={`h-9 sm:h-10 bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
              <span>Custom Name</span>
            </button>

            <button
              onClick={onDeleteMailbox}
              disabled={isGenerating}
              className="h-9 sm:h-10 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Mailbox</span>
            </button>
          </div>
        </div>
      </SpotlightCard>
    </div>
  )
}
