import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { email } = req.query

  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('subscribers')
      .select('is_premium')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !data) {
      return res.status(200).json({ isPremium: false })
    }

    return res.status(200).json({ isPremium: data.is_premium === true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
