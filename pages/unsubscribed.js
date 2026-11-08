import Head from 'next/head'
import Link from 'next/link'

export default function Unsubscribed() {
  return (
    <>
      <Head><title>Unsubscribed — PulseAI</title></Head>
      <div className="container">
        <header className="header">
          <Link href="/"><a className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PulseAI</span>
          </a></Link>
        </header>
        <div className="article-shell" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <h1 className="article-title">You've been unsubscribed</h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', margin: '16px 0 32px' }}>
            You won't receive any more PulseAI emails.
          </p>
          <Link href="/">
            <a style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
              Back to PulseAI →
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}
