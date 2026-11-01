// v4 - upgraded email design with images, dual links, UTM, sponsor CTA
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pulse-ai-tawny-psi.vercel.app'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Fetch today's Pulse takes
    const { data: takes, error: takesError } = await supabase
      .from('pulse_takes')
      .select('*')

    if (takesError || !takes || takes.length === 0) {
      return res.status(500).json({ error: 'No pulse data found' })
    }

    // 2. Fetch all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email')

    if (subError || !subscribers || subscribers.length === 0) {
      return res.status(200).json({ message: 'No subscribers yet' })
    }

    // 3. Build the HTML email
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    // Build the UTM string once and reuse
    const utm = 'utm_source=newsletter&utm_medium=email&utm_campaign=daily'

    const pulseHtml = takes.map(item => {
      const imageBlock = item.image_url
        ? `<img src="${item.image_url}" alt="" style="width: 100%; max-width: 480px; height: 180px; object-fit: cover; border-radius: 8px; display: block; margin: 0 0 16px 0;" />`
        : ''

      const internalLink = `${SITE_URL}/article/${item.article_id}?${utm}`
      const externalLink = `${item.article_link}?${utm}`

      return `
        <div style="margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid #eaeaea;">
          <div style="display: inline-block; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; letter-spacing: 0.05em;">
            ${item.category}
          </div>
          ${imageBlock}
          <h2 style="font-size: 20px; font-weight: 700; line-height: 1.35; margin: 0 0 14px 0; color: #0a0a0a;">
            ${item.article_title}
          </h2>
          <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 14px 16px; border-radius: 6px; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 6px; letter-spacing: 0.05em;">Why it matters</div>
            <p style="font-size: 14px; line-height: 1.65; color: #333; margin: 0;">${item.take_email || item.take}</p>
          </div>
          <div style="font-size: 13px; line-height: 1.8;">
            <a href="${internalLink}" style="color: #2563eb; font-weight: 700; text-decoration: none;">→ Read on PulseAI</a>
            <span style="color: #ccc; margin: 0 8px;">|</span>
            <a href="${externalLink}" style="color: #888; font-weight: 600; text-decoration: none;">Read original ↗</a>
          </div>
        </div>
      `
    }).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafafa; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 32px;">
          
          <div style="margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0a0a0a;">
            <a href="${SITE_URL}?${utm}" style="text-decoration: none;">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #0a0a0a;">PulseAI</div>
            </a>
            <div style="font-size: 13px; color: #666; margin-top: 4px;">${dateStr} · Built in India, read worldwide</div>
          </div>

          <h1 style="font-size: 28px; font-weight: 800; line-height: 1.2; margin: 0 0 8px 0; color: #0a0a0a;">
            Your Daily Pulse
          </h1>
          <p style="font-size: 15px; color: #666; margin: 0 0 32px 0;">
            The most important AI & tech stories for busy professionals — in 5 minutes.
          </p>

          ${pulseHtml}

          <div style="background: linear-gradient(135deg, #f0f4ff, #faf5ff); border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-top: 32px; text-align: center;">
            <h3 style="font-size: 16px; font-weight: 800; margin: 0 0 8px 0; color: #0a0a0a;">Want to sponsor PulseAI?</h3>
            <p style="font-size: 13px; color: #666; margin: 0 0 12px 0;">
              Reach busy engineers, PMs, and founders. Just reply to this email.
            </p>
            <a href="mailto:consultancymukarram@gmail.com?subject=Sponsoring%20PulseAI" style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px;">
              Get in touch →
            </a>
          </div>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eaeaea; text-align: center;">
            <p style="font-size: 12px; color: #999; margin: 0 0 8px 0;">
              PulseAI aggregates headlines from public RSS feeds. All content belongs to the original publishers.
            </p>
            <p style="font-size: 12px; color: #999; margin: 0 0 8px 0;">
              <a href="${SITE_URL}?${utm}" style="color: #999; text-decoration: underline;">Visit the website</a>
              <span style="margin: 0 6px;">·</span>
              <a href="${SITE_URL}/blog" style="color: #999; text-decoration: underline;">Read the blog</a>
            </p>
            <p style="font-size: 11px; color: #bbb; margin: 0;">
              You're receiving this because you subscribed to PulseAI.<br/>
              <a href="mailto:consultancymukarram@gmail.com?subject=Unsubscribe" style="color: #bbb;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // 4. Send to each subscriber
    const results = []
    for (const sub of subscribers) {
      try {
        await resend.emails.send({
          from: 'PulseAI <onboarding@resend.dev>',
          to: sub.email,
          subject: `PulseAI Daily — ${dateStr}`,
          html: html
        })
        results.push({ email: sub.email, status: 'sent' })
      } catch (err) {
        results.push({ email: sub.email, status: 'failed', error: err.message })
      }
    }

    return res.status(200).json({
      success: true,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    })

  } catch (err) {
    return res.status(500).json({ 
      error: err.message,
      name: err.name
    })
  }
}
