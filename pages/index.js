import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { fetchAllFeeds } from '../lib/rss'

const CATEGORIES = ['All', 'Models', 'Tools', 'Money', 'Policy']
const PULSE_CATEGORIES = ['Models', 'Tools', 'Money', 'Policy']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Home({ articles, pulse }) {
  const [tab, setTab] = useState('All')
  const [subStatus, setSubStatus] = useState({ type: '', message: '' })
  const [role, setRole] = useState('engineer')

  useEffect(() => {
    const savedRole = localStorage.getItem('pulse_role')
    if (savedRole) setRole(savedRole)
  }, [])

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    localStorage.setItem('pulse_role', newRole)
  }

  const filtered = useMemo(() => {
    if (tab === 'All') return articles
    return articles.filter(a => a.category === tab)
  }, [articles, tab])

  const hasPulse = PULSE_CATEGORIES.some(c => pulse && pulse[c])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    setSubStatus({ type: 'loading', message: 'Subscribing...' })
    
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    
    if (res.ok) {
      setSubStatus({ type: 'success', message: 'Success! Check your inbox for a welcome email.' })
      e.target.reset()
    } else {
      setSubStatus({ type: 'error', message: data.error || 'Something went wrong.' })
    }
  }

  const playAudioBrief = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech.')
      return
    }
    window.speechSynthesis.cancel()
    const intro = `Here is your PulseAI brief for today.`
    const roleName = role === 'engineer' ? 'Software Engineer' : role === 'pm' ? 'Product Manager' : 'Founder'
    const items = PULSE_CATEGORIES.map(cat => {
      const item = pulse[cat]
      if (!item) return null
      const take = item[`take_${role}`] || item.take
      return `In ${cat} news: ${item.articleTitle}. Why it matters for a ${roleName}: ${take}`
    }).filter(Boolean)
    const outro = `That's your brief for today. Have a productive day.`
    const fullText = [intro, ...items, outro].join(' ')
    const utterance = new SpeechSynthesisUtterance(fullText)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      <Head>
        <title>PulseAI — AI & Tech for Indian Professionals</title>
        <meta name="description" content="PulseAI curates the most important AI and tech stories every day, so Indian developers and founders can stay informed in 5 minutes." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <Link href="/"><a className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PulseAI</span>
          </a></Link>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/blog"><a className="read-more">Blog</a></Link>
            <span className="header-meta">Updated every 30 min</span>
          </div>
        </header>

        <section className="intro">
          <h1 className="intro-title">
            AI & Tech, <span className="gradient-text">curated for India</span>
          </h1>
          <p className="intro-sub">
            The most important stories for Indian developers and founders — in 5 minutes.
          </p>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>I am a:</span>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--border)', padding: '4px', borderRadius: '12px' }}>
              {[
                { id: 'engineer', label: 'Engineer' },
                { id: 'pm', label: 'Product Manager' },
                { id: 'founder', label: 'Founder' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: role === r.id ? 'var(--bg)' : 'transparent',
                    color: role === r.id ? 'var(--fg)' : 'var(--muted)',
                    boxShadow: role === r.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {hasPulse && (
          <section className="pulse-section">
            <div className="section-header">
              <h2 className="section-label">Today's Pulse</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={playAudioBrief}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🔊 Listen to Brief
                </button>
                <span className="section-meta" style={{ margin: 0 }}>Curated for Busy Professionals</span>
              </div>
            </div>
            <div className="pulse-grid">
              {PULSE_CATEGORIES.map(cat => {
                const item = pulse[cat]
                if (!item) return null
                const activeTake = item[`take_${role}`] || item.take
                return (
                  <div className="pulse-card" key={cat}>
                    {item.imageUrl && (
                      <div className="card-image-wrapper">
                        <img src={item.imageUrl} alt={item.articleTitle} className="card-image" />
                      </div>
                    )}
                    <div className="pulse-card-header">
                      <div className="category-badge">{cat}</div>
                    </div>
                    <h3 className="pulse-title">
                      <Link href={`/article/${item.articleId}`}>
                        <a>{item.articleTitle}</a>
                      </Link>
                    </h3>
                    <div className="pulse-content">
                      <span className="pulse-label">Why it matters ({role === 'pm' ? 'PM' : role === 'founder' ? 'Founder' : 'Engineer'}):</span>
                      <p className="pulse-take">{activeTake}</p>
                    </div>
                    <div className="pulse-footer">
                      <span className="pulse-source">{item.source}</span>
                      <Link href={`/article/${item.articleId}`}>
                        <a className="pulse-read-more">Read Story →</a>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <nav className="tabs" aria-label="Categories">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`tab ${c === tab ? 'active' : ''}`}
              onClick={() => setTab(c)}
            >
              {c}
            </button>
          ))}
        </nav>

        <main>
          {filtered.length === 0 ? (
            <div className="card"><p className="meta">No articles in this category yet.</p></div>
          ) : (
            <div className="grid">
              {filtered.map(a => {
                const plain = (a.content || '').replace(/(<([^>]+)>)/gi, '')
                const snippet = plain.length > 180 ? plain.slice(0, 180) + '…' : plain
                return (
                  <article className="card" key={a.id}>
                    {a.imageUrl && (
                      <div className="card-image-wrapper">
                        <img src={a.imageUrl} alt={a.title} className="card-image" />
                      </div>
                    )}
                    <div className="category-badge">{a.category}</div>
                    <h3 className="card-title">
                      <Link href={`/article/${a.id}`}><a>{a.title}</a></Link>
                    </h3>
                    <p className="meta">{timeAgo(a.pubDate)} · {a.source}</p>
                    {snippet ? <p className="summary">{snippet}</p> : null}
                    <div className="card-footer">
                      <Link href={`/article/${a.id}`}><a className="read-more">Read →</a></Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>

        <section className="subscribe-section">
          <h2 className="subscribe-title">Get the daily AI pulse in your inbox</h2>
          <p className="subscribe-sub">Join Indian developers and founders. No spam.</p>
          
          {subStatus.type === 'success' ? (
            <div className="subscribe-success">
              {subStatus.message}
            </div>
          ) : (
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <input 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                className="subscribe-input"
                disabled={subStatus.type === 'loading'}
              />
              <button 
                type="submit" 
                className="subscribe-button"
                disabled={subStatus.type === 'loading'}
              >
                {subStatus.type === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          
          {subStatus.type === 'error' && (
            <p className="subscribe-error">{subStatus.message}</p>
          )}
        </section>

        <footer className="footer">
          PulseAI aggregates headlines from public RSS feeds. All content belongs to the original publishers.
        </footer>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const articles = await fetchAllFeeds().catch((err) => {
    console.warn('fetchAllFeeds failed:', err?.message || err)
    return []
  })

  let pulse = { Models: null, Tools: null, Money: null, Policy: null }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase.from('pulse_takes').select('*')
    if (error) throw error
    if (data) {
      data.forEach(row => {
        pulse[row.category] = {
          articleId: row.article_id,
          articleTitle: row.article_title,
          articleLink: row.article_link,
          source: row.source,
          take: row.take,
          take_engineer: row.take_engineer,
          take_pm: row.take_pm,
          take_founder: row.take_founder,
          imageUrl: row.image_url
        }
      })
    }
  } catch (err) {
    console.warn('Supabase fetch failed:', err?.message || err)
  }

  return {
    props: {
      articles: articles.slice(0, 200),
      pulse
    },
    revalidate: 1800
  }
}
