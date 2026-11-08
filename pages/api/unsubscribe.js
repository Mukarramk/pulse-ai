import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { email } = req.query
  if (!email) return res.status(400).send('Email required')

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('subscribers').delete().eq('email', email.toLowerCase().trim())
    return res.redirect('/unsubscribed')
  } catch (err) {
    return res.status(500).send('Error unsubscribing')
  }
}
