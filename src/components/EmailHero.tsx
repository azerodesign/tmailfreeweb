import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, PlusCircle, Loader2, Sparkles, Trash2, Globe, ChevronDown, Gauge } from 'lucide-react'
import { fetchActiveDomains, type DomainItem, type RateLimitStatus } from '../services/mailApi'

interface EmailHeroProps {
  email: string | null
  isGenerating: boolean
  isFetching: boolean
  isLimitReached?: boolean
  rateLimit?: RateLimitStatus
  newCooldown?: number
  refreshCooldown?: number
  countdown: number
  onRefresh: () => void
  onGenerateNew: () => void
  onOpenCustom: () => void
  onSelectDomain: (domain: string) => void
  onOpenDeleteConfirm: () => void
  lastChecked: Date | null
}

export const EmailHero: React.FC<EmailHeroProps> = ({
  email,
  isGenerating,
  isFetching,
  isLimitReached,
  rateLimit,
  newCooldown = 0,
  refreshCooldown = 0,
  countdown,
  onRefresh,
  onGenerateNew,
  onOpenCustom,
  onSelectDomain,
  onOpenDeleteConfirm,
  lastChecked,
}) => {
  const [copied, setCopied] = useState(false)
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentDomain = email ? email.split('@')[1] || '' : ''
  const remaining = rateLimit ? rateLimit.remaining : 100
  const limit = rateLimit ? rateLimit.limit : 100

  // Badge styling based on remaining quota
  const getQuotaBadgeStyle = () => {
    if (remaining <= 0 || isLimitReached) {
      return 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
    }
    if (remaining < 20) {
      return 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
    }
    return 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
  }

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Temporary Address
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">Your Mailbox Ready</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
            {/* Daily Quota Indicator Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${getQuotaBadgeStyle()}`}
              title="Daily generation quota per IP (resets 00:00 UTC)"
            >
              <Gauge className="w-3.5 h-3.5 shrink-0" />
              <span>
                Daily Quota: <strong className="font-semibold">{remaining}</strong>/{limit}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${isFetching ? 'animate-ping' : ''}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Auto-refresh: {countdown}s</span>
            </div>
            {lastChecked && (
              <span className="hidden xl:inline text-slate-400 text-[11px]">
                {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Quota warning banner when limit reached */}
        {isLimitReached && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <span>Batas 100 email harian tercapai. Reset jam 00:00 UTC.</span>
            <span className="font-mono text-[11px] opacity-80 shrink-0">0/{limit}</span>
          </div>
        )}

        {/* Row 1: Email Address Input + Copy Button */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 mb-3.5">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              value={isGenerating ? 'Generating mailbox address...' : email || ''}
              className="w-full h-11 sm:h-12 pl-4 pr-12 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            {isGenerating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={handleCopy}
            disabled={!email || isGenerating}
            className="h-11 sm:h-12 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Actions Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh button with cooldown & spinner */}
          <button
            onClick={onRefresh}
            disabled={isFetching || isGenerating || refreshCooldown > 0}
            title={refreshCooldown > 0 ? `Tunggu ${refreshCooldown}s` : 'Refresh inbox'}
            className="h-9 px-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 active:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            )}
            <span>{refreshCooldown > 0 ? `Wait ${refreshCooldown}s` : 'Refresh'}</span>
          </button>

          {/* New Mailbox button with cooldown & spinner */}
          <button
            onClick={onGenerateNew}
            disabled={isGenerating || isLimitReached || newCooldown > 0}
            title={
              isLimitReached
                ? 'Daily quota limit reached (100/100)'
                : newCooldown > 0
                ? `Tunggu ${newCooldown}s`
                : 'Change random email address'
            }
            className="h-9 px-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            ) : (
              <PlusCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            )}
            <span>{newCooldown > 0 ? `Wait ${newCooldown}s` : 'New'}</span>
          </button>

          {/* Change Domain Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDomainDropdownOpen((prev) => !prev)}
              disabled={isGenerating || domains.length === 0}
              title="Change domain"
              className="h-9 px-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Change Domain</span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                {currentDomain ? `(@${currentDomain})` : ''}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isDomainDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDomainDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select Domain
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {domains.map((d) => {
                    const isSelected = d.domain === currentDomain
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDomainSelect(d.domain)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="font-mono truncate text-xs">@{d.domain}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenCustom}
            disabled={isGenerating || isLimitReached}
            title={isLimitReached ? 'Daily quota limit reached' : 'Create custom email address'}
            className="h-9 px-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/50 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Custom</span>
          </button>
        </div>

        {/* Delete Mailbox Button -> Triggers DeleteConfirmModal */}
        <button
          onClick={onOpenDeleteConfirm}
          disabled={isGenerating}
          title="Delete current mailbox & create fresh one"
          className="h-9 px-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Delete</span>
        </button>
      </div>
    </div>
  )
}
