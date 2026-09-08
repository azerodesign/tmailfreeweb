import React, { useState, useEffect } from 'react'
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { fetchActiveDomains, type DomainItem } from '../services/mailApi'
import { HoverBorderGradient } from './ui/hover-border-gradient'
import { CustomDropdown } from './CustomDropdown'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07050e]/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0f0b1a] w-full max-w-md rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Custom Email Address</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-purple-300/60 hover:text-white hover:bg-purple-950/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5">
              Custom Username
            </label>
            <input
              type="text"
              placeholder="Contoh: azero, vipbox, nanda"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              disabled={isSubmitting}
              autoFocus
              className="w-full h-11 px-3.5 text-xs font-mono bg-[#07050e]/90 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5">
              Pilih Domain VIP
            </label>
            <CustomDropdown
              value={selectedDomain}
              onChange={setSelectedDomain}
              disabled={isLoadingDomains || isSubmitting}
              placeholder={isLoadingDomains ? 'Memuat domain...' : 'Pilih domain...'}
              options={domains.map((d) => ({
                label: `@${d.domain}`,
                value: d.domain,
              }))}
            />
          </div>

          {username && selectedDomain && (
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 font-mono flex items-center justify-between">
              <span className="text-purple-400/60 text-[11px]">Preview:</span>
              <span className="font-bold text-purple-300 truncate">
                {username.trim().toLowerCase()}@{selectedDomain}
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Batal
            </button>

            <HoverBorderGradient className="px-5 py-2 text-xs">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Membuat...</span>
                </div>
              ) : (
                <span>Buat Custom Email</span>
              )}
            </HoverBorderGradient>
          </div>
        </form>
      </div>
    </div>
  )
}
