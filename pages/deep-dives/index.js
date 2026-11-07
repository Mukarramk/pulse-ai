import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default function DeepDivesIndex({ posts }) {
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
      } catch (e) {}
      setChecking(false)
    }
    checkPremium()
  }, [])

  return (
    <>
      <Head>
        <title>Deep Dives — PulseAI Pro</title>
        <meta name="description" content="In-depth analysis of AI and tech for professionals. Premium content." />
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
          <h1 className="intro-title">
            <span className="gradient-text">Deep Dives</span>
          </h1>
          <p className="intro-sub">
            Weekly in-depth analysis of the most important AI and tech stories. A PulseAI Pro exclusive.
          </p>
        </section>

        <div className="grid">
          {posts.map(post => (
            <article className="card" key={post.slug}>
              <div className="category-badge" style={{ background: '#fef3c7', color: '#d97706' }}>🔒 Premium</div>
              <h3 className="card-title">
                <Link href={`/deep-dives/${post.slug}`}><a>{post.title}</a></Link>
              </h3>
              <p className="meta">{post.date} · By {post.author}</p>
              <p className="summary">{post.excerpt}</p>
              <div className="card-footer">
                <Link href={`/deep-dives/${post.slug}`}><a className="read-more">Read →</a></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'posts', 'deep-dives')
  
  if (!fs.existsSync(postsDir)) {
    return { props: { posts: [] } }
  }
  
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

  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  return { props: { posts } }
}
