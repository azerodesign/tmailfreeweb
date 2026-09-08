import { saveVoucherRemote } from './voucherService'

export interface CreateOrderParams {
  planId: string
  amount: number
  planName: string
  days: number
}

export async function createKisoraQrisOrder({ planId, amount, planName, days }: CreateOrderParams) {
  try {
    const res = await fetch('/api/kisora?path=create-order', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        label: `TMail ${planName}`,
      }),
    })

    const data = await res.json()
    if (!data.order_id) {
      throw new Error(data.error || 'Gagal membuat tagihan QRIS Kisora')
    }

    return {
      orderId: data.order_id as string,
      amount: data.amount as number,
      qrisPayload: data.qris_payload as string,
      expiresAt: data.expires_at as string,
      checkoutUrl: `https://dashboard.kisora.my.id/order/${data.order_id}`,
      qrImageUrl: `https://api.kisora.my.id/order/${data.order_id}/qr.png`,
      planId,
      days,
    }
  } catch (err) {
    console.error('Kisora QRIS Create Error:', err)
    throw err
  }
}

export async function checkKisoraOrderStatus(orderId: string) {
  try {
    const res = await fetch(`/api/kisora?path=order/${orderId}`)
    const data = await res.json()
    return {
      status: data.status as 'pending' | 'verified' | 'expired' | 'cancelled',
      paidAt: data.paid_at as string | null,
    }
  } catch (err) {
    console.error('Kisora Status Check Error:', err)
    return { status: 'pending', paidAt: null }
  }
}

// Generate random voucher token when payment is verified
export function generateVoucherCodeForPlan(planId: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let part1 = ''
  let part2 = ''
  for (let i = 0; i < 5; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length))
  for (let i = 0; i < 5; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length))
  const pfx = planId.replace('_PLUS', '+').toUpperCase()
  return `${pfx}-${part1}-${part2}`
}

export async function mintVoucherOnPaymentSuccess(planId: string, days: number) {
  const code = generateVoucherCodeForPlan(planId)
  const newVoucher = {
    code,
    plan: planId,
    days,
    createdAt: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    apiKey: `TML-VIP-${code}`,
  }
  await saveVoucherRemote(newVoucher)
  return newVoucher
}
