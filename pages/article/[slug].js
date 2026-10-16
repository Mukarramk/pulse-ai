import Head from 'next/head'
import Link from 'next/link'
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
  const excerpt = plainText.length > 500 ? plainText.slice(0, 500) + '…' : plainText

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
          <div className="category-badge">{article.category}</div>
          <h1 className="article-title">{article.title}</h1>
          <p className="meta">
            {new Date(article.pubDate).toLocaleString()} · {article.source}
          </p>

          <div className="article-body">
            <p>{excerpt || 'Read the full story at the source.'}</p>
          </div>

          <a
            className="source-link"
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read full story on {article.source} →
          </a>
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
