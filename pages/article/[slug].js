import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { fetchAllFeeds } from '../../lib/rss'

export default function ArticlePage({ article }) {
  const [isPremium, setIsPremium] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkPremium() {
      const email = localStorage.getItem('pulse_email')
      if (!email) {
        setChecking(false)
        return
      }
      try {
        const res = await fetch(`/api/check-premium?email=${encodeURIComponent(email)}`)
        const data = await res.json()
        setIsPremium(data.isPremium || false)
      } catch (e) {
        console.error('Premium check failed:', e)
      }
      setChecking(false)
    }
    checkPremium()
  }, [])

  if (!article) {
    return (
      <div className="container">
        <p>Article not found.</p>
        <p><Link href="/"><a className="back-link">← Back to PulseAI</a></Link></p>
      </div>
    )
  }

  // Article is "archived" if it's older than 24 hours
  const publishedAt = new Date(article.pubDate).getTime()
  const isArchived = Date.now() - publishedAt > 24 * 60 * 60 * 1000

  const plainText = (article.content || '').replace(/(<([^>]+)>)/gi, '')
  const excerpt = plainText.length > 600 ? plainText.slice(0, 600) + '…' : plainText

  // If archived AND user is not premium AND we've finished checking → show paywall
  const showPaywall = isArchived && !isPremium && !checking

  return (
    <>
      <Head>
        <title>{article.title} — PulseAI</title>
        <meta name="description" content={article.title} />
      </Head>

      <div className="container">
        <header className="header">
          <Link href="/"><a className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PulseAI</span>
          </a></Link>
          <Link href="/"><a className="back-link">← All stories</a></Link>
        </header>

        <article className="article-shell">
          <div className="category-badge" style={{ marginBottom: '16px' }}>{article.category}</div>
          
          <h1 className="article-title">{article.title}</h1>
          
          <p className="meta" style={{ fontSize: '14px', marginBottom: '28px', color: 'var(--muted)' }}>
            Published by {article.source} · {new Date(article.pubDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {article.imageUrl && (
            <div style={{ 
              width: '100%', 
              maxHeight: '400px', 
              overflow: 'hidden', 
              borderRadius: '12px', 
              marginBottom: '32px',
              background: '#f1f5f9'
            }}>
              <img 
                src={article.imageUrl} 
                alt={article.title}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>
          )}

          {showPaywall ? (
            <div style={{
              background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '40px 32px',
              textAlign: 'center',
              marginTop: '24px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 12px 0', color: '#0a0a0a' }}>
                This story is part of the PulseAI archive
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#666', margin: '0 0 24px 0' }}>
                Free users get today's stories. Upgrade to <strong>PulseAI Pro</strong> to unlock the full archive, ad-free newsletters, and weekly Deep Dives.
              </p>
              <a 
                href="/#pricing"
                style={{
                  display: 'inline-block',
                  background: '#2563eb',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '16px'
                }}
              >
                Start 1-Month Free Trial →
              </a>
              <p style={{ fontSize: '13px', color: '#999', margin: '16px 0 0 0' }}>
                Or <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>read the original on {article.source} ↗</a>
              </p>
            </div>
          ) : (
            <>
              <div className="article-body" style={{ fontSize: '18px', lineHeight: '1.8', color: '#333' }}>
                <p>{excerpt || 'Read the full story at the source link below.'}</p>
              </div>

              <div style={{ 
                marginTop: '48px', 
                paddingTop: '24px', 
                borderTop: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                  PulseAI curates and summarizes. Read the full article at the original source.
                </p>
                <a
                  className="source-link"
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '14px 28px', fontSize: '16px' }}
                >
                  Read Full Article on {article.source} →
                </a>
              </div>
            </>
          )}
        </article>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/"><a className="back-link">← Back to all stories</a></Link>
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const articles = await fetchAllFeeds().catch(() => [])
  const paths = (articles.slice(0, 20) || []).map(a => ({ params: { slug: a.id } }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const slug = params.slug
  const articles = await fetchAllFeeds().catch(() => [])
  const article = (articles || []).find(a => a.id === slug) || null

  if (article) {
    return { props: { article }, revalidate: 1800 }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { data, error } = await supabase
      .from('pulse_takes')
      .select('*')
      .eq('article_id', slug)
      .single()

    if (data && !error) {
      return {
        props: {
          article: {
            title: data.article_title,
            link: data.article_link,
            content: 'This story is from a previous day\'s pulse. Click the link below to read the full article.',
            source: data.source,
            category: data.category,
            pubDate: data.generated_at,
            imageUrl: data.image_url || null,
          }
        },
        revalidate: 1800
      }
    }
  } catch (err) {
    console.warn('Supabase lookup failed:', err.message)
  }

  return { notFound: true, revalidate: 1800 }
}
