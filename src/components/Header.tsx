import React from 'react'
import { Mail, ShieldCheck, Sun, Moon, Code2 } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'

interface HeaderProps {
  isPolling?: boolean
  theme: Theme
  onToggleTheme: () => void
  onOpenApiDocs: () => void
}

export const Header: React.FC<HeaderProps> = ({ isPolling, theme, onToggleTheme, onOpenApiDocs }) => {
  return (
    <header className="flex items-center justify-between py-5 border-b border-slate-200/70 dark:border-slate-800/80 mb-6 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/60 dark:border-indigo-800/50">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            TMail Free
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
              Live
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Fast disposable temp mail</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            No Signup Required
          </span>
        </div>

        {/* Developers / API Docs Button */}
        <button
          type="button"
          onClick={onOpenApiDocs}
          title="Developers & API Documentation"
          className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-xs font-medium"
        >
          <Code2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="hidden md:inline">Developers / API</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </button>
      </div>
    </header>
  )
}
