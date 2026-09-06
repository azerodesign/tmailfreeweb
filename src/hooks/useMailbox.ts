import { useState, useEffect, useCallback, useRef } from 'react'
import {
  type MailAccount,
  type MessageItem,
  type RateLimitStatus,
  createRandomAccountApi,
  createAccount,
  createCustomAccountApi,
  getToken,
  getMessages,
  deleteMessage,
  fetchRateLimitStatus,
  deleteEntireMailboxApi,
} from '../services/mailApi'
import { playDingSound } from '../utils/sound'

const STORAGE_KEY = 'tmail_session_v1'
const POLLING_INTERVAL_SEC = 6
const COOLDOWN_SECONDS = 4

export function useMailbox() {
  const [account, setAccount] = useState<MailAccount | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as MailAccount
    } catch {
      return null
    }
  })

  const [messages, setMessages] = useState<MessageItem[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isGeneratingAccount, setIsGeneratingAccount] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(POLLING_INTERVAL_SEC)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [rateLimit, setRateLimit] = useState<RateLimitStatus>({
    limit: 100,
    count: 0,
    remaining: 100,
    resetTimestamp: Date.now() + 3600 * 1000,
  })
  const [isLimitReached, setIsLimitReached] = useState(false)

  // Cooldown states (seconds remaining)
  const [newCooldown, setNewCooldown] = useState(0)
  const [refreshCooldown, setRefreshCooldown] = useState(0)

  const isMounted = useRef(true)
  const prevMessagesCount = useRef(0)
  const isFirstLoad = useRef(true)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 2800)
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(`Address copied: ${text}`)
    } catch {
      // fallback
    }
  }, [showToast])

  // Poll / sync rate limit status on mount and after mailbox changes
  const refreshRateLimit = useCallback(async () => {
    try {
      const status = await fetchRateLimitStatus()
      if (isMounted.current) {
        setRateLimit(status)
        if (status.remaining <= 0) {
          setIsLimitReached(true)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    refreshRateLimit()
  }, [refreshRateLimit])

  // Cooldown timer ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setNewCooldown((prev) => (prev > 0 ? prev - 1 : 0))
      setRefreshCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const initNewAccount = useCallback(async (autoCopy = false) => {
    if (newCooldown > 0 || isGeneratingAccount) return
    setIsGeneratingAccount(true)
    setError(null)
    setNewCooldown(COOLDOWN_SECONDS)

    try {
      const acc = await createRandomAccountApi()
      const password = `Tmp!${Math.random().toString(36).slice(-8)}`
      const token = await getToken(acc.address, password)

      const session: MailAccount = {
        id: acc.id,
        address: acc.address,
        password,
        token,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      if (isMounted.current) {
        setAccount(session)
        setMessages([])
        prevMessagesCount.current = 0
        setCountdown(POLLING_INTERVAL_SEC)
        if (typeof acc.remaining === 'number') {
          setRateLimit((prev) => ({
            ...prev,
            remaining: acc.remaining as number,
            count: prev.limit - (acc.remaining as number),
          }))
          if (acc.remaining <= 0) setIsLimitReached(true)
        }
      }

      if (autoCopy) {
        await copyToClipboard(acc.address)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat akun'
      if (msg.includes('Batas harian') || msg.includes('quota exceeded')) {
        setIsLimitReached(true)
        setRateLimit((prev) => ({ ...prev, remaining: 0, count: prev.limit }))
      }
      if (isMounted.current) {
        setError(msg)
      }
    } finally {
      if (isMounted.current) {
        setIsGeneratingAccount(false)
      }
    }
  }, [newCooldown, isGeneratingAccount, copyToClipboard])

  const createCustomAccount = useCallback(async (username: string, domain: string, turnstileToken?: string) => {
    setIsGeneratingAccount(true)
    setError(null)
    try {
      const address = `${username}@${domain}`
      const password = `Tmp!${Math.random().toString(36).slice(-8)}`

      let acc: { id: string; address: string; remaining?: number }
      if (turnstileToken) {
        acc = await createCustomAccountApi(username, domain, turnstileToken)
      } else {
        acc = await createAccount(address, password)
      }
      const token = await getToken(address, password)

      const session: MailAccount = {
        id: acc.id,
        address,
        password,
        token,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      if (isMounted.current) {
        setAccount(session)
        setMessages([])
        prevMessagesCount.current = 0
        setCountdown(POLLING_INTERVAL_SEC)
        if (typeof acc.remaining === 'number') {
          setRateLimit((prev) => ({
            ...prev,
            remaining: acc.remaining as number,
            count: prev.limit - (acc.remaining as number),
          }))
          if (acc.remaining <= 0) setIsLimitReached(true)
        }
      }

      await copyToClipboard(address)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat custom email'
      if (msg.includes('Batas harian') || msg.includes('quota exceeded')) {
        setIsLimitReached(true)
        setRateLimit((prev) => ({ ...prev, remaining: 0, count: prev.limit }))
      }
      if (isMounted.current) {
        setError(msg)
      }
      throw new Error(msg)
    } finally {
      if (isMounted.current) {
        setIsGeneratingAccount(false)
      }
    }
  }, [copyToClipboard])

  const switchDomain = useCallback(async (newDomain: string) => {
    if (!account?.address) return
    const username = account.address.split('@')[0]
    await createCustomAccount(username, newDomain)
  }, [account?.address, createCustomAccount])

  const deleteCurrentMailbox = useCallback(async () => {
    const prevAddress = account?.address
    localStorage.removeItem(STORAGE_KEY)
    setAccount(null)
    setMessages([])
    prevMessagesCount.current = 0

    if (prevAddress) {
      deleteEntireMailboxApi(prevAddress).catch(() => {})
    }

    showToast('Mailbox berhasil dihapus')
    await initNewAccount(true)
  }, [account?.address, initNewAccount, showToast])

  const fetchInbox = useCallback(async (silent = false) => {
    if (!account?.address) return
    if (!silent) {
      if (refreshCooldown > 0 || isLoadingMessages) return
      setIsLoadingMessages(true)
      setRefreshCooldown(COOLDOWN_SECONDS)
    }

    try {
      const list = await getMessages(account.token, account.address)
      if (isMounted.current) {
        if (!isFirstLoad.current && list.length > prevMessagesCount.current) {
          playDingSound()
          showToast(`New email received (${list.length - prevMessagesCount.current})`)
        }
        isFirstLoad.current = false
        prevMessagesCount.current = list.length
        setMessages(list)
        setLastChecked(new Date())
        setCountdown(POLLING_INTERVAL_SEC)
        setError(null)
      }
    } catch (err: unknown) {
      if (isMounted.current && !silent) {
        setError(err instanceof Error ? err.message : 'Gagal memuat pesan')
      }
    } finally {
      if (isMounted.current && !silent) {
        setIsLoadingMessages(false)
      }
    }
  }, [account?.address, account?.token, refreshCooldown, isLoadingMessages, showToast])

  // Handle first load init
  useEffect(() => {
    if (!account) {
      initNewAccount()
    } else {
      fetchInbox(true)
    }
  }, [account, initNewAccount, fetchInbox])

  // Polling interval & countdown tick
  useEffect(() => {
    if (!account?.token) return

    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchInbox(true)
          return POLLING_INTERVAL_SEC
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [account?.token, fetchInbox])

  const removeMessage = useCallback(async (id: string) => {
    if (!account?.address) return
    await deleteMessage(account.token, id, account.address)
    setMessages((prev) => {
      const next = prev.filter((m) => m.id !== id)
      prevMessagesCount.current = next.length
      return next
    })
  }, [account?.address, account?.token])

  return {
    account,
    messages,
    isLoadingMessages,
    isGeneratingAccount,
    isLimitReached,
    rateLimit,
    newCooldown,
    refreshCooldown,
    error,
    lastChecked,
    countdown,
    toastMessage,
    fetchInbox: () => fetchInbox(false),
    initNewAccount: () => initNewAccount(true),
    createCustomAccount,
    switchDomain,
    deleteCurrentMailbox,
    removeMessage,
    showToast,
    resetLimitWarning: () => setIsLimitReached(false),
  }
}
