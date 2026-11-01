import { fetchAllFeeds } from '../lib/rss'

function generateSiteMap(articles) {
  const baseUrl = 'https://pulse-ai-tawny-psi.vercel.app'
  
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${baseUrl}</loc>
       <changefreq>hourly</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${baseUrl}/blog</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     ${articles
       .map((article) => {
         return `
       <url>
           <loc>${baseUrl}/article/${article.id}</loc>
           <changefreq>daily</changefreq>
           <priority>0.6</priority>
       </url>
     `
       })
       .join('')}
   </urlset>
 `
}

export default function SiteMap() {
  return null
}

export async function getServerSideProps({ res }) {
  const articles = await fetchAllFeeds().catch(() => [])
  
  const sitemap = generateSiteMap(articles.slice(0, 100))
  
  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
  res.write(sitemap)
  res.end()
  
  return { props: {} }
}
