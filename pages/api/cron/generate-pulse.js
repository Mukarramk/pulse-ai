// pages/api/cron/generate-pulse.js

export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { fetchAllFeeds } from '../../../lib/rss';
import { rewriteArticle } from '../../../lib/gemini';

const CATEGORIES = ['Models', 'Tools', 'Money', 'Policy'];

export default async function handler(req, res) {
  try {
    // 1. Security Check
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Initialize Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Fetch articles
    const articles = await fetchAllFeeds();
    const results = [];

    // 4. Loop through categories
    for (const cat of CATEGORIES) {
      const candidates = articles.filter(a => a.category === cat);
      
      if (candidates.length === 0) {
        results.push({ category: cat, status: 'no articles found' });
        continue;
      }

      const top = candidates[0];

      // 5. Generate take
      const { text, error } = await rewriteArticle({
        title: top.title,
        content: top.content,
        category: cat,
        source: top.source
      });

      if (error || !text) {
        results.push({ category: cat, status: 'gemini failed', error: error || 'Empty response' });
        continue;
      }

      // 6. Save to Supabase
      const { error: dbError } = await supabase
        .from('pulse_takes')
        .upsert({
          category: cat,
          article_id: top.id,
          article_title: top.title,
          article_link: top.link,
          source: top.source,
          take: text,
          generated_at: new Date().toISOString()
        }, { onConflict: 'category' });

      if (dbError) {
        results.push({ category: cat, status: 'db error', error: dbError.message });
      } else {
        results.push({ category: cat, status: 'ok' });
      }
    }

    return res.status(200).json({ success: true, results });

  } catch (err) {
    // THIS will catch any import errors or crashes and show them to us
    console.error('Fatal Error:', err);
    return res.status(500).json({ 
      error: 'Server crashed', 
      message: err.message,
      stack: err.stack 
    });
  }
}
