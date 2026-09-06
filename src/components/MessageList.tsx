import React, { useState } from 'react'
import { Inbox, User, Clock, ChevronRight, Loader2, KeyRound, Copy, Check } from 'lucide-react'
import type { MessageItem } from '../services/mailApi'
import { parseSender } from '../utils/formatSender'
import { extractOtpCode } from '../utils/otpDetector'

interface MessageListProps {
  messages: MessageItem[]
  isLoading: boolean
  onSelectMessage: (msg: MessageItem) => void
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'just now'
    const diffMin = Math.floor(diffSec / 1000 / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}h ago`
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onSelectMessage,
}) => {
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null)

  const handleCopyOtp = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopiedOtp(code)
      setTimeout(() => setCopiedOtp(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Inbox Messages</h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
            {messages.length}
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Checking...</span>
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="py-16 px-4 text-center flex flex-col items-center justify-center flex-1">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Waiting for incoming messages</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
            Emails sent to your temporary address will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto max-h-150 lg:max-h-none flex-1">
          {messages.map((msg) => {
            const sender = parseSender(msg.from)
            const otp = extractOtpCode(msg.subject, msg.intro)

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className="p-4 sm:px-6 flex items-start sm:items-center justify-between gap-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-semibold text-xs uppercase mt-0.5 sm:mt-0">
                    {sender.name.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sender.name}
                      </span>
                      {!msg.seen && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}

                      {/* OTP Auto-Detector Badge with Quick-Copy */}
                      {otp && (
                        <span
                          onClick={(e) => handleCopyOtp(e, otp)}
                          title="Click to copy OTP verification code"
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-semibold shadow-xs hover:bg-amber-100/80 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>OTP: {otp}</span>
                          {copiedOtp === otp ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                          ) : (
                            <Copy className="w-3 h-3 text-amber-600 dark:text-amber-400 opacity-70 hover:opacity-100 ml-0.5" />
                          )}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate font-medium">
                      {msg.subject || '(No Subject)'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {msg.intro}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-right mt-1 sm:mt-0">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors hidden sm:inline" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
