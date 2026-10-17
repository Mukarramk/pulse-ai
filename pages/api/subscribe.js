import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { error } = await supabase
    .from('subscribers')
    .insert({ email: email.toLowerCase().trim() })

  if (error) {
    // Postgres unique violation code
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You are already subscribed!' })
    }
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ success: true, message: 'Subscribed!' })
}
