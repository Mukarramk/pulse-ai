import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { fetchAllFeeds } from '../lib/rss'

const CATEGORIES = ['All', 'Models', 'Tools', 'Money', 'Policy']

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

export default function Home({ articles }) {
  const [tab, setTab] = useState('All')

  const filtered = useMemo(() => {
    if (tab === 'All') return articles
    return articles.filter(a => a.category === tab)
  }, [articles, tab])

  const [hero, ...rest] = filtered

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
          <div className="header-meta">Updated every 30 min</div>
        </header>

        <section className="intro">
          <h1 className="intro-title">
            AI & Tech, <span className="gradient-text">curated for India</span>
          </h1>
          <p className="intro-sub">
            The most important stories for Indian developers and founders — in 5 minutes.
          </p>
        </section>

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
            <>
              {hero && (
                <Link href={`/article/${hero.id}`}>
                  <a className="hero-card">
                    <div className="category-badge">{hero.category}</div>
                    <h2 className="hero-title">{hero.title}</h2>
                    <p className="hero-summary">
                      {(hero.content || '').replace(/(<([^>]+)>)/gi, '').slice(0, 240)}…
                    </p>
                    <div className="meta">
                      {timeAgo(hero.pubDate)} · {hero.source}
                    </div>
                  </a>
                </Link>
              )}

              <div className="grid">
                {rest.map(a => {
                  const plain = (a.content || '').replace(/(<([^>]+)>)/gi, '')
                  const snippet = plain.length > 180 ? plain.slice(0, 180) + '…' : plain
                  return (
                    <article className="card" key={a.id}>
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
            </>
          )}
        </main>

        <footer className="footer">
          PulseAI aggregates headlines from public RSS feeds. All content belongs to the original publishers.
        </footer>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const articles = await fetchAllFeeds().catch((err) => {
    console.warn('fetchAllFeeds failed:', err && err.message ? err.message : err)
    return []
  })

  return {
    props: {
      articles: articles.slice(0, 200)
    },
    revalidate: 1800
  }
}
