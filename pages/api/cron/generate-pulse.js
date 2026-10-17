// pages/api/cron/generate-pulse.js

export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { fetchAllFeeds } from '../../../lib/rss';
import { rewriteArticle } from '../../../lib/gemini';

const CATEGORIES = ['Models', 'Tools', 'Money', 'Policy'];

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const articles = await fetchAllFeeds();
    const results = [];

    for (const cat of CATEGORIES) {
      const candidates = articles.filter(a => a.category === cat);
      
      if (candidates.length === 0) {
        results.push({ category: cat, status: 'no articles found' });
        continue;
      }

      const top = candidates[0];

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
    console.error('Cron error:', err);
    return res.status(500).json({ error: err.message });
  }
}
