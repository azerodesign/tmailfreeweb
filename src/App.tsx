import { useState } from 'react'
import { Header } from './components/Header'
import { EmailHero } from './components/EmailHero'
import { MessageList } from './components/MessageList'
import { MessageModal } from './components/MessageModal'
import { CustomEmailModal } from './components/CustomEmailModal'
import { useMailbox } from './hooks/useMailbox'
import type { MessageItem } from './services/mailApi'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function App() {
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-700 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Header isPolling={isLoadingMessages} />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1 font-medium">{error}</p>
          </div>
        )}

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

        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          onSelectMessage={setSelectedMessage}
        />
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/50">
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
