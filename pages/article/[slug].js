import Head from 'next/head'
import Link from 'next/link'
import { fetchAllFeeds } from '../../lib/rss'

export default function ArticlePage({ article }) {
  if (!article) {
    return (
      <div className="container">
        <p>Article not found.</p>
        <p><Link href="/"><a className="back-link">← Back</a></Link></p>
      </div>
    )
  }

  const plainText = (article.content || '').replace(/(<([^>]+)>)/gi, '')
  const excerpt = plainText.length > 400 ? plainText.slice(0, 400) + '…' : plainText

  return (
    <>
      <Head>
        <title>{article.title} — Pulse AI</title>
        <meta name="description" content={article.title} />
      </Head>

      <div className="container">
        <header className="header" style={{ marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>{article.title}</h1>
            <div className="tagline">{article.source}</div>
          </div>
          <div>
            <Link href="/"><a className="back-link">← Home</a></Link>
          </div>
        </header>

        <article className="article-shell">
          <p className="meta">{new Date(article.pubDate).toLocaleString()} · {article.source}</p>

          <div className="article-body">
            <p>{excerpt || 'Read the full story at the source.'}</p>
          </div>

          <p><a className="source-link" href={article.link} target="_blank" rel="noopener noreferrer">Read on source →</a></p>
        </article>
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

  if (!article) {
    return { notFound: true, revalidate: 1800 }
  }

  return {
    props: { article },
    revalidate: 1800
  }
}
