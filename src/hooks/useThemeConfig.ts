export interface ThemeConfig {
  plan: string
  color1: string
  color2: string
  color3: string
  spotlightColor: string
  borderStyle: string
  textPrimary: string
  textMuted: string
  bgBox: string
  badgeStyle: string
  progressGrad: string
  btnStyle: string
  selection: string
}

export function useThemeConfig(): ThemeConfig {
  const userPlan = (localStorage.getItem('tmail_prem_plan') || '').toUpperCase()

  if (userPlan.includes('MAX')) {
    return {
      plan: 'MAX',
      color1: '#022c22',
      color2: '#059669',
      color3: '#34d399',
      spotlightColor: 'rgba(52, 211, 153, 0.25)',
      borderStyle: 'border-emerald-500/30',
      textPrimary: 'text-emerald-300',
      textMuted: 'text-emerald-300/70',
      bgBox: 'bg-[#021c16]/90',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      progressGrad: 'from-emerald-500 to-teal-400',
      btnStyle: 'hover:border-emerald-500 text-emerald-200',
      selection: 'selection:bg-emerald-500',
    }
  }

  if (userPlan.includes('PRO')) {
    return {
      plan: 'PRO',
      color1: '#451a03',
      color2: '#d97706',
      color3: '#fbbf24',
      spotlightColor: 'rgba(251, 191, 36, 0.25)',
      borderStyle: 'border-amber-500/30',
      textPrimary: 'text-amber-300',
      textMuted: 'text-amber-300/70',
      bgBox: 'bg-[#1c0d02]/90',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      progressGrad: 'from-amber-500 to-yellow-400',
      btnStyle: 'hover:border-amber-500 text-amber-200',
      selection: 'selection:bg-amber-500',
    }
  }

  return {
    plan: 'VIP',
    color1: '#2e1065',
    color2: '#6b21a8',
    color3: '#c084fc',
    spotlightColor: 'rgba(168, 85, 247, 0.25)',
    borderStyle: 'border-purple-500/30',
    textPrimary: 'text-purple-300',
    textMuted: 'text-purple-300/70',
    bgBox: 'bg-[#0f0b1a]/90',
    badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    progressGrad: 'from-purple-500 to-indigo-500',
    btnStyle: 'hover:border-purple-500 text-purple-200',
    selection: 'selection:bg-purple-500',
  }
}
