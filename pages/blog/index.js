import Head from 'next/head'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default function BlogIndex({ posts }) {
  return (
    <>
      <Head>
        <title>Blog — PulseAI</title>
        <meta name="description" content="Original analysis on AI and Tech for Indian professionals." />
      </Head>
      <div className="container">
        <header className="header">
          <Link href="/"><a className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PulseAI</span>
          </a></Link>
          <Link href="/"><a className="back-link">← Home</a></Link>
        </header>

        <section className="intro">
          <h1 className="intro-title">The PulseAI Blog</h1>
          <p className="intro-sub">Original analysis on AI, tech, and the Indian market.</p>
        </section>

        <div className="grid">
          {posts.map(post => (
            <article className="card" key={post.slug}>
              <div className="category-badge">Article</div>
              <h3 className="card-title">
                <Link href={`/blog/${post.slug}`}><a>{post.title}</a></Link>
              </h3>
              <p className="meta">{post.date}</p>
              <p className="summary">{post.excerpt}</p>
              <div className="card-footer">
                <Link href={`/blog/${post.slug}`}><a className="read-more">Read →</a></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postsDir)
  
  const posts = filenames.map(filename => {
    const filePath = path.join(postsDir, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(fileContents)
    return {
      slug: filename.replace('.md', ''),
      ...data
    }
  })

  // Sort by date, newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  return { props: { posts } }
}
