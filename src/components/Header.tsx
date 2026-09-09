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
        icon: <Zap className={`h-3 w-3 ${theme.textPrimary}`} />,
      }
    }
    if (plan.includes('PRO')) {
      return {
        label: 'PRO UNLIMITED',
        icon: <Sparkles className={`h-3 w-3 ${theme.textPrimary}`} />,
      }
    }
    if (plan.includes('VIP_PLUS') || plan.includes('VIP+')) {
      return {
        label: 'VIP+ SPECIAL',
        icon: <Crown className={`h-3 w-3 ${theme.textPrimary}`} />,
      }
    }
    return {
      label: 'VIP STANDARD',
      icon: <Crown className={`h-3 w-3 ${theme.textPrimary}`} />,
    }
  }

  const planInfo = getPlanBadge(userPlan)

  const currentPath = window.location.pathname
  const navItems = [
    { href: '/benefit', label: 'Benefit' },
    { href: '/apikey', label: 'API Key' },
    { href: '/logs', label: 'Logs' },
  ]

  return (
    <header className={`tmail-header sticky top-2 z-30 mb-4 rounded-2xl border ${theme.borderStyle} px-3 py-3 shadow-2xl sm:top-4 sm:mb-7 sm:px-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.badgeStyle} border shadow-inner`}>
            <Mail className={`h-5 w-5 ${theme.textPrimary}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">TMail Prem</h1>
              <span className={`hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:flex ${theme.badgeStyle} font-mono`}>
                {planInfo.icon}
                {planInfo.label}
              </span>
            </div>
            <p className={`truncate text-[10px] ${theme.textMuted} font-mono sm:text-[11px]`}>Inbox premium yang siap dipakai</p>
          </div>
        </div>

        <div className={`flex shrink-0 items-center gap-1.5 rounded-xl border ${theme.borderStyle} bg-[#07050e]/70 px-2.5 py-1.5 text-[10px] ${theme.textMuted} font-mono sm:px-3 sm:text-xs`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isPolling ? 'animate-ping bg-emerald-400' : 'bg-emerald-500'}`} />
          <ShieldCheck className={`h-3.5 w-3.5 ${theme.textPrimary}`} />
          <span className="hidden sm:inline">Session Active</span>
          <span className="sm:hidden">Aktif</span>
        </div>
      </div>

      <nav aria-label="Navigasi mailbox" className="tmail-nav-scroll mt-3 flex gap-1 overflow-x-auto border-t border-white/[0.06] pt-2">
        {navItems.map((item) => {
          const active = currentPath.startsWith(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`min-h-9 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[10px] font-semibold ${theme.btnStyle} font-mono sm:text-[11px] ${
                active ? theme.badgeStyle : `border-transparent ${theme.textMuted} hover:border-white/10 hover:bg-white/[0.04] hover:text-white`
              }`}
            >
              {item.label}
            </a>
          )
        })}
        <button
          onClick={() => {
            localStorage.removeItem('tmail_prem_redeem_token')
            localStorage.removeItem('tmail_prem_plan')
            localStorage.removeItem('tmail_prem_api_key')
            window.location.reload()
          }}
          className="ml-auto min-h-9 shrink-0 rounded-lg border border-transparent px-3 py-1.5 text-[10px] font-semibold text-slate-400 hover:border-rose-800/60 hover:bg-rose-950/40 hover:text-rose-300 sm:text-[11px]"
          title="Keluar session voucher"
        >
          <LogOut className="mr-1 inline h-3.5 w-3.5" /> Keluar
        </button>
      </nav>
    </header>
  )
}
