import React from 'react'
import { Inbox, User, Clock, ChevronRight, Loader2 } from 'lucide-react'
import type { MessageItem } from '../services/mailApi'
import { parseSender } from '../utils/formatSender'
import { SpotlightCard } from './SpotlightCard'
import { useThemeConfig } from '../hooks/useThemeConfig'

interface MessageListProps {
  messages: MessageItem[]
  isLoading: boolean
  onSelectMessage: (msg: MessageItem) => void
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'baru saja'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m lalu`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}j lalu`
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
  const theme = useThemeConfig()

  return (
    <SpotlightCard
      className={`${theme.bgBox} backdrop-blur-xl rounded-3xl border ${theme.borderStyle} shadow-2xl overflow-hidden p-0`}
      spotlightColor={theme.spotlightColor}
    >
      <div className={`flex items-center justify-between gap-3 border-b ${theme.borderStyle} p-4 sm:px-6 sm:py-5`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.badgeStyle} border`}>
            <Inbox className={`h-4 w-4 ${theme.textPrimary}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold tracking-tight text-white">Inbox</h3>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${theme.badgeStyle} font-mono`}>
                {messages.length}
              </span>
            </div>
            <p className={`mt-0.5 truncate text-[10px] ${theme.textMuted} font-mono`}>Pesan masuk terbaru</p>
          </div>
        </div>

        {isLoading && (
          <div className={`flex shrink-0 items-center gap-1.5 text-[10px] font-mono ${theme.textPrimary}`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline">Memeriksa pesan</span>
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex min-h-[21rem] flex-col items-center justify-center px-6 py-16 text-center">
          <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${theme.borderStyle} bg-[#07050e] ${theme.textPrimary} shadow-inner`}>
            <Inbox className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-white">Inbox siap menerima pesan</p>
          <p className={`mt-2 max-w-sm text-xs leading-5 ${theme.textMuted}`}>
            Kode OTP dan email baru akan muncul otomatis. Tidak perlu refresh manual.
          </p>
          <div className={`mt-5 flex items-center gap-2 rounded-full border ${theme.borderStyle} bg-[#07050e]/70 px-3 py-1.5 text-[10px] ${theme.textMuted} font-mono`}>
            <span className={`h-1.5 w-1.5 animate-pulse rounded-full bg-current ${theme.textPrimary}`} />
            Auto-refresh aktif
          </div>
        </div>
      ) : (
        <div className={`divide-y ${theme.borderStyle}`}>
          {messages.map((msg) => {
            const sender = parseSender(msg.from)
            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className={`group flex cursor-pointer items-center justify-between gap-3 border-l-2 border-transparent p-4 transition-colors hover:border-current hover:bg-white/[0.035] sm:px-6 ${!msg.seen ? 'bg-white/[0.018]' : ''}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl ${theme.badgeStyle} border flex items-center justify-center shrink-0 transition-colors font-bold text-xs uppercase`}>
                    {sender.name.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {sender.name}
                      </span>
                      {!msg.seen && (
                        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${theme.badgeStyle}`}>
                          BARU
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 truncate font-medium">
                      {msg.subject || '(Tanpa Subjek)'}
                    </p>
                    <p className={`text-xs ${theme.textMuted} truncate mt-0.5 font-mono`}>
                      {msg.intro}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right font-mono">
                  <div className={`flex items-center gap-1 text-xs ${theme.textMuted}`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${theme.textMuted} group-hover:text-white transition-colors`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SpotlightCard>
  )
}
