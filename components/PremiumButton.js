import { useState } from 'react'

export default function PremiumButton({ planType = 'monthly', userEmail, gateway = 'razorpay' }) {
  const [loading, setLoading] = useState(false)
  const [localEmail, setLocalEmail] = useState(userEmail || '')
  const [showEmailInput, setShowEmailInput] = useState(!userEmail)

  const handleClick = async () => {
    const emailToUse = userEmail || localEmail

    if (!emailToUse || !emailToUse.includes('@')) {
      setShowEmailInput(true)
      return
    }

    setLoading(true)
    try {
      // Save email to localStorage so it persists
      localStorage.setItem('pulse_email', emailToUse)

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, planType, gateway }),
      })
      const data = await res.json()

      if (data.error) {
        alert('Error: ' + data.error)
        setLoading(false)
        return
      }

      if (gateway === 'stripe') {
        if (data.url) {
          window.location.href = data.url
        } else {
          alert('Stripe checkout not configured yet.')
        }
        return
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'PulseAI',
        description: planType === 'monthly' ? 'PulseAI Pro Monthly — ₹199/month after trial' : 'PulseAI Pro Annual — ₹1,999/year after trial',
        prefill: { email: emailToUse },
        theme: { color: '#2563eb' },
        handler: function (response) {
          alert('Success! Your 30-day free trial has started.')
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

  const label = planType === 'monthly'
    ? (gateway === 'razorpay' ? 'Start Free Trial (₹199/month)' : 'Start Free Trial ($7/month)')
    : (gateway === 'razorpay' ? 'Start Free Trial (₹1,999/year)' : 'Start Free Trial ($69/year)')

  return (
    <div>
      {showEmailInput && !userEmail && (
        <input
          type="email"
          placeholder="Enter your email"
          value={localEmail}
          onChange={(e) => setLocalEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '14px',
            marginBottom: '10px',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
      )}
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
          width: '100%'
        }}
      >
        {loading ? 'Starting...' : label}
      </button>
    </div>
  )
}
