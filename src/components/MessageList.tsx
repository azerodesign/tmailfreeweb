import React from 'react'
import { Inbox, User, Clock, ChevronRight, Loader2 } from 'lucide-react'
import type { MessageItem } from '../services/mailApi'
import { parseSender } from '../utils/formatSender'

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
    const diffMin = Math.floor(diffSec / 60)
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
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Inbox Messages</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {messages.length}
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Checking...</span>
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">Waiting for incoming messages</p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Emails sent to your temporary address will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {messages.map((msg) => {
            const sender = parseSender(msg.from)
            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors font-semibold text-xs uppercase">
                    {sender.name.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {sender.name}
                      </span>
                      {!msg.seen && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 truncate font-medium">
                      {msg.subject || '(No Subject)'}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {msg.intro}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
