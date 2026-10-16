import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { fetchAllFeeds } from '../lib/rss'

export default function Home({ articles }) {
  const [tab, setTab] = useState('All')

  const sources = useMemo(() => {
    const s = new Set()
    articles.forEach(a => {
      if (a.source) s.add(a.source)
    })
    return ['All', ...Array.from(s)]
  }, [articles])

  const filtered = useMemo(() => {
    if (tab === 'All') return articles
    return articles.filter(a => a.source === tab)
  }, [articles, tab])

  return (
    <>
      <Head>
        <title>Pulse AI — Latest AI News</title>
        <meta name="description" content="Pulse AI — curated AI news aggregated from niche sources. Refreshed every 30 minutes (ISR)." />
      </Head>

      <div className="container">
        <header className="header">
          <div>
            <h1>Pulse AI</h1>
            <div className="tagline">Curated AI news — refreshed every 30 minutes (ISR)</div>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>RSS · ISR (30m)</div>
        </header>

        <nav className="tabs" aria-label="Sources">
          {sources.map(s => (
            <button
              key={s}
              className={`tab ${s === tab ? 'active' : ''}`}
              onClick={() => setTab(s)}
            >
              {s}
            </button>
          ))}
        </nav>

        <main style={{ marginTop: 18 }}>
          {filtered.length === 0 ? (
            <div className="card"><p className="meta">No articles found. Try again later.</p></div>
          ) : (
            <div className="grid">
              {filtered.map(a => {
                const plain = (a.content || '').replace(/(<([^>]+)>)/gi, '')
                const snippet = plain.length > 220 ? plain.slice(0, 220) + '…' : plain
                return (
                  <article className="card" key={a.id}>
                    <h2 className="card-title">
                      <Link href={`/article/${a.id}`}><a>{a.title}</a></Link>
                    </h2>
                    <p className="meta">{new Date(a.pubDate).toLocaleString()} · {a.source}</p>
                    {snippet ? <p className="summary">{snippet}</p> : null}
                    <div style={{ marginTop: 12 }}>
                      <Link href={`/article/${a.id}`}><a className="read-more">Read →</a></Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>
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
