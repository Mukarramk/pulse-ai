import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { fetchAllFeeds } from '../lib/rss'

const CATEGORIES = ['All', 'Models', 'Tools', 'Money', 'Policy']

export default function Home({ articles }) {
  const [tab, setTab] = useState('All')

  const filtered = useMemo(() => {
    if (tab === 'All') return articles
    return articles.filter(a => a.category === tab)
  }, [articles, tab])

  return (
    <>
      <Head>
        <title>PulseAI — AI & Tech for Indian Professionals</title>
        <meta name="description" content="PulseAI curates the most important AI and tech stories every day, so Indian developers and founders can stay informed in 5 minutes." />
      </Head>

      <div className="container">
        <header className="header">
          <div>
            <h1>PulseAI</h1>
            <div className="tagline">
              AI & Tech for Indian professionals — updated every 30 minutes
            </div>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>RSS · ISR (30m)</div>
        </header>

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

        <main style={{ marginTop: 18 }}>
          {filtered.length === 0 ? (
            <div className="card"><p className="meta">No articles in this category yet.</p></div>
          ) : (
            <div className="grid">
              {filtered.map(a => {
                const plain = (a.content || '').replace(/(<([^>]+)>)/gi, '')
                const snippet = plain.length > 220 ? plain.slice(0, 220) + '…' : plain
                return (
                  <article className="card" key={a.id}>
                    <div className="category-badge">{a.category}</div>
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

        <footer style={{ marginTop: 48, color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
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
