import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, PlusCircle, Loader2, Sparkles, Trash2, Globe, ChevronDown } from 'lucide-react'
import { fetchActiveDomains, type DomainItem } from '../services/mailApi'

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
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Temporary Address
          </span>
          <h2 className="text-lg font-semibold text-slate-800">Your Mailbox Ready</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${isFetching ? 'animate-ping' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Auto-refresh: {countdown}s</span>
          </div>
          {lastChecked && (
            <span className="hidden sm:inline text-slate-400">
              Updated {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={isGenerating ? 'Generating mailbox address...' : email || ''}
            className="w-full h-12 pl-4 pr-12 text-sm sm:text-base font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {isGenerating && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        <button
          onClick={handleCopy}
          disabled={!email || isGenerating}
          className="h-12 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
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

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onRefresh}
            disabled={isFetching || isGenerating}
            title="Refresh inbox"
            className="h-12 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="sm:hidden">Refresh</span>
          </button>

          <button
            onClick={onGenerateNew}
            disabled={isGenerating}
            title="Change random email address"
            className="h-12 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span className="whitespace-nowrap">New</span>
          </button>

          {/* Change Domain Dropdown Button */}
          <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDomainDropdownOpen((prev) => !prev)}
              disabled={isGenerating || domains.length === 0}
              title="Change domain"
              className="w-full sm:w-auto h-12 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl flex items-center justify-between sm:justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="whitespace-nowrap font-medium">Change Domain</span>
                <span className="font-mono text-xs text-slate-400 truncate max-w-28 hidden md:inline">
                  {currentDomain ? `(@${currentDomain})` : ''}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isDomainDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDomainDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Domain
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {domains.map((d) => {
                    const isSelected = d.domain === currentDomain
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDomainSelect(d.domain)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-mono truncate">@{d.domain}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onOpenCustom}
            disabled={isGenerating}
            title="Create custom email address"
            className="h-12 px-4 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100/70 text-indigo-700 text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="whitespace-nowrap font-semibold">Custom</span>
          </button>

          <button
            onClick={onDeleteMailbox}
            disabled={isGenerating}
            title="Delete current mailbox & create fresh one"
            className="h-12 px-3 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-sm font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete Mailbox</span>
          </button>
        </div>
      </div>
    </div>
  )
}
