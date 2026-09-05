import { useState, useEffect, useCallback, useRef } from 'react'
import {
  type MailAccount,
  type MessageItem,
  fetchAvailableDomain,
  createAccount,
  getToken,
  getMessages,
  deleteMessage,
  generateRandomCreds,
} from '../services/mailApi'
import { playDingSound } from '../utils/sound'

const STORAGE_KEY = 'tmail_session_v1'
const POLLING_INTERVAL_SEC = 6

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

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const initNewAccount = useCallback(async (autoCopy = false) => {
    setIsGeneratingAccount(true)
    setError(null)
    try {
      const domain = await fetchAvailableDomain()
      const { address, password } = generateRandomCreds(domain)
      const acc = await createAccount(address, password)
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
      }

      if (autoCopy) {
        await copyToClipboard(address)
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Gagal membuat akun')
      }
    } finally {
      if (isMounted.current) {
        setIsGeneratingAccount(false)
      }
    }
  }, [copyToClipboard])

  const createCustomAccount = useCallback(async (username: string, domain: string) => {
    setIsGeneratingAccount(true)
    setError(null)
    try {
      const address = `${username}@${domain}`
      const password = `Tmp!${Math.random().toString(36).slice(-8)}`
      const acc = await createAccount(address, password)
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
      }

      await copyToClipboard(address)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat custom email'
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
    localStorage.removeItem(STORAGE_KEY)
    setAccount(null)
    setMessages([])
    prevMessagesCount.current = 0
    showToast('Mailbox deleted. Generating new...')
    await initNewAccount(true)
  }, [initNewAccount, showToast])

  const fetchInbox = useCallback(async (silent = false) => {
    if (!account?.address) return
    if (!silent) setIsLoadingMessages(true)

    try {
      const list = await getMessages(account.token, account.address)
      if (isMounted.current) {
        // Ding jika ada email baru (bukan load pertama)
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
  }, [account?.address, account?.token, showToast])

  // Handle first load init
  useEffect(() => {
    if (!account) {
      initNewAccount()
    } else {
      fetchInbox()
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
    setMessages(prev => {
      const next = prev.filter(m => m.id !== id)
      prevMessagesCount.current = next.length
      return next
    })
  }, [account?.address, account?.token])

  return {
    account,
    messages,
    isLoadingMessages,
    isGeneratingAccount,
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
  }
}
