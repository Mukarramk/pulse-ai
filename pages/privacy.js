import Head from 'next/head'
import Link from 'next/link'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — PulseAI</title>
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
          <h1 className="article-title">Privacy Policy</h1>
          <p className="meta">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="article-body">
            <h2>1. What We Collect</h2>
            <p>We collect the following information when you use PulseAI:</p>
            <ul>
              <li><strong>Email address</strong> — when you subscribe to our newsletter.</li>
              <li><strong>Payment information</strong> — handled entirely by Razorpay (for Indian users) or Stripe (for international users). We do not store card numbers.</li>
              <li><strong>Usage data</strong> — via Google Analytics (page views, referrers, device type). This data is anonymized.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To send you the daily PulseAI newsletter.</li>
              <li>To manage your premium subscription.</li>
              <li>To improve the Service based on aggregate usage patterns.</li>
            </ul>

            <h2>3. How We Store Your Data</h2>
            <p>Your email is stored securely in Supabase (a PostgreSQL database hosted on AWS). Payment data is stored by Razorpay and Stripe, both of which are PCI-DSS compliant.</p>

            <h2>4. Sharing Your Information</h2>
            <p>We do not sell your data. We share it only with:</p>
            <ul>
              <li><strong>Razorpay / Stripe</strong> — to process payments.</li>
              <li><strong>Resend</strong> — to send emails.</li>
              <li><strong>Google Analytics</strong> — for anonymized usage metrics.</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You may request deletion of your data at any time by emailing <a href="mailto:consultancymukarram@gmail.com">consultancymukarram@gmail.com</a>. You can also unsubscribe from the newsletter using the link at the bottom of every email.</p>

            <h2>6. Cookies</h2>
            <p>We use cookies only through Google Analytics for anonymized traffic measurement. We do not use tracking cookies for advertising.</p>

            <h2>7. Changes</h2>
            <p>We may update this Privacy Policy from time to time. Continued use of the Service after changes constitutes acceptance.</p>

            <h2>8. Contact</h2>
            <p>For privacy questions, contact <a href="mailto:consultancymukarram@gmail.com">consultancymukarram@gmail.com</a>.</p>
          </div>
        </article>
      </div>
    </>
  )
}
