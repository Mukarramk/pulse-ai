import { useState } from 'react'

export default function PremiumButton({ planType = 'monthly', userEmail }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!userEmail) {
      alert('Please subscribe to the free newsletter first to use your email.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, planType }),
      })
      const data = await res.json()

      if (data.error) {
        alert('Error: ' + data.error)
        setLoading(false)
        return
      }

      // Open Razorpay Checkout
      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'PulseAI',
        description: planType === 'monthly' ? 'PulseAI Pro — Monthly (₹199/month after 1-month free trial)' : 'PulseAI Pro — Annual (₹1,999/year after 1-month free trial)',
        prefill: { email: userEmail },
        theme: { color: '#2563eb' },
        handler: function (response) {
          alert('Success! Your 30-day free trial has started. You will be charged on day 31.')
          window.location.href = '/'
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        background: '#2563eb',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '15px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {loading ? 'Starting trial...' : `Start 1-Month Free Trial (${planType === 'monthly' ? '₹199/month' : '₹1,999/year'})`}
    </button>
  )
}
