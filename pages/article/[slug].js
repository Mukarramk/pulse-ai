import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { fetchAllFeeds } from '../../lib/rss'

export default function ArticlePage({ article, take }) {
  if (!article) {
    return (
      <div className="container">
        <p>Article not found.</p>
        <p><Link href="/"><a className="back-link">← Back to PulseAI</a></Link></p>
      </div>
    )
  }

  const plainText = (article.content || '').replace(/(<([^>]+)>)/gi, '')
  const excerpt = plainText.length > 600 ? plainText.slice(0, 600) + '…' : plainText

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

          {take && (
            <div style={{
              background: '#f8fafc',
              borderLeft: '4px solid #2563eb',
              padding: '20px 24px',
              borderRadius: '8px',
              marginBottom: '32px'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#2563eb',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
                Why it matters
              </div>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#333', margin: 0, fontWeight: 500 }}>
                {take}
              </p>
            </div>
          )}

          {!take && (
            <div className="article-body" style={{ fontSize: '18px', lineHeight: '1.8', color: '#333' }}>
              <p>{excerpt || 'Read the full story at the source link below.'}</p>
            </div>
          )}

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
  
  // 1. Try to find the article in the live RSS feed
  const articles = await fetchAllFeeds().catch(() => [])
  const article = (articles || []).find(a => a.id === slug) || null

  if (article) {
    let take = null
    let imageUrl = article.imageUrl
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      const { data } = await supabase
        .from('pulse_takes')
        .select('take_engineer, take_pm, take_founder, image_url')
        .eq('article_id', article.id)
        .single()
      if (data) {
        take = data.take_engineer || data.take_pm || data.take_founder
        if (data.image_url) imageUrl = data.image_url
      }
    } catch (e) {}

    return { 
      props: { article: { ...article, imageUrl }, take },
      revalidate: 1800 
    }
  }

  // 2. If not found in RSS, check Supabase for the saved Pulse take
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
          },
          take: data.take_engineer || data.take_pm || data.take_founder || null
        },
        revalidate: 1800
      }
    }
  } catch (err) {
    console.warn('Supabase lookup failed:', err.message)
  }

  return { notFound: true, revalidate: 1800 }
}
