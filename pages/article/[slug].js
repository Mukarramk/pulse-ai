import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { fetchAllFeeds } from '../../lib/rss'

export default function ArticlePage({ article }) {
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
    return { 
      props: { article },
      revalidate: 1800 
    }
  }

  // 2. If not found in RSS, check Supabase for the saved Pulse take
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
