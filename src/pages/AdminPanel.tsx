import { useState, useEffect } from 'react'
import { KeyRound, ShieldAlert, Plus, Trash2, CheckCircle2, Ticket, Sparkles, Copy, LogOut, Search, Zap, ShieldCheck, Layers } from 'lucide-react'
import { BorderGlow } from '../components/BorderGlow'
import { MoltenMetal } from '../components/MoltenMetal'
import { SpotlightCard } from '../components/SpotlightCard'
import { HoverBorderGradient } from '../components/ui/hover-border-gradient'
import { VoucherSuccessModal } from '../components/VoucherSuccessModal'

import { CustomDropdown } from '../components/CustomDropdown'
import { fetchVouchersRemote, saveVoucherRemote, deleteVoucherRemote } from '../services/voucherService'

interface VoucherItem {
  code: string
  plan: string
  days: number
  createdAt: string
  used: boolean
}

export function AdminPanel() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('tmail_admin_authed') === 'true')
  const [loginError, setLoginError] = useState('')

  // Voucher generator states
  const [plan, setPlan] = useState('VIP')
  const [days, setDays] = useState('30')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState('ALL')
  const [vouchers, setVouchers] = useState<VoucherItem[]>(() => {
    const saved = localStorage.getItem('tmail_prem_vouchers')
    return saved ? JSON.parse(saved) : []
  })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [createdVoucher, setCreatedVoucher] = useState<VoucherItem | null>(null)

  useEffect(() => {
    fetchVouchersRemote().then((remoteVouchers) => {
      if (remoteVouchers.length > 0) {
        setVouchers(remoteVouchers)
      }
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('tmail_prem_vouchers', JSON.stringify(vouchers))
  }, [vouchers])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'aztorganteng') {
      setIsAuthenticated(true)
      sessionStorage.setItem('tmail_admin_authed', 'true')
      setLoginError('')
    } else {
      setLoginError('Password Admin Salah!')
    }
  }

  const generateVoucherCode = (prefixOverride?: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let part1 = ''
    let part2 = ''
    for (let i = 0; i < 5; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length))
    for (let i = 0; i < 5; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length))
    const pfx = (prefixOverride || plan.replace('_PLUS', '+')).toUpperCase()
    return `${pfx}-${part1}-${part2}`
  }

  const handleCreateVoucher = (e?: React.FormEvent, customPlan?: string, customDays?: number, customPfx?: string) => {
    if (e) e.preventDefault()
    const targetPlan = customPlan || plan
    const targetDays = customDays || Number(days)
    const targetPfx = customPfx || targetPlan.replace('_PLUS', '+')
    const newCode = generateVoucherCode(targetPfx)
    const newVoucher: VoucherItem = {
      code: newCode,
      plan: targetPlan,
      days: targetDays,
      createdAt: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      used: false,
    }
    setVouchers([newVoucher, ...vouchers])
    setCreatedVoucher(newVoucher)
    saveVoucherRemote(newVoucher)
  }

  const handleDeleteVoucher = (codeToDelete: string) => {
    setVouchers(vouchers.filter((v) => v.code !== codeToDelete))
    deleteVoucherRemote(codeToDelete)
  }

  const handleClearAll = () => {
    if (confirm('Yakin ingin menghapus SEMUA voucher yang tersimpan?')) {
      setVouchers([])
    }
  }

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText)
    setCopiedCode(codeText)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase()) || v.plan.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterPlan === 'ALL' || v.plan === filterPlan
    return matchesSearch && matchesFilter
  })

  const totalVouchers = vouchers.length
  const vipCount = vouchers.filter(v => v.plan === 'VIP' || v.plan === 'VIP_PLUS').length
  const proCount = vouchers.filter(v => v.plan === 'PRO' || v.plan === 'MAX').length

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07050e] flex items-center justify-center px-4 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
        <MoltenMetal
          color1="#2e1065"
          color2="#7e22ce"
          color3="#c084fc"
          speed={0.25}
          scale={3.5}
          glow={1.4}
          opacity={0.4}
          backgroundColor="#07050e"
        />

        <div className="w-full max-w-sm bg-[#0f0b1a]/85 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 mb-5 mx-auto border border-purple-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-1 tracking-tight">Admin Console</h2>
          <p className="text-xs text-purple-300/70 text-center mb-6">Autentikasi keamanan TMail Prem Console.</p>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Masukkan Password Admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#07050e]/90 border border-purple-500/30 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-purple-400/40 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                required
              />
              <KeyRound className="w-4 h-4 text-purple-400/60 absolute left-4 top-4 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-purple-500/20 active:scale-[0.98]"
            >
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 p-4 sm:p-8 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background MoltenMetal Fluid Animation (Purple / Violet Mode) */}
      <MoltenMetal
        color1="#2e1065"
        color2="#6b21a8"
        color3="#c084fc"
        speed={0.2}
        scale={3.8}
        glow={1.4}
        opacity={0.35}
        backgroundColor="#07050e"
      />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header Console */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-purple-500/20 pb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">TMail Prem</h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Purple Dark Tech Console
                </span>
              </div>
              <p className="text-xs text-purple-300/70 font-mono mt-0.5">Penerbitan Token VIP & Manajemen Akses Otomatis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f0b1a] border border-purple-500/20 text-xs font-mono text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>SYSTEM READY</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('tmail_admin_authed')
                setIsAuthenticated(false)
              }}
              className="text-xs font-medium text-slate-400 hover:text-rose-400 bg-[#0f0b1a] hover:bg-rose-950/40 border border-purple-500/20 hover:border-rose-800/60 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </header>

        {/* Bento Stats Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BorderGlow className="p-4.5" glowColor="270 95 75" backgroundColor="#0f0b1a" colors={['#a855f7', '#c084fc', '#e879f9']}>
            <div className="flex items-center justify-between text-purple-300/70 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Total Voucher</span>
              <Ticket className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-tight">{totalVouchers}</div>
            <p className="text-[10px] text-slate-400 mt-1">Terbit & Terkelola</p>
          </BorderGlow>

          <BorderGlow className="p-4.5" glowColor="270 95 75" backgroundColor="#0f0b1a" colors={['#a855f7', '#d8b4fe', '#f472b6']}>
            <div className="flex items-center justify-between text-purple-300/70 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">VIP Tier Tokens</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-purple-400 tracking-tight">{vipCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">VIP & VIP+ Active</p>
          </BorderGlow>

          <BorderGlow className="p-4.5" glowColor="270 95 75" backgroundColor="#0f0b1a" colors={['#818cf8', '#a855f7', '#e879f9']}>
            <div className="flex items-center justify-between text-purple-300/70 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Pro/Max Tier</span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-indigo-400 tracking-tight">{proCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">PRO & MAX Unlimited</p>
          </BorderGlow>

          <BorderGlow className="p-4.5" glowColor="270 95 75" backgroundColor="#0f0b1a" colors={['#a855f7', '#38bdf8', '#818cf8']}>
            <div className="flex items-center justify-between text-purple-300/70 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Security Engine</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-mono font-bold text-purple-300 tracking-tight truncate">HMAC-SHA256</div>
            <p className="text-[10px] text-slate-400 mt-1">Passkey Isolated</p>
          </BorderGlow>
        </div>

        {/* Quick Actions preset strip */}
        <SpotlightCard className="bg-[#0f0b1a]/80 border border-purple-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3" spotlightColor="rgba(168, 85, 247, 0.2)">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">Quick Mint Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <HoverBorderGradient onClick={() => handleCreateVoucher(undefined, 'VIP', 30, 'VIP30')}>
              + 1x VIP 30-Hari
            </HoverBorderGradient>
            <HoverBorderGradient onClick={() => handleCreateVoucher(undefined, 'VIP_PLUS', 90, 'VIP90')}>
              + 1x VIP+ 90-Hari
            </HoverBorderGradient>
            <HoverBorderGradient onClick={() => handleCreateVoucher(undefined, 'PRO', 365, 'PRO365')}>
              + 1x PRO 1-Tahun
            </HoverBorderGradient>
            <HoverBorderGradient onClick={() => handleCreateVoucher(undefined, 'MAX', 3650, 'PERM')}>
              + 1x MAX Permanen
            </HoverBorderGradient>
          </div>
        </SpotlightCard>

        {/* Main Grid: Form & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Form Generator Panel */}
          <SpotlightCard className="bg-[#0f0b1a]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl h-fit" spotlightColor="rgba(168, 85, 247, 0.25)">
            <div className="flex items-center justify-between mb-5 border-b border-purple-500/20 pb-3">
              <h2 className="text-sm font-bold text-purple-400 tracking-tight flex items-center gap-2">
                <Plus className="w-4 h-4" /> Mint Custom Token
              </h2>
            </div>

            <form onSubmit={(e) => handleCreateVoucher(e)} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5">
                  Prefix Kode Token (Auto)
                </label>
                <input
                  type="text"
                  value={plan.replace('_PLUS', '+')}
                  disabled
                  className="w-full bg-[#07050e]/50 border border-purple-500/20 rounded-xl px-3.5 py-3 text-purple-400 font-mono text-xs cursor-not-allowed opacity-80"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5">
                  Tingkat Paket VIP
                </label>
                <CustomDropdown
                  value={plan}
                  onChange={setPlan}
                  options={[
                    { label: 'VIP Standard (Akun Biasa)', value: 'VIP' },
                    { label: 'VIP Plus (Custom Domain)', value: 'VIP_PLUS' },
                    { label: 'Pro Tier (Unlimited Mailbox)', value: 'PRO' },
                    { label: 'Max Enterprise Tier', value: 'MAX' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1.5">
                  Masa Aktif Layanan
                </label>
                <CustomDropdown
                  value={days}
                  onChange={setDays}
                  options={[
                    { label: '7 Hari (Trial Access)', value: '7' },
                    { label: '30 Hari (1 Bulan)', value: '30' },
                    { label: '90 Hari (3 Bulan)', value: '90' },
                    { label: '365 Hari (1 Tahun)', value: '365' },
                    { label: 'Permanen Access (10 Tahun)', value: '3650' },
                  ]}
                />
              </div>

              <HoverBorderGradient className="w-full flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Generate Custom Token
              </HoverBorderGradient>
            </form>
          </SpotlightCard>

          {/* List Vouchers Panel */}
          <SpotlightCard className="lg:col-span-2 bg-[#0f0b1a]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between" spotlightColor="rgba(168, 85, 247, 0.25)">
            <div>
              {/* Filter & Search Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-purple-500/20 pb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">Active Token Pool</h2>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] border border-purple-500/30 font-bold">
                    {filteredVouchers.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-48">
                    <input
                      type="text"
                      placeholder="Cari token..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#07050e] border border-purple-500/30 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-500"
                    />
                    <Search className="w-3.5 h-3.5 text-purple-400/50 absolute left-2.5 top-2 pointer-events-none" />
                  </div>

                  {/* Filter Dropdown */}
                  <CustomDropdown
                    value={filterPlan}
                    onChange={setFilterPlan}
                    className="w-36"
                    options={[
                      { label: 'Semua Paket', value: 'ALL' },
                      { label: 'VIP', value: 'VIP' },
                      { label: 'VIP+', value: 'VIP_PLUS' },
                      { label: 'PRO', value: 'PRO' },
                      { label: 'MAX', value: 'MAX' },
                    ]}
                  />

                  {vouchers.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Clear All Vouchers"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Vouchers List */}
              {filteredVouchers.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-purple-500/20 rounded-2xl bg-[#07050e]/60">
                  <Ticket className="w-10 h-10 text-purple-500/40 mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-purple-200 font-semibold">Belum ada token aktif di pool.</p>
                  <p className="text-xs text-purple-400/60 mt-1 max-w-xs mx-auto">
                    Gunakan preset tombol di atas atau form di sebelah kiri untuk meng-generate token VIP baru.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {filteredVouchers.map((v) => (
                    <div
                      key={v.code}
                      className="flex items-center justify-between bg-[#07050e]/90 border border-purple-500/20 hover:border-purple-500/50 rounded-xl p-3.5 transition group shadow-sm hover:shadow-purple-500/10"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-purple-300 text-sm tracking-wider">{v.code}</span>
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-200 font-mono text-[10px] font-bold border border-purple-500/30">
                            {v.plan} • {v.days} HARI
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Dibuat: {v.createdAt}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(v.code)}
                          className="px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                        >
                          {copiedCode === v.code ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-purple-400" />
                              <span>Copy Token</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(v.code)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition"
                          title="Hapus Token"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-purple-400/60 font-mono">
              <span>Status: Synchronized with Local Storage</span>
              <span>Purple Dark Tech UI v2.5</span>
            </div>
          </SpotlightCard>
        </div>
      </div>
      {/* Voucher Created Success Modal */}
      <VoucherSuccessModal
        voucher={createdVoucher}
        onClose={() => setCreatedVoucher(null)}
        onCopy={(code) => handleCopy(code)}
        isCopied={copiedCode === createdVoucher?.code}
      />
    </div>
  )
}
