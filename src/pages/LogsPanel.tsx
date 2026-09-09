import { useEffect, useState } from 'react'
import { Terminal, Activity, CheckCircle2, ArrowLeft, Radio } from 'lucide-react'
import { SpotlightCard } from '../components/SpotlightCard'
import { MoltenMetal } from '../components/MoltenMetal'
import { Header } from '../components/Header'
import { useThemeConfig } from '../hooks/useThemeConfig'
import type { LogItem } from '../hooks/useMailbox'

interface LogsPanelProps {
  logs: LogItem[]
  lastChecked: Date | null
}

export function LogsPanel({ logs, lastChecked }: LogsPanelProps) {
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'WARN' | 'INFO'>('ALL')
  const [isLive, setIsLive] = useState(false)
  const theme = useThemeConfig()

  useEffect(() => {
    const updateLiveState = () => {
      setIsLive(Boolean(lastChecked && Date.now() - lastChecked.getTime() < 7000))
    }
    updateLiveState()
    const timer = window.setInterval(updateLiveState, 1000)
    return () => window.clearInterval(timer)
  }, [lastChecked])

  const filteredLogs = logs.filter((l) => filter === 'ALL' || l.status === filter)

  return (
    <div className={`tmail-app-shell min-h-screen bg-[#07050e] text-slate-100 p-3 sm:p-8 font-sans ${theme.selection} selection:text-white relative overflow-hidden`}>
      <MoltenMetal
        color1={theme.color1}
        color2={theme.color2}
        color3={theme.color3}
        speed={0.2}
        scale={3.8}
        glow={1.4}
        opacity={0.24}
        backgroundColor="#07050e"
      />

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative z-10">
        <Header isPolling={isLive} />

        <div className={`flex items-center justify-between rounded-2xl border ${theme.borderStyle} ${theme.bgBox} px-4 py-3 font-mono`}>
          <div className="flex items-center gap-2">
            <Radio className={`h-4 w-4 ${isLive ? 'animate-pulse' : ''} ${isLive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLive ? 'text-emerald-300' : 'text-slate-400'}`}>
              {isLive ? 'LIVE SYNC' : 'MENUNGGU SYNC'}
            </span>
          </div>
          <span className={`text-[10px] ${theme.textMuted}`}>
            {lastChecked ? `Inbox terakhir: ${lastChecked.toLocaleTimeString('id-ID')}` : 'Belum ada polling inbox'}
          </span>
        </div>

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-purple-500/20 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System & Terminal Logs</h1>
              <p className="text-xs text-purple-300/70 font-mono">Realtime Live Console Activity & Event Stream.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/inbox"
              className="px-4 py-2 rounded-xl bg-[#0f0b1a] hover:bg-purple-950/50 border border-purple-500/30 hover:border-purple-500 text-purple-300 text-xs font-mono font-semibold transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Kembali ke Inbox</span>
            </a>
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono ${isLive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : `border-white/10 ${theme.bgBox} text-slate-400`}`}>
              <Activity className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{isLive ? 'LIVE STREAM' : 'OFFLINE'}</span>
            </div>
          </div>
        </header>

        <SpotlightCard className={`${theme.bgBox} border ${theme.borderStyle} rounded-3xl p-4 sm:p-6 space-y-5 font-mono shadow-2xl`} spotlightColor={theme.spotlightColor}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Console Activity Output</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30 font-bold">
                {filteredLogs.length} LOGS
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  filter === 'ALL' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 font-bold' : 'text-purple-300/60 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('SUCCESS')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  filter === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-purple-300/60 hover:text-white'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilter('WARN')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  filter === 'WARN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' : 'text-purple-300/60 hover:text-white'
                }`}
              >
                Warn
              </button>
            </div>
          </div>

          <div className="bg-[#07050e] border border-purple-500/20 rounded-2xl p-4 min-h-96 max-h-[500px] overflow-y-auto space-y-2.5 text-xs">
            {filteredLogs.length === 0 ? (
              <div className="text-purple-400/40 text-center py-24 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 opacity-30" />
                <p>Belum ada terminal logs tercatat.</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed border-b border-purple-500/5 pb-2">
                  <span className="text-purple-400/50 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-bold shrink-0 ${
                      log.status === 'SUCCESS'
                        ? 'text-emerald-400'
                        : log.status === 'WARN'
                        ? 'text-rose-400'
                        : 'text-purple-300'
                    }`}
                  >
                    [{log.status}]
                  </span>
                  <span className="text-purple-200/90 break-all">{log.event}</span>
                </div>
              ))
            )}
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}
