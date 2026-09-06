import { useState } from 'react'
import { Header } from './components/Header'
import { DisclaimerAlert } from './components/DisclaimerAlert'
import { EmailHero } from './components/EmailHero'
import { MessageList } from './components/MessageList'
import { MessageModal } from './components/MessageModal'
import { CustomEmailModal } from './components/CustomEmailModal'
import { useMailbox } from './hooks/useMailbox'
import { useTheme } from './hooks/useTheme'
import type { MessageItem } from './services/mailApi'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function App() {
  const { theme, toggleTheme } = useTheme()
  const {
    account,
    messages,
    isLoadingMessages,
    isGeneratingAccount,
    error,
    lastChecked,
    countdown,
    toastMessage,
    fetchInbox,
    initNewAccount,
    createCustomAccount,
    switchDomain,
    deleteCurrentMailbox,
    removeMessage,
  } = useMailbox()

  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between selection:bg-indigo-100 dark:selection:bg-indigo-900/50 selection:text-indigo-700 dark:selection:text-indigo-300 relative transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1 flex flex-col">
        <Header
          isPolling={isLoadingMessages}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Floating Warning Alert (Untitled UI Style) */}
        <DisclaimerAlert />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1 font-medium">{error}</p>
          </div>
        )}

        {/* Desktop 2-Column Split Layout (Desktop lg:grid lg:grid-cols-12, Mobile Stack) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left Column (5 cols): Active Address & Actions */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <EmailHero
              email={account?.address || null}
              isGenerating={isGeneratingAccount}
              isFetching={isLoadingMessages}
              countdown={countdown}
              onRefresh={fetchInbox}
              onGenerateNew={initNewAccount}
              onOpenCustom={() => setIsCustomModalOpen(true)}
              onSelectDomain={switchDomain}
              onDeleteMailbox={deleteCurrentMailbox}
              lastChecked={lastChecked}
            />
          </div>

          {/* Right Column (7 cols): Inbox Messages & Content */}
          <div className="lg:col-span-7 flex flex-col min-h-[420px]">
            <MessageList
              messages={messages}
              isLoading={isLoadingMessages}
              onSelectMessage={setSelectedMessage}
            />
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/80 mt-8">
        <p>Minimalist Free TMail Web • Autonomous Edge Mailbox on Cloudflare Workers & KV</p>
      </footer>

      <MessageModal
        messageItem={selectedMessage}
        token={account?.token || null}
        address={account?.address || null}
        onClose={() => setSelectedMessage(null)}
        onDelete={removeMessage}
      />

      <CustomEmailModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={createCustomAccount}
      />
    </div>
  )
}

export default App
