const Parser = require('rss-parser')
const feeds = require('../data/feeds')
const { categorize } = require('./categorize')

const parser = new Parser({ timeout: 15000 })

function base64urlEncode(str) {
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return Buffer.from(s, 'base64').toString('utf8')
}

/**
 * Normalize a feed item into a consistent article object.
 * Returns null if the article should be skipped (blocklist).
 */
function normalizeItem(it, feedTitle) {
  // Blocklist: skip obvious consumer-gaming / non-tech stories
  const BLOCKLIST = ['pikmin', 'nintendo', 'mario', 'zelda', 'pokemon', 'playstation', 'xbox', 'fortnite', 'minecraft']
  const titleLower = (it.title || '').toLowerCase()
  for (const word of BLOCKLIST) {
    if (titleLower.includes(word)) {
      return null // Signal to skip this article
    }
  }

  const link = it.link || it.guid || null
  const content = it['content:encoded'] || it.content || it.contentSnippet || ''
  const pub = it.isoDate || it.pubDate || null

  // Try to find an image URL inside the content HTML
  let imageUrl = null

  if (content) {
    // 1. Look for ANY <img> tag, and grab whatever is in the src attribute
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1]
    }
    
    // 2. If no img tag, look for a WordPress-style srcset
    if (!imageUrl) {
      const wpMatch = content.match(/srcset=["']([^"']+)["']/i)
      if (wpMatch && wpMatch[1]) {
        // srcset often has multiple URLs like "url1 300w, url2 600w". Pick the first.
        imageUrl = wpMatch[1].split(' ')[0]
      }
    }
  }

  // 3. Final Fallback: Check the standard <enclosure> tag
  if (!imageUrl && it.enclosure && it.enclosure.url) {
    imageUrl = it.enclosure.url
  }

  return {
    id: link ? base64urlEncode(link) : null,
    title: it.title || 'Untitled',
    link,
    content,
    pubDate: pub ? new Date(pub).toISOString() : new Date().toISOString(),
    source: feedTitle || null,
    category: categorize(it.title, content),
    imageUrl: imageUrl || null,
    authors: it.creator ? [it.creator] : [],
    raw: it
  }
}

/**
 * Fetch and aggregate all configured feeds.
 */
async function fetchAllFeeds() {
  const items = []

  for (const feedCfg of feeds) {
    try {
      const feed = await parser.parseURL(feedCfg.url)
      const srcTitle = feed.title || feedCfg.title || (new URL(feedCfg.url)).hostname

      if (Array.isArray(feed.items)) {
        for (const it of feed.items) {
          const link = it.link || it.guid || null
          if (!link) continue
          const normalized = normalizeItem(it, srcTitle)
          // Skip blocklisted articles
          if (normalized) items.push(normalized)
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch feed ${feedCfg.url}: ${err && err.message ? err.message : err}`)
    }
  }

  // Deduplicate by original link, keeping the most recent pubDate
  const map = new Map()
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  for (const it of items) {
    if (!it.link) continue
    if (!map.has(it.link)) map.set(it.link, it)
  }

  return Array.from(map.values()).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
}

module.exports = { fetchAllFeeds, base64urlDecode, base64urlEncode }
