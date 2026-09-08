import { useState } from 'react'
import { Header } from './components/Header'
import { GmailSidebarControl } from './components/GmailSidebarControl'
import { MessageList } from './components/MessageList'
import { MessageModal } from './components/MessageModal'
import { CustomEmailModal } from './components/CustomEmailModal'
import { RedeemGate } from './components/RedeemGate'
import { AdminPanel } from './pages/AdminPanel'
import { ApiKeyPanel } from './pages/ApiKeyPanel'
import { LogsPanel } from './pages/LogsPanel'
import { useMailbox } from './hooks/useMailbox'
import type { MessageItem } from './services/mailApi'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { MoltenMetal } from './components/MoltenMetal'
import { useThemeConfig } from './hooks/useThemeConfig'

export function App() {
  const currentPath = window.location.pathname
  const isAdminRoute = currentPath.startsWith('/admin')
  const isApiKeyRoute = currentPath.startsWith('/apikey')
  const isLogsRoute = currentPath.startsWith('/logs')

  // Auto-redirect root `/` to `/inbox` for consistent SPA routing
  if (window.location.pathname === '/') {
    window.history.replaceState(null, '', '/inbox')
  }

  const [redeemToken, setRedeemToken] = useState<string | null>(() => localStorage.getItem('tmail_prem_redeem_token'))

  const {
    account,
    messages,
    isLoadingMessages,
    isGeneratingAccount,
    error,
    lastChecked,
    countdown,
    toastMessage,
    logs,
    createdCount,
    fetchInbox,
    initNewAccount,
    createCustomAccount,
    switchDomain,
    deleteCurrentMailbox,
    removeMessage,
  } = useMailbox()

  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  // 1. Route Admin Gate
  if (isAdminRoute) {
    return <AdminPanel />
  }

  // 2. Auth Gate Check for `/inbox`, `/apikey`, and `/logs`
  if (!redeemToken) {
    return <RedeemGate onRedeemSuccess={(token) => setRedeemToken(token)} />
  }

  const theme = useThemeConfig()

  // 3. Protected Routes after Login
  if (isApiKeyRoute) {
    return <ApiKeyPanel token={account?.token || null} createdCount={createdCount} />
  }

  if (isLogsRoute) {
    return <LogsPanel logs={logs} />
  }

  return (
    <div className={`min-h-screen bg-[#07050e] text-slate-100 flex flex-col justify-between ${theme.selection} selection:text-white relative overflow-hidden font-sans`}>
      {/* Dynamic Role-Based Background MoltenMetal Fluid Animation */}
      <MoltenMetal
        color1={theme.color1}
        color2={theme.color2}
        color3={theme.color3}
        speed={0.2}
        scale={3.8}
        glow={1.4}
        opacity={0.4}
        backgroundColor="#07050e"
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 py-4 sm:py-6 flex-1">
        {/* Top Navigation Header */}
        <Header />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 ${theme.bgBox} text-white text-xs font-mono font-medium px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border ${theme.borderStyle} max-w-[90vw]`}>
            <CheckCircle2 className={`w-4 h-4 ${theme.textPrimary} shrink-0`} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchInbox()}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800/80 rounded-lg text-rose-100 text-[11px] font-bold transition cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Main 2-Column Gmail Dark Tech Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Panel (Mailbox Controls & Quota Meter) */}
          <div className="lg:col-span-1">
            <GmailSidebarControl
              email={account?.address || null}
              isGenerating={isGeneratingAccount}
              isFetching={isLoadingMessages}
              countdown={countdown}
              createdCount={createdCount}
              onRefresh={() => fetchInbox()}
              onGenerateNew={() => initNewAccount()}
              onOpenCustom={() => setIsCustomModalOpen(true)}
              onSelectDomain={(domain) => switchDomain(domain)}
              onDeleteMailbox={() => deleteCurrentMailbox()}
              lastChecked={lastChecked}
            />
          </div>

          {/* Right Panel (Inbox Message Stream) */}
          <div className="lg:col-span-2">
            <MessageList
              messages={messages}
              isLoading={isLoadingMessages}
              onSelectMessage={(msg) => setSelectedMessage(msg)}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className={`py-5 text-center text-[11px] ${theme.textMuted} font-mono border-t ${theme.borderStyle} relative z-10`}>
        <p>TMail Prem Engine v2.4 • Edge Cloud Sync ({theme.plan} Tier Active)</p>
      </footer>

      {/* Modals */}
      {selectedMessage && (
        <MessageModal
          messageItem={selectedMessage}
          token={account?.token || null}
          address={account?.address || null}
          onClose={() => setSelectedMessage(null)}
          onDelete={async (id) => {
            await removeMessage(id)
            setSelectedMessage(null)
          }}
        />
      )}

      {isCustomModalOpen && (
        <CustomEmailModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onSubmit={async (user, dom) => {
            await createCustomAccount(user, dom)
            return true
          }}
        />
      )}
    </div>
  )
}
