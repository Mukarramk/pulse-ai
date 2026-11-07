import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // 1. Save to Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { error } = await supabase
    .from('subscribers')
    .insert({ email: normalizedEmail })

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You are already subscribed!' })
    }
    return res.status(500).json({ error: error.message })
  }

  // 2. Send welcome email (wrapped so failures don't block signup)
  try {
    await resend.emails.send({
      from: 'PulseAI <onboarding@resend.dev>',
      to: normalizedEmail,
      subject: 'Welcome to PulseAI 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafafa; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 32px;">
            
            <div style="margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0a0a0a;">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #0a0a0a;">PulseAI</div>
              <div style="font-size: 13px; color: #666; margin-top: 4px;">Built in India, read worldwide</div>
            </div>

            <h1 style="font-size: 26px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0; color: #0a0a0a;">
              Welcome to PulseAI 🎉
            </h1>
            
            <p style="font-size: 16px; line-height: 1.7; color: #333; margin: 0 0 16px 0;">
              You're now subscribed to the daily AI & tech pulse for busy professionals.
            </p>
            
            <p style="font-size: 16px; line-height: 1.7; color: #333; margin: 0 0 24px 0;">
              Every morning, we'll send you the 4 most important stories with a clear <strong>"why it matters"</strong> breakdown — so you can stay informed in 5 minutes.
            </p>

            <div style="background: linear-gradient(135deg, #f0f4ff, #faf5ff); border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; margin: 32px 0; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Introducing PulseAI Pro</div>
              <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #0a0a0a;">
                Want more than the daily brief?
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 20px 0;">
                Get <strong>ad-free newsletters</strong>, full archive access, and weekly <strong>Deep Dives</strong> that go beyond the headlines.
              </p>
              
              <div style="font-size: 13px; color: #666; margin: 0 0 16px 0;">
                <strong>₹199/month</strong> or <strong>₹1,999/year</strong> (2 months free)
              </div>

              <a href="https://pulse-ai-tawny-psi.vercel.app#pricing" style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                Start 1-Month Free Trial →
              </a>

              <p style="font-size: 12px; color: #999; margin: 12px 0 0 0;">
                Cancel anytime. First charge after 30 days.
              </p>
            </div>

            <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 8px 0;">
              — The PulseAI Team
            </p>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eaeaea; text-align: center;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                You're receiving this because you subscribed to PulseAI.
              </p>
              <p style="font-size: 12px; color: #999; margin: 8px 0 0 0;">
                <a href="https://pulse-ai-tawny-psi.vercel.app/terms" style="color: #999;">Terms</a>
                · <a href="https://pulse-ai-tawny-psi.vercel.app/privacy" style="color: #999;">Privacy</a>
                · <a href="https://pulse-ai-tawny-psi.vercel.app/refund" style="color: #999;">Refunds</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (emailError) {
    console.error('Welcome email failed:', emailError)
    // Don't return an error — the subscription succeeded
  }

  return res.status(200).json({ success: true, message: 'Subscribed!' })
}
