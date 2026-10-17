const Parser = require('rss-parser')
const feeds = require('../data/feeds')
const { categorize } = require('./categorize')

const parser = new Parser({
  timeout: 15000,
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }]
    ]
  }
})

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
 */
function normalizeItem(it, feedTitle) {
  const link = it.link || it.guid || null
  const content = it['content:encoded'] || it.content || it.contentSnippet || ''
  const pub = it.isoDate || it.pubDate || null

  // Try to find an image URL in multiple common places
  let imageUrl = null

  // 1. Check media:content (now parsed as mediaContent)
  if (it.mediaContent) {
    // Sometimes it's an array, sometimes it's an object
    const mediaArray = Array.isArray(it.mediaContent) ? it.mediaContent : [it.mediaContent]
    
    for (const media of mediaArray) {
      // Check for the $.url format (standard XML)
      if (media.$ && media.$.url) {
        imageUrl = media.$.url
        break
      }
      // Check for the direct .url format (sometimes rss-parser flattens it)
      if (media.url) {
        imageUrl = media.url
        break
      }
    }
  }
  
  // 2. Check standard <enclosure> tag
  if (!imageUrl && it.enclosure && it.enclosure.url) {
    imageUrl = it.enclosure.url
  }
  
  // 3. Check for an <img> tag inside the content HTML
  if (!imageUrl && content) {
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/)
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1]
    }
  }

  // Debug: Log the first item to see what's actually in the feed
  if (feedTitle && feedTitle.includes('TechCrunch')) {
    console.log('TechCrunch Item Keys:', Object.keys(it))
    console.log('mediaContent:', it.mediaContent)
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
          items.push(normalized)
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
