import React, { useState, useEffect } from 'react'
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { fetchActiveDomains, type DomainItem } from '../services/mailApi'

interface CustomEmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (username: string, domain: string) => Promise<boolean>
}

export const CustomEmailModal: React.FC<CustomEmailModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [username, setUsername] = useState('')
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setUsername('')
      setError(null)
      return
    }

    let active = true
    setIsLoadingDomains(true)
    fetchActiveDomains()
      .then((list) => {
        if (active) {
          setDomains(list)
          if (list.length > 0) {
            setSelectedDomain(list[0].domain)
          }
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (active) setIsLoadingDomains(false)
      })

    return () => {
      active = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const validateUsername = (val: string): string | null => {
    const trimmed = val.trim()
    if (!trimmed) return 'Username tidak boleh kosong'
    if (trimmed.length < 3) return 'Username minimal 3 karakter'
    if (trimmed.length > 30) return 'Username maksimal 30 karakter'
    // Izinkan huruf kecil, angka, titik, strip
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      return 'Hanya boleh berisi huruf, angka, titik (.), strip (-), atau underscore (_)'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }
    if (!selectedDomain) {
      setError('Pilih domain terlebih dahulu')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(username.trim().toLowerCase(), selectedDomain)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat custom email')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-base">Custom Email Address</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Username</label>
            <input
              type="text"
              placeholder="e.g. azero, mybox, john"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              disabled={isSubmitting}
              autoFocus
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Domain</label>
            <div className="relative">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                disabled={isLoadingDomains || isSubmitting}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.domain} className="dark:bg-slate-900 dark:text-white">
                    @{d.domain}
                  </option>
                ))}
              </select>
              {isLoadingDomains && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {username && selectedDomain && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 font-mono flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Preview:</span>
              <span className="font-semibold truncate">
                {username.trim().toLowerCase()}@{selectedDomain}
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Custom Email</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
