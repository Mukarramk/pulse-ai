import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'

export default function DeepDive({ frontmatter, content }) {
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

  const showPaywall = !isPremium && !checking

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
          <Link href="/deep-dives"><a className="back-link">← All Deep Dives</a></Link>
        </header>

        <article className="article-shell">
          <div className="category-badge" style={{ marginBottom: '16px', background: '#fef3c7', color: '#d97706' }}>🔒 Deep Dive · Premium</div>
          
          <h1 className="article-title">{frontmatter.title}</h1>
          
          <p className="meta" style={{ fontSize: '14px', marginBottom: '28px', color: 'var(--muted)' }}>
            {frontmatter.date} · By {frontmatter.author}
          </p>

          <div style={{ fontSize: '17px', lineHeight: '1.7', color: '#444', marginBottom: '32px', fontStyle: 'italic' }}>
            {frontmatter.excerpt}
          </div>

          {showPaywall ? (
            <div style={{
              background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              marginTop: '32px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px 0', color: '#0a0a0a' }}>
                This is a PulseAI Pro Deep Dive
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#666', margin: '0 0 28px 0', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                Weekly deep analysis of the biggest AI and tech stories — for founders, engineers, and PMs who need to understand what's really happening.
              </p>
              <a 
                href="/#pricing"
                style={{
                  display: 'inline-block',
                  background: '#2563eb',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '16px'
                }}
              >
                Start 1-Month Free Trial →
              </a>
              <p style={{ fontSize: '13px', color: '#999', margin: '16px 0 0 0' }}>
                Ad-free newsletter · Full archive · Weekly Deep Dives
              </p>
            </div>
          ) : (
            <div className="article-body">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const postsDir = path.join(process.cwd(), 'posts', 'deep-dives')
  if (!fs.existsSync(postsDir)) {
    return { paths: [], fallback: 'blocking' }
  }
  const filenames = fs.readdirSync(postsDir)
  const paths = filenames.map(filename => ({
    params: { slug: filename.replace('.md', '') }
  }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'posts', 'deep-dives', `${params.slug}.md`)
  
  if (!fs.existsSync(filePath)) {
    return { notFound: true }
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    props: {
      frontmatter: data,
      content
    }
  }
}
