import React from 'react'
import { Mail, ShieldCheck } from 'lucide-react'

interface HeaderProps {
  isPolling?: boolean
}

export const Header: React.FC<HeaderProps> = ({ isPolling }) => {
  return (
    <header className="flex items-center justify-between py-6 border-b border-slate-100 mb-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            TMail Free
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Live
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-normal">Fast disposable temp mail</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
        <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
        <span className="flex items-center gap-1 font-medium text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          No Signup Required
        </span>
      </div>
    </header>
  )
}
