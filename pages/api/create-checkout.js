import Razorpay from 'razorpay'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, planType } = req.body

  if (!email || !planType) {
    return res.status(400).json({ error: 'Email and planType required' })
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const PLAN_IDS = {
      monthly: 'plan_TwW9KYKakmfvZV',
      annual: 'plan_TwWBz1qPxResEW',
    }

    const planId = PLAN_IDS[planType]
    if (!planId) return res.status(400).json({ error: 'Invalid plan type' })

    // 30 days from now (Unix timestamp) = trial period
    const startAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === 'monthly' ? 12 : 1,
      start_at: startAt,
      quantity: 1,
    })

    return res.status(200).json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
