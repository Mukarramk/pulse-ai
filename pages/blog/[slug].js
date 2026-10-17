import Head from 'next/head'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'

export default function BlogPost({ frontmatter, content }) {
  return (
    <>
      <Head>
        <title>{frontmatter.title} — PulseAI</title>
        <meta name="description" content={frontmatter.excerpt} />
      </Head>
      <div className="container">
        <header className="header">
          <Link href="/"><a className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PulseAI</span>
          </a></Link>
          <Link href="/blog"><a className="back-link">← All Articles</a></Link>
        </header>

        <article className="article-shell">
          <div className="category-badge" style={{ marginBottom: '16px' }}>Original Article</div>
          <h1 className="article-title">{frontmatter.title}</h1>
          <p className="meta" style={{ fontSize: '14px', marginBottom: '24px' }}>
            {frontmatter.date} · By {frontmatter.author}
          </p>
          <div className="article-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const postsDir = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postsDir)
  const paths = filenames.map(filename => ({
    params: { slug: filename.replace('.md', '') }
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'posts', `${params.slug}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    props: {
      frontmatter: data,
      content
    }
  }
}
