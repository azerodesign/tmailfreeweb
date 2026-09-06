import React, { useEffect, useState } from 'react'
import { X, Trash2, User, Clock, Loader2, AlertCircle, FileText, Code, KeyRound, Copy, Check } from 'lucide-react'
import { getMessageDetail, type MessageDetail, type MessageItem } from '../services/mailApi'
import { parseSender } from '../utils/formatSender'
import { extractOtpCode } from '../utils/otpDetector'

interface MessageModalProps {
  messageItem: MessageItem | null
  token: string | null
  address?: string | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

export const MessageModal: React.FC<MessageModalProps> = ({
  messageItem,
  token,
  address,
  onClose,
  onDelete,
}) => {
  const [detail, setDetail] = useState<MessageDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html')
  const [copiedOtp, setCopiedOtp] = useState(false)

  useEffect(() => {
    if (!messageItem) {
      setDetail(null)
      return
    }

    let active = true
    setIsLoading(true)
    setError(null)
    setViewMode('html')
    setCopiedOtp(false)

    getMessageDetail(token || '', messageItem.id, address || undefined)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat pesan')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [messageItem, token, address])

  if (!messageItem) return null

  const handleDelete = async () => {
    if (!messageItem) return
    setIsDeleting(true)
    try {
      await onDelete(messageItem.id)
      onClose()
    } catch {
      // ignore
    } finally {
      setIsDeleting(false)
    }
  }

  const sender = parseSender(messageItem.from)
  const htmlContent = detail?.html && detail.html.length > 0 ? detail.html[0] : null
  const textContent = detail?.text || messageItem.intro
  const otp = extractOtpCode(messageItem.subject, textContent)

  const handleCopyOtp = async () => {
    if (!otp) return
    try {
      await navigator.clipboard.writeText(otp)
      setCopiedOtp(true)
      setTimeout(() => setCopiedOtp(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">
                {messageItem.subject || '(No Subject)'}
              </h3>

              {otp && (
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  title="Click to copy OTP code"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-mono font-semibold shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>OTP: {otp}</span>
                  {copiedOtp ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-70 ml-1" />
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{sender.name}</span>
                {sender.email && sender.email !== sender.name && (
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] truncate max-w-50 sm:max-w-xs">
                    &lt;{sender.email}&gt;
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {new Date(messageItem.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* View Mode Toggle */}
            {htmlContent && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg mr-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('html')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'html'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'text'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Text</span>
                </button>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete email"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm text-slate-700 dark:text-slate-300">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs">Loading message content...</span>
            </div>
          ) : error ? (
            <div className="py-8 flex flex-col items-center justify-center text-rose-500 gap-2">
              <AlertCircle className="w-6 h-6" />
              <span className="text-xs">{error}</span>
            </div>
          ) : viewMode === 'html' && htmlContent ? (
            <iframe
              title="Email content"
              srcDoc={htmlContent}
              sandbox="allow-same-origin"
              className="w-full min-h-87.5 border-0 rounded-lg bg-white"
            />
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {textContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
