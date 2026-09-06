import React, { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

const DISCLAIMER_STORAGE_KEY = 'tmail_disclaimer_dismissed'

export const DisclaimerAlert: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISCLAIMER_STORAGE_KEY)
      if (!dismissed) {
        setIsVisible(true)
      }
    } catch {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
  }

  if (!isVisible) return null

  return (
    <div
      role="alert"
      className="mb-6 rounded-2xl border border-amber-200/90 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/40 p-4 sm:p-4.5 shadow-xs backdrop-blur-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-3.5 text-amber-900 dark:text-amber-200"
    >
      {/* Icon in dedicated rounded container */}
      <div className="w-9 h-9 rounded-xl bg-amber-100/90 dark:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 shadow-2xs">
        <AlertTriangle className="w-4.5 h-4.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
        <p className="font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-1.5 mb-0.5">
          <span>Layanan Temp-Mail Publik &amp; Gratis</span>
        </p>
        <p className="text-amber-800/90 dark:text-amber-300/90 font-normal">
          Inbox ini bersifat sementara dan tidak bergaransi. Dilarang keras melakukan abuse, spam massal, atau tindakan ilegal.
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        title="Tutup pemberitahuan"
        className="p-1.5 -mr-1 -mt-1 rounded-xl text-amber-700/70 hover:text-amber-950 dark:text-amber-400/80 dark:hover:text-amber-100 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  )
}
