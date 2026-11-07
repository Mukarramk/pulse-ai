import Head from 'next/head'
import Link from 'next/link'

export default function Refund() {
  return (
    <>
      <Head>
        <title>Refund Policy — PulseAI</title>
      </Head>
      <div className="container">
        <header className="header">
          <Link href="/"><a className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PulseAI</span>
          </a></Link>
          <Link href="/"><a className="back-link">← Back to home</a></Link>
        </header>

        <article className="article-shell">
          <h1 className="article-title">Refund Policy</h1>
          <p className="meta">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="article-body">
            <h2>1. Free Trial</h2>
            <p>PulseAI Pro includes a 30-day free trial. You will not be charged during the trial. You may cancel any time during the trial without any charge.</p>

            <h2>2. Subscription Refunds</h2>
            <p>Once a paid subscription has been charged (after the trial), refunds are handled as follows:</p>
            <ul>
              <li><strong>Within 7 days of charge</strong> — full refund available on request, if you have not accessed premium content.</li>
              <li><strong>After 7 days</strong> — no refund for the current billing period, but you may cancel to prevent future charges.</li>
              <li><strong>Annual subscriptions</strong> — prorated refund available if cancelled within 30 days of charge.</li>
            </ul>

            <h2>3. How to Request a Refund</h2>
            <p>Email <a href="mailto:consultancymukarram@gmail.com">consultancymukarram@gmail.com</a> with your subscription email and the reason for the request. Refunds are processed within 5–7 business days to your original payment method.</p>

            <h2>4. Cancellations</h2>
            <p>You may cancel your subscription at any time from your Razorpay or Stripe dashboard, or by emailing us. Cancellation stops future billing but does not refund past charges except as described above.</p>

            <h2>5. Exceptions</h2>
            <p>We do not issue refunds for:</p>
            <ul>
              <li>Requests made more than 7 days after charge (except annual plans).</li>
              <li>Accounts terminated for violation of our Terms of Service.</li>
              <li>Requests based on content disagreements (the Service curates third-party news; we do not claim to represent any political or editorial viewpoint).</li>
            </ul>

            <h2>6. Contact</h2>
            <p>For refund questions, contact <a href="mailto:consultancymukarram@gmail.com">consultancymukarram@gmail.com</a>.</p>
          </div>
        </article>
      </div>
    </>
  )
}
