import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, PlusCircle, Loader2, Sparkles, Trash2, Globe, ChevronDown } from 'lucide-react'
import { fetchActiveDomains, type DomainItem } from '../services/mailApi'
import { SpotlightCard } from './SpotlightCard'
import { HoverBorderGradient } from './ui/hover-border-gradient'

interface EmailHeroProps {
  email: string | null
  isGenerating: boolean
  isFetching: boolean
  countdown: number
  onRefresh: () => void
  onGenerateNew: () => void
  onOpenCustom: () => void
  onSelectDomain: (domain: string) => void
  onDeleteMailbox: () => void
  lastChecked: Date | null
}

export const EmailHero: React.FC<EmailHeroProps> = ({
  email,
  isGenerating,
  isFetching,
  countdown,
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
    <SpotlightCard
      className="bg-[#0f0b1a]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-purple-500/20 mb-6 shadow-2xl relative overflow-hidden"
      spotlightColor="rgba(168, 85, 247, 0.25)"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-purple-500/20 pb-4">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400/80">
            Active Temporary Address
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight">Your VIP Mailbox Ready</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-purple-300/70 font-mono">
          <div className="flex items-center gap-1.5 bg-[#07050e] border border-purple-500/30 px-3 py-1 rounded-xl text-purple-300">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-purple-400 ${isFetching ? 'animate-ping' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span>Auto-refresh: {countdown}s</span>
          </div>
          {lastChecked && (
            <span className="hidden sm:inline text-purple-400/60">
              {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={isGenerating ? 'Generating VIP mailbox address...' : email || ''}
            className="w-full h-12 pl-4 pr-12 text-sm sm:text-base font-mono bg-[#07050e]/90 border border-purple-500/30 rounded-xl text-purple-200 select-all focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          />
          {isGenerating && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        <HoverBorderGradient
          onClick={handleCopy}
          className="h-12 px-6 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-purple-400" />
              <span>Copy Email</span>
            </>
          )}
        </HoverBorderGradient>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onRefresh}
            disabled={isFetching || isGenerating}
            title="Refresh inbox"
            className="h-12 px-3.5 bg-[#07050e] border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="sm:hidden">Refresh</span>
          </button>

          <button
            onClick={onGenerateNew}
            disabled={isGenerating}
            title="Acak Email Baru"
            className="h-12 px-3.5 bg-[#07050e] border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span className="whitespace-nowrap">Acak</span>
          </button>

          <button
            onClick={onOpenCustom}
            disabled={isGenerating}
            title="Custom Username"
            className="h-12 px-3.5 bg-[#07050e] border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="whitespace-nowrap">Custom</span>
          </button>

          {/* Domain Picker Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
            <button
              onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
              disabled={isGenerating || domains.length === 0}
              className="h-12 px-3.5 bg-[#07050e] border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold rounded-xl flex items-center justify-between gap-2 transition disabled:opacity-50 w-full sm:w-auto"
            >
              <Globe className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate max-w-[120px] font-mono">@{currentDomain || 'domain'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-purple-400 transition-transform ${isDomainDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDomainDropdownOpen && (
              <div className="absolute right-0 top-14 z-50 w-56 bg-[#0f0b1a] border border-purple-500/30 rounded-2xl p-2 shadow-2xl max-h-60 overflow-y-auto">
                <div className="text-[10px] font-mono text-purple-400/60 uppercase tracking-wider px-3 py-1.5 border-b border-purple-500/20 mb-1">
                  Pilih Active Domain VIP
                </div>
                {domains.map((d) => (
                  <button
                    key={d.domain}
                    onClick={() => handleDomainSelect(d.domain)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                      d.domain === currentDomain
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 font-bold'
                        : 'text-purple-300/80 hover:bg-purple-950/40 hover:text-white'
                    }`}
                  >
                    <span>@{d.domain}</span>
                    {d.domain === currentDomain && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onDeleteMailbox}
            disabled={isGenerating}
            title="Hapus Inbox"
            className="h-12 px-3 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-xl flex items-center justify-center transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </SpotlightCard>
  )
}
