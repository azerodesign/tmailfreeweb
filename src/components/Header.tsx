import React from 'react'
import { Mail, ShieldCheck, LogOut, Crown, Zap, Sparkles } from 'lucide-react'
import { useThemeConfig } from '../hooks/useThemeConfig'

interface HeaderProps {
  isPolling?: boolean
}

export const Header: React.FC<HeaderProps> = ({ isPolling }) => {
  const theme = useThemeConfig()
  const userPlan = (localStorage.getItem('tmail_prem_plan') || 'VIP').toUpperCase()

  const getPlanBadge = (plan: string) => {
    if (plan.includes('MAX')) {
      return {
        label: 'MAX ENTERPRISE',
        icon: <Zap className="w-3 h-3 text-emerald-400" />,
      }
    }
    if (plan.includes('PRO')) {
      return {
        label: 'PRO UNLIMITED',
        icon: <Sparkles className="w-3 h-3 text-amber-400" />,
      }
    }
    if (plan.includes('VIP_PLUS') || plan.includes('VIP+')) {
      return {
        label: 'VIP+ SPECIAL',
        icon: <Crown className="w-3 h-3 text-indigo-400" />,
      }
    }
    return {
      label: 'VIP STANDARD',
      icon: <Crown className="w-3 h-3 text-purple-400" />,
    }
  }

  const planInfo = getPlanBadge(userPlan)

  return (
    <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-5 border-b ${theme.borderStyle} mb-4 sm:mb-8 relative z-10 gap-3`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${theme.badgeStyle} flex items-center justify-center shadow-inner shrink-0`}>
          <Mail className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${theme.textPrimary}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">TMail Prem</h1>
            <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${theme.badgeStyle}`}>
              {planInfo.icon}
              <span>{planInfo.label}</span>
            </span>
          </div>
          <p className={`text-[11px] sm:text-xs ${theme.textMuted} font-mono mt-0.5`}>High-Speed Disposable VIP Inbox</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <div className={`flex items-center space-x-2 text-[10px] sm:text-xs font-mono ${theme.textMuted} bg-[#07050e] px-3 py-1.5 rounded-xl border ${theme.borderStyle} shadow-inner`}>
          <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
            Session Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/apikey"
            className={`text-[11px] font-mono ${theme.textMuted} hover:text-white bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} px-3 py-1.5 rounded-xl transition flex items-center gap-1`}
          >
            API Key
          </a>
          <a
            href="/logs"
            className={`text-[11px] font-mono ${theme.textMuted} hover:text-white bg-[#07050e] border ${theme.borderStyle} ${theme.btnStyle} px-3 py-1.5 rounded-xl transition flex items-center gap-1`}
          >
            Logs
          </a>
          <button
            onClick={() => {
              localStorage.removeItem('tmail_prem_redeem_token')
              localStorage.removeItem('tmail_prem_plan')
              window.location.reload()
            }}
            className={`text-[11px] font-mono ${theme.textMuted} hover:text-rose-400 bg-[#07050e] hover:bg-rose-950/40 border ${theme.borderStyle} hover:border-rose-800/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer`}
            title="Keluar Session Voucher"
          >
            <LogOut className="w-3.5 h-3.5" /> Exit
          </button>
        </div>
      </div>
    </header>
  )
}
