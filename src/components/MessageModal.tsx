import React, { useEffect, useState } from 'react'
import { X, Trash2, User, Clock, Loader2, AlertCircle, FileText, Code, KeyRound, Copy, CheckCircle2 } from 'lucide-react'
import { getMessageDetail, type MessageDetail, type MessageItem } from '../services/mailApi'
import { parseSender } from '../utils/formatSender'
import { HoverBorderGradient } from './ui/hover-border-gradient'

interface MessageModalProps {
  messageItem: MessageItem | null
  token: string | null
  address?: string | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

// Extract 4 to 8 digit OTP codes from subject or email body
function extractOtpCode(text: string, subject: string): string | null {
  const fullText = `${subject} ${text}`
  const match = fullText.match(/\b(\d{4,8})\b/)
  return match ? match[1] : null
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

  // Auto-detect OTP Code
  const detectedOtp = extractOtpCode(textContent + ' ' + (htmlContent || ''), messageItem.subject || '')

  const handleCopyOtp = async () => {
    if (!detectedOtp) return
    try {
      await navigator.clipboard.writeText(detectedOtp)
      setCopiedOtp(true)
      setTimeout(() => setCopiedOtp(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07050e]/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0f0b1a] w-full max-w-2xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col max-h-[88vh] text-slate-100">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-purple-500/20 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
              {messageItem.subject || '(Tanpa Subjek)'}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-300/70 mt-1 font-mono">
              <span className="flex items-center gap-1.5 font-medium text-purple-200">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>{sender.name}</span>
                {sender.email && sender.email !== sender.name && (
                  <span className="text-purple-400/60 font-normal truncate max-w-50 sm:max-w-xs">
                    &lt;{sender.email}&gt;
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 text-purple-400/60">
                <Clock className="w-3.5 h-3.5" />
                {new Date(messageItem.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* View Mode Toggle */}
            {htmlContent && (
              <div className="flex items-center bg-[#07050e] p-1 rounded-xl mr-1 text-xs border border-purple-500/20 font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode('html')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'html'
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      : 'text-purple-300/60 hover:text-white'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'text'
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      : 'text-purple-300/60 hover:text-white'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Text</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-purple-300/60 hover:text-white hover:bg-purple-950/40 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auto-Detected OTP Card Strip */}
        {detectedOtp && (
          <div className="bg-purple-950/40 border-b border-purple-500/20 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-300/70 uppercase tracking-wider block">
                  Kode Verification / OTP Terdeteksi
                </span>
                <span className="font-mono font-extrabold text-xl text-purple-200 tracking-wider">
                  {detectedOtp}
                </span>
              </div>
            </div>

            <HoverBorderGradient
              onClick={handleCopyOtp}
              className="px-4 py-2 text-xs flex items-center gap-1.5"
            >
              {copiedOtp ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied OTP!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>1-Click Copy OTP</span>
                </>
              )}
            </HoverBorderGradient>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:px-6 flex-1 overflow-y-auto min-h-48 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-purple-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-xs font-mono">Memuat detail isi pesan...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : viewMode === 'html' && htmlContent ? (
            <div
              className="prose prose-invert prose-purple max-w-none text-sm text-slate-200 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs text-purple-200/90 leading-relaxed break-words">
              {textContent}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-purple-500/20 bg-[#07050e]/60 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-950/50 hover:border-rose-800/60 border border-transparent transition text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Hapus Pesan</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#07050e] border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
