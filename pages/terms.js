import Head from 'next/head'
import Link from 'next/link'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — PulseAI</title>
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
          <h1 className="article-title">Terms of Service</h1>
          <p className="meta">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="article-body">
            <h2>1. About PulseAI</h2>
            <p>PulseAI ("we", "us", "our") operates a curated AI and technology news aggregator available at this domain (the "Service"). By accessing or using the Service, you agree to these Terms of Service.</p>

            <h2>2. Use of the Service</h2>
            <p>You may use the Service for personal, non-commercial purposes. You agree not to:</p>
            <ul>
              <li>Scrape, copy, or republish our content without written permission.</li>
              <li>Attempt to bypass any security or access-control measures.</li>
              <li>Use the Service in any way that violates applicable laws.</li>
            </ul>

            <h2>3. Third-Party Content</h2>
            <p>PulseAI aggregates headlines and summaries from publicly available RSS feeds and other sources. We do not claim ownership of third-party content. All original content remains the property of its respective publishers. You agree to visit the original source to read the full article.</p>

            <h2>4. Premium Subscriptions</h2>
            <p>PulseAI offers a premium subscription ("PulseAI Pro") with a 30-day free trial. After the trial, you will be billed at the rate selected at checkout (₹199/month or ₹1,999/year for Indian users, or $7/month or $69/year for international users). You may cancel any time from your Razorpay or Stripe dashboard or by contacting us.</p>

            <h2>5. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any news content. Use the Service at your own risk.</p>

            <h2>6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, PulseAI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>

            <h2>7. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance.</p>

            <h2>8. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:consultancymukarram@gmail.com">consultancymukarram@gmail.com</a>.</p>
          </div>
        </article>
      </div>
    </>
  )
}
