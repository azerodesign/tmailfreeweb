import React, { useState, useRef } from 'react'
import {
  Code,
  Key,
  BookOpen,
  Sliders,
  Copy,
  Check,
  Loader2,
  X,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Bot,
  Globe2,
} from 'lucide-react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { createApiKeyApi } from '../services/mailApi'

const TURNSTILE_SITE_KEY = '0x4AAAAAAEpy2WzEANyDLppL'

interface ApiDocsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'docs' | 'examples' | 'limits'>('generate')
  const [exampleLang, setExampleLang] = useState<'bot-python' | 'bot-telegram-node' | 'bot-node' | 'web-fetch'>('bot-python')
  const [projectName, setProjectName] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const turnstileRef = useRef<TurnstileInstance>(null)

  if (!isOpen) return null

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSnippet(id)
      setTimeout(() => setCopiedSnippet(null), 2000)
    } catch {
      // fallback
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim()) {
      setError('Masukkan nama project / aplikasi terlebih dahulu')
      return
    }
    if (!turnstileToken) {
      setError('Selesaikan verifikasi captcha Turnstile terlebih dahulu')
      return
    }

    setError(null)
    setIsGenerating(true)
    try {
      const res = await createApiKeyApi(projectName.trim(), turnstileToken)
      setCreatedKey(res.apiKey)
      setTurnstileToken(null)
      try {
        turnstileRef.current?.reset()
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat API key')
      setTurnstileToken(null)
      try {
        turnstileRef.current?.reset()
      } catch {
        // ignore
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-2xl w-full mx-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-7 transition-colors flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Developer API &amp; Documentation
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Integrasikan inbox sementara TMail Free langsung ke aplikasi atau skrip bot Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5 border border-slate-200/60 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span>Get API Key</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>cURL Endpoints</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'examples'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span>Cara Pakai (Bot &amp; Web)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('limits')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'limits'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>Rate Limit</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* TAB 1: GET API KEY */}
          {activeTab === 'generate' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Penjelasan Apa Itu API Key */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold text-xs sm:text-sm">
                  <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Apa itu API Key?</span>
                </div>
                <p className="text-xs text-indigo-950/80 dark:text-indigo-200/90 leading-relaxed">
                  <strong>API Key</strong> adalah token rahasia (kunci otentikasi) milik Anda yang disematkan pada header <code className="font-mono text-[11px] bg-indigo-100/80 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded">x-api-key</code> saat memanggil endpoint API. Fungsinya untuk mengenali aplikasi Anda, mengakses inbox otomatis, dan mengelola kuota 100 mailbox per hari.
                </p>
              </div>

              {createdKey ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>API Key Berhasil Dibuat!</span>
                  </div>
                  <p className="text-xs text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
                    Salin dan simpan key ini di tempat aman. Key ini memiliki kuota 100 generate email per hari.
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-slate-700">
                    <code className="flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 truncate select-all">
                      {createdKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdKey, 'createdKey')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedSnippet === 'createdKey' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'createdKey' ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateKey} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Project / App Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. My Telegram Bot, Scraper Project, QA Test"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value)
                        setError(null)
                      }}
                      disabled={isGenerating}
                      className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center min-h-17 pt-1">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => {
                        setTurnstileToken(token)
                        setError(null)
                      }}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setError('Verifikasi captcha gagal. Pastikan koneksi stabil.')}
                      options={{ theme: 'auto', size: 'normal' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating || !projectName.trim() || !turnstileToken}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Key...</span>
                      </>
                    ) : (
                      <span>Generate API Key</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTATION */}
          {activeTab === 'docs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Base URL</span>
                  <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    https://temp.gaskenn.biz.id/api/v1
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>REST API</span>
                </div>
              </div>

              {/* Endpoint 1: Generate Mailbox */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold">
                      POST
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      /mailbox/generate
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X POST "https://temp.gaskenn.biz.id/api/v1/mailbox/generate" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"prefix": "mybox", "domain": "gaskenn.biz.id"}'`,
                        'curlGen'
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    {copiedSnippet === 'curlGen' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`curl -X POST "https://temp.gaskenn.biz.id/api/v1/mailbox/generate" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prefix": "mybox", "domain": "gaskenn.biz.id"}'`}
                </pre>
              </div>

              {/* Endpoint 2: Fetch Messages */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                      GET
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      /mailbox/:address/messages
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X GET "https://temp.gaskenn.biz.id/api/v1/mailbox/mybox@gaskenn.biz.id/messages" \\\n  -H "x-api-key: YOUR_API_KEY"`,
                        'curlList'
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    {copiedSnippet === 'curlList' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`curl -X GET "https://temp.gaskenn.biz.id/api/v1/mailbox/mybox@gaskenn.biz.id/messages" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </pre>
              </div>

              {/* Endpoint 3: Fetch Detail & OTP */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                      GET
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      /mailbox/:address/messages/:id
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X GET "https://temp.gaskenn.biz.id/api/v1/mailbox/mybox@gaskenn.biz.id/messages/msg_123" \\\n  -H "x-api-key: YOUR_API_KEY"`,
                        'curlDetail'
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    {copiedSnippet === 'curlDetail' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`curl -X GET "https://temp.gaskenn.biz.id/api/v1/mailbox/mybox@gaskenn.biz.id/messages/msg_123" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </pre>
              </div>

              {/* Endpoint 4: Delete Mailbox */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold">
                      DELETE
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      /mailbox/:address
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X DELETE "https://temp.gaskenn.biz.id/api/v1/mailbox/mybox@gaskenn.biz.id" \\\n  -H "x-api-key: YOUR_API_KEY"`,
                        'curlDelete'
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    {copiedSnippet === 'curlDelete' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`curl -X DELETE "https://temp.gaskenn.biz.id/api/v1/mailbox/mybox@gaskenn.biz.id" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: CARA PAKAI (BOT & WEB) */}
          {activeTab === 'examples' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Language / Environment Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setExampleLang('bot-python')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    exampleLang === 'bot-python'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Python (Telegram)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExampleLang('bot-telegram-node')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    exampleLang === 'bot-telegram-node'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Node.js (Telegram)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExampleLang('bot-node')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    exampleLang === 'bot-node'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Node.js (Discord)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExampleLang('web-fetch')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    exampleLang === 'web-fetch'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Frontend (Web JS)</span>
                </button>
              </div>

              {/* Workflow Flowcard */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold text-xs">
                  <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Panduan Langkah demi Langkah (Setup ke Bot &amp; Web):</span>
                </div>

                {/* Step-by-step Setup Guide */}
                <div className="space-y-2 text-xs text-indigo-950/90 dark:text-indigo-200/90 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100/80 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong>Dapatkan Bot Token:</strong> Di Telegram, chat ke <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">@BotFather</code> &rarr; ketik <code className="font-mono bg-indigo-100 dark:bg-slate-800 px-1 rounded">/newbot</code> &rarr; simpan HTTP API token yang diberikan.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong>Dapatkan API Key:</strong> Buka tab <strong className="text-indigo-600 dark:text-indigo-400">Get API Key</strong> di modal ini &rarr; isi nama project &rarr; verifikasi captcha &rarr; salin API Key (<code className="font-mono text-[11px]">tmail_live_...</code>).
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong>Pasang ke Kode:</strong> Masukkan Bot Token &amp; API Key ke template skrip di bawah, lalu jalankan.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-indigo-950/80 dark:text-indigo-200/90 font-medium">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100/80 dark:border-slate-800">
                    <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Alur 1. Generate</strong>
                    POST /mailbox/generate untuk dapat alamat baru.
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100/80 dark:border-slate-800">
                    <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Alur 2. Poll Inbox</strong>
                    Loop GET /messages tiap 3-5 detik sampai email masuk.
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100/80 dark:border-slate-800">
                    <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Alur 3. Ambil OTP</strong>
                    Field <code className="font-mono text-amber-600 dark:text-amber-400">otp</code> otomatis siap pakai tanpa regex manual!
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              {exampleLang === 'bot-python' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      Python Script / Telegram Bot (python-telegram-bot):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
`# 1. pip install python-telegram-bot requests
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TELEGRAM_TOKEN = "PASTE_BOTFATHER_TOKEN"
API_KEY = "YOUR_API_KEY"
BASE_URL = "https://temp.gaskenn.biz.id/api/v1"
HEADERS = {"x-api-key": API_KEY}

async def gen_email(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Buat mailbox baru
    res = requests.post(f"{BASE_URL}/mailbox/generate", headers=HEADERS)
    email = res.json()["address"]
    await update.message.reply_text(f"Email: {email}\\nKetik /check {email} untuk cek inbox.")

async def check_inbox(update: Update, context: ContextTypes.DEFAULT_TYPE):
    email = context.args[0] if context.args else ""
    if not email:
        return await update.message.reply_text("Format: /check email@domain.com")

    res = requests.get(f"{BASE_URL}/mailbox/{email}/messages", headers=HEADERS)
    messages = res.json().get("messages", [])
    if not messages:
        return await update.message.reply_text("Belum ada email masuk.")

    latest = messages[0]
    await update.message.reply_text(f"Subjek: {latest['subject']}\\nOTP: {latest.get('otp')}")

app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
app.add_handler(CommandHandler("gen", gen_email))
app.add_handler(CommandHandler("check", check_inbox))
app.run_polling()`,
                          'pyBot'
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      {copiedSnippet === 'pyBot' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-75">
{`# 1. pip install python-telegram-bot requests
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TELEGRAM_TOKEN = "PASTE_BOTFATHER_TOKEN"
API_KEY = "YOUR_API_KEY"
BASE_URL = "https://temp.gaskenn.biz.id/api/v1"
HEADERS = {"x-api-key": API_KEY}

async def gen_email(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Buat mailbox baru
    res = requests.post(f"{BASE_URL}/mailbox/generate", headers=HEADERS)
    email = res.json()["address"]
    await update.message.reply_text(f"Email: {email}\\nKetik /check {email} untuk cek inbox.")

async def check_inbox(update: Update, context: ContextTypes.DEFAULT_TYPE):
    email = context.args[0] if context.args else ""
    if not email:
        return await update.message.reply_text("Format: /check email@domain.com")

    res = requests.get(f"{BASE_URL}/mailbox/{email}/messages", headers=HEADERS)
    messages = res.json().get("messages", [])
    if not messages:
        return await update.message.reply_text("Belum ada email masuk.")

    latest = messages[0]
    await update.message.reply_text(f"Subjek: {latest['subject']}\\nOTP: {latest.get('otp')}")

app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
app.add_handler(CommandHandler("gen", gen_email))
app.add_handler(CommandHandler("check", check_inbox))
app.run_polling()`}
                  </pre>
                </div>
              )}

              {exampleLang === 'bot-telegram-node' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      Node.js Telegram Bot (Telegraf.js):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
`// 1. npm install telegraf
const { Telegraf } = require('telegraf');

const TELEGRAM_TOKEN = 'PASTE_BOTFATHER_TOKEN';
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://temp.gaskenn.biz.id/api/v1';

const bot = new Telegraf(TELEGRAM_TOKEN);

// Command /gen: Buat email acak
bot.command('gen', async (ctx) => {
  try {
    const res = await fetch(\`\${BASE_URL}/mailbox/generate\`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY }
    });
    const data = await res.json();
    ctx.reply(\`Email baru Anda: \${data.address}\\n\\nKetik /otp \${data.address} untuk polling OTP.\`);
  } catch (err) {
    ctx.reply('Gagal generate email.');
  }
});

// Command /otp <email>: Polling inbox sampai OTP masuk
bot.command('otp', async (ctx) => {
  const parts = ctx.message.text.split(' ');
  const email = parts[1]?.trim();
  if (!email) return ctx.reply('Contoh: /otp nama@domain.com');

  ctx.reply(\`Mencari OTP untuk \${email}...\`);

  // Polling tiap 4 detik (max 12x)
  let attempts = 0;
  const timer = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(\`\${BASE_URL}/mailbox/\${encodeURIComponent(email)}/messages\`, {
        headers: { 'x-api-key': API_KEY }
      });
      const { messages } = await res.json();

      if (messages && messages.length > 0) {
        clearInterval(timer);
        const msg = messages[0];
        ctx.reply(\`OTP Ditemukan!\\n\\nPengirim: \${msg.from?.address || 'Unknown'}\\nSubjek: \${msg.subject}\\nOTP: \${msg.otp || 'Tidak ada OTP'}\`);
      } else if (attempts >= 12) {
        clearInterval(timer);
        ctx.reply('Waktu habis (48s). Belum ada email baru.');
      }
    } catch {
      clearInterval(timer);
    }
  }, 4000);
});

bot.launch();
console.log('Bot Telegram Node.js siap!');`,
                          'nodeTeleBot'
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      {copiedSnippet === 'nodeTeleBot' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-75">
{`// 1. npm install telegraf
const { Telegraf } = require('telegraf');

const TELEGRAM_TOKEN = 'PASTE_BOTFATHER_TOKEN';
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://temp.gaskenn.biz.id/api/v1';

const bot = new Telegraf(TELEGRAM_TOKEN);

// Command /gen: Buat email acak
bot.command('gen', async (ctx) => {
  try {
    const res = await fetch(\`\${BASE_URL}/mailbox/generate\`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY }
    });
    const data = await res.json();
    ctx.reply(\`Email baru Anda: \${data.address}\\n\\nKetik /otp \${data.address} untuk polling OTP.\`);
  } catch (err) {
    ctx.reply('Gagal generate email.');
  }
});

// Command /otp <email>: Polling inbox sampai OTP masuk
bot.command('otp', async (ctx) => {
  const parts = ctx.message.text.split(' ');
  const email = parts[1]?.trim();
  if (!email) return ctx.reply('Contoh: /otp nama@domain.com');

  ctx.reply(\`Mencari OTP untuk \${email}...\`);

  // Polling tiap 4 detik (max 12x)
  let attempts = 0;
  const timer = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(\`\${BASE_URL}/mailbox/\${encodeURIComponent(email)}/messages\`, {
        headers: { 'x-api-key': API_KEY }
      });
      const { messages } = await res.json();

      if (messages && messages.length > 0) {
        clearInterval(timer);
        const msg = messages[0];
        ctx.reply(\`OTP Ditemukan!\\n\\nPengirim: \${msg.from?.address || 'Unknown'}\\nSubjek: \${msg.subject}\\nOTP: \${msg.otp || 'Tidak ada OTP'}\`);
      } else if (attempts >= 12) {
        clearInterval(timer);
        ctx.reply('Waktu habis (48s). Belum ada email baru.');
      }
    } catch {
      clearInterval(timer);
    }
  }, 4000);
});

bot.launch();
console.log('Bot Telegram Node.js siap!');`}
                  </pre>
                </div>
              )}

              {exampleLang === 'bot-node' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      Node.js / Discord Bot OTP Listener:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
`const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://temp.gaskenn.biz.id/api/v1";

async function runAutoOtp() {
  // 1. Generate Mailbox
  const genRes = await fetch(\`\${BASE_URL}/mailbox/generate\`, {
    method: "POST",
    headers: { "x-api-key": API_KEY }
  });
  const { address } = await genRes.json();
  console.log("Mailbox:", address);

  // 2. Polling Inbox
  const checkInterval = setInterval(async () => {
    const listRes = await fetch(\`\${BASE_URL}/mailbox/\${address}/messages\`, {
      headers: { "x-api-key": API_KEY }
    });
    const { messages } = await listRes.json();

    if (messages.length > 0) {
      clearInterval(checkInterval);
      const latest = messages[0];
      console.log("OTP Code:", latest.otp);
      console.log("Subject:", latest.subject);
    }
  }, 4000);
}

runAutoOtp();`,
                          'nodeBot'
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      {copiedSnippet === 'nodeBot' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-75">
{`const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://temp.gaskenn.biz.id/api/v1";

async function runAutoOtp() {
  // 1. Generate Mailbox
  const genRes = await fetch(\`\${BASE_URL}/mailbox/generate\`, {
    method: "POST",
    headers: { "x-api-key": API_KEY }
  });
  const { address } = await genRes.json();
  console.log("Mailbox:", address);

  // 2. Polling Inbox
  const checkInterval = setInterval(async () => {
    const listRes = await fetch(\`\${BASE_URL}/mailbox/\${address}/messages\`, {
      headers: { "x-api-key": API_KEY }
    });
    const { messages } = await listRes.json();

    if (messages.length > 0) {
      clearInterval(checkInterval);
      const latest = messages[0];
      console.log("OTP Code:", latest.otp);
      console.log("Subject:", latest.subject);
    }
  }, 4000);
}

runAutoOtp();`}
                  </pre>
                </div>
              )}

              {exampleLang === 'web-fetch' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                      Integrasi di Web Frontend / Dashboard:
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Anda bisa memanggil API langsung dari webapp Anda menggunakan vanilla <code className="font-mono text-indigo-600 dark:text-indigo-400">fetch()</code>, Axios, atau React/Vue hooks:
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      Full Web Flow (Generate + Polling Inbox):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
`// 1. Generate Mailbox Baru di Web
async function generateMailbox(apiKey) {
  const res = await fetch("https://temp.gaskenn.biz.id/api/v1/mailbox/generate", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prefix: "tester", domain: "gaskenn.biz.id" })
  });
  const data = await res.json();
  return data.address; // Alamat email siap dipakai
}

// 2. Ambil List Pesan Masuk & Deteksi OTP Otomatis
async function checkWebInbox(emailAddress, apiKey) {
  const res = await fetch(\`https://temp.gaskenn.biz.id/api/v1/mailbox/\${encodeURIComponent(emailAddress)}/messages\`, {
    method: "GET",
    headers: { "x-api-key": apiKey }
  });
  const { messages } = await res.json();

  if (messages.length > 0) {
    const latest = messages[0];
    console.log("Subjek:", latest.subject);
    console.log("Kode OTP:", latest.otp); // Nilai OTP siap disematkan ke input form
    return latest;
  }
  return null;
}`,
                          'webFetch'
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      {copiedSnippet === 'webFetch' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-75">
{`// 1. Generate Mailbox Baru di Web
async function generateMailbox(apiKey) {
  const res = await fetch("https://temp.gaskenn.biz.id/api/v1/mailbox/generate", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prefix: "tester", domain: "gaskenn.biz.id" })
  });
  const data = await res.json();
  return data.address; // Alamat email siap dipakai
}

// 2. Ambil List Pesan Masuk & Deteksi OTP Otomatis
async function checkWebInbox(emailAddress, apiKey) {
  const res = await fetch(\`https://temp.gaskenn.biz.id/api/v1/mailbox/\${encodeURIComponent(emailAddress)}/messages\`, {
    method: "GET",
    headers: { "x-api-key": apiKey }
  });
  const { messages } = await res.json();

  if (messages.length > 0) {
    const latest = messages[0];
    console.log("Subjek:", latest.subject);
    console.log("Kode OTP:", latest.otp); // Nilai OTP siap disematkan ke input form
    return latest;
  }
  return null;
}`}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RATE LIMIT & RULES */}
          {activeTab === 'limits' && (
            <div className="space-y-3.5 animate-in fade-in duration-150 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
                <span className="font-semibold text-amber-950 dark:text-amber-200 block text-sm">
                  Aturan Kuota 100 Generate / Hari
                </span>
                <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                  Setiap IP pengunjung Web dan setiap Developer API Key memiliki jatah maksimal 100 kali pembuatan mailbox per hari untuk menjaga stabilitas infrastruktur Edge.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Response Headers Rate Limit:
                </span>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <li><strong className="text-indigo-600 dark:text-indigo-400">X-RateLimit-Limit:</strong> 100</li>
                  <li><strong className="text-indigo-600 dark:text-indigo-400">X-RateLimit-Remaining:</strong> (Sisa kuota hari ini)</li>
                  <li><strong className="text-indigo-600 dark:text-indigo-400">X-RateLimit-Reset:</strong> (Timestamp UTC midnight)</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5">
                <span className="font-semibold text-rose-900 dark:text-rose-200 block">
                  Status HTTP 429 Too Many Requests:
                </span>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "error": "Daily quota exceeded",
  "message": "Batas 100 generate email per hari telah tercapai.",
  "limit": 100,
  "remaining": 0,
  "reset": "00:00 UTC"
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
