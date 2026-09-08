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
      <div className={`p-5 sm:px-6 border-b ${theme.borderStyle} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Inbox className={`w-4 h-4 ${theme.textPrimary}`} />
          <h3 className="font-bold text-white text-sm tracking-tight">VIP Mailbox Messages</h3>
          <span className={`text-xs ${theme.badgeStyle} font-mono font-bold px-2 py-0.5 rounded-full border`}>
            {messages.length}
          </span>
        </div>

        {isLoading && (
          <div className={`flex items-center gap-1.5 text-xs font-mono ${theme.textPrimary}`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Memeriksa pesan...</span>
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="py-20 px-4 text-center flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-[#07050e] border ${theme.borderStyle} flex items-center justify-center ${theme.textPrimary} shadow-inner`}>
              <Inbox className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
          </div>
          <p className="text-sm font-bold text-white">Menunggu Pesan Masuk</p>
          <p className={`text-xs ${theme.textMuted} max-w-xs mt-1 font-mono`}>
            Email yang dikirim ke alamat VIP kamu akan otomatis muncul di sini dalam beberapa detik.
          </p>
        </div>
      ) : (
        <div className={`divide-y ${theme.borderStyle}`}>
          {messages.map((msg) => {
            const sender = parseSender(msg.from)
            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-emerald-950/30 cursor-pointer transition-colors group"
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
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
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
