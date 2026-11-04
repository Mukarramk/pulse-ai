export const dynamic = 'force-dynamic'

export default async function handler(req, res) {
  try {
    const response = await fetch('https://pulse-ai-tawny-psi.vercel.app/api/send-newsletter')
    const data = await response.json()
    return res.status(200).json({ success: true, newsletter: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
