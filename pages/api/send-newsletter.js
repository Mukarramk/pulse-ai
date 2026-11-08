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

    const { data: takes, error: takesError } = await supabase
      .from('pulse_takes')
      .select('*')

    if (takesError || !takes || takes.length === 0) {
      return res.status(500).json({ error: 'No pulse data found' })
    }

    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email')

    if (subError || !subscribers || subscribers.length === 0) {
      return res.status(200).json({ message: 'No subscribers yet' })
    }

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    const utm = 'utm_source=newsletter&utm_medium=email&utm_campaign=daily'

    const categoryColors = {
      Models: { bg: '#eff6ff', text: '#2563eb' },
      Tools:  { bg: '#ecfdf5', text: '#059669' },
      Money:  { bg: '#fef3c7', text: '#d97706' },
      Policy: { bg: '#fce7f3', text: '#be185d' },
    }

    const pulseHtml = takes.map((item, i) => {
      const colors = categoryColors[item.category] || { bg: '#f3f4f6', text: '#374151' }
      const internalLink = `${SITE_URL}/article/${item.article_id}?${utm}`
      const externalLink = item.article_link
      
      const imageBlock = item.image_url
        ? `<img src="${item.image_url}" alt="" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; display: block; margin: 0 0 18px 0;" />`
        : ''

      return `
        <div style="margin-bottom: ${i === takes.length - 1 ? '12px' : '40px'}; padding-bottom: ${i === takes.length - 1 ? '12px' : '40px'}; border-bottom: ${i === takes.length - 1 ? 'none' : '1px solid #eaeaea'};">
          
          <div style="display: inline-block; background: ${colors.bg}; color: ${colors.text}; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 5px 11px; border-radius: 5px; margin-bottom: 14px; letter-spacing: 0.05em;">
            ${item.category}
          </div>

          ${imageBlock}

          <h2 style="font-size: 21px; font-weight: 700; line-height: 1.35; margin: 0 0 16px 0; color: #0a0a0a; letter-spacing: -0.01em;">
            ${item.article_title}
          </h2>

          <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 16px 18px; border-radius: 8px; margin-bottom: 18px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 6px; letter-spacing: 0.08em;">Why it matters</div>
            <p style="font-size: 14px; line-height: 1.65; color: #333; margin: 0;">${item.take_email || item.take}</p>
          </div>

          <div style="font-size: 14px; line-height: 1.8;">
            <a href="${internalLink}" style="color: #2563eb; font-weight: 700; text-decoration: none;">Read on PulseAI →</a>
            <span style="color: #ddd; margin: 0 10px;">|</span>
            <a href="${externalLink}" style="color: #888; font-weight: 600; text-decoration: none;">Read original ↗</a>
          </div>
        </div>
      `
    }).join('')

    // 4. Send to each subscriber with their own unsubscribe link
    const results = []
    for (const sub of subscribers) {
      const unsubscribeLink = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafafa; margin: 0; padding: 0;">
          <div style="max-width: 620px; margin: 0 auto; background: #ffffff;">
            
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 28px 32px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: #ffffff;">PulseAI</div>
              <div style="font-size: 13px; color: rgba(255,255,255,0.85); margin-top: 6px;">${dateStr}</div>
            </div>

            <div style="padding: 40px 32px;">
              
              <h1 style="font-size: 26px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #0a0a0a; letter-spacing: -0.02em;">
                Your Daily Pulse
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #666; margin: 0 0 36px 0;">
                The most important AI & tech stories for busy professionals — in 5 minutes.
              </p>

              ${pulseHtml}

              <div style="background: linear-gradient(135deg, #f0f4ff, #faf5ff); border: 1px solid #e5e7eb; border-radius: 14px; padding: 28px; margin: 40px 0 32px 0; text-align: center;">
                <h3 style="font-size: 17px; font-weight: 800; margin: 0 0 8px 0; color: #0a0a0a;">Want to sponsor PulseAI?</h3>
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0 0 16px 0;">
                  Reach busy engineers, PMs, and founders. Just reply to this email.
                </p>
                <a href="mailto:consultancymukarram@gmail.com?subject=Sponsoring%20PulseAI" style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
                  Get in touch →
                </a>
              </div>

              <div style="background: #ffffff; border: 2px solid #2563eb; border-radius: 14px; padding: 24px; margin: 0 0 32px 0; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">PulseAI Pro</div>
                <h3 style="font-size: 17px; font-weight: 800; margin: 0 0 8px 0; color: #0a0a0a;">Go deeper with PulseAI Pro</h3>
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 0 0 16px 0;">
                  Ad-free newsletter, full archive, and weekly Deep Dives. 1-month free trial.
                </p>
                <a href="${SITE_URL}#pricing" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
                  Start Free Trial →
                </a>
              </div>

              <div style="padding-top: 24px; border-top: 1px solid #eaeaea; text-align: center;">
                <p style="font-size: 12px; color: #999; line-height: 1.6; margin: 0 0 8px 0;">
                  PulseAI aggregates headlines from public RSS feeds.<br/>
                  All content belongs to the original publishers.
                </p>
                <p style="font-size: 12px; color: #999; margin: 0 0 8px 0;">
                  <a href="${SITE_URL}?${utm}" style="color: #999; text-decoration: underline;">Visit the website</a>
                  <span style="margin: 0 6px;">·</span>
                  <a href="${SITE_URL}/blog" style="color: #999; text-decoration: underline;">Read the blog</a>
                </p>
                <p style="font-size: 11px; color: #bbb; margin: 0 0 8px 0;">
                  <a href="${SITE_URL}/terms" style="color: #bbb;">Terms</a>
                  · <a href="${SITE_URL}/privacy" style="color: #bbb;">Privacy</a>
                  · <a href="${SITE_URL}/refund" style="color: #bbb;">Refunds</a>
                </p>
                <p style="font-size: 11px; color: #bbb; margin: 0;">
                  <a href="${unsubscribeLink}" style="color: #bbb; text-decoration: underline;">Unsubscribe</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

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
