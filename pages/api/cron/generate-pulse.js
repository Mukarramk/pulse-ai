// v6 - split by category to avoid Vercel timeout
export default async function handler(req, res) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const { fetchAllFeeds } = require('../../../lib/rss');
    const { rewriteArticle } = require('../../../lib/gemini');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read the category from the URL (e.g., ?category=Models)
    // If none is provided, default to "Models"
    const targetCategory = req.query.category || 'Models';
    const CATEGORIES = ['Models', 'Tools', 'Money', 'Policy'];

    if (!CATEGORIES.includes(targetCategory)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const articles = await fetchAllFeeds();
    const candidates = articles.filter(a => a.category === targetCategory);

    if (candidates.length === 0) {
      return res.status(200).json({ category: targetCategory, status: 'no articles found' });
    }

    const top = candidates[0];

    const { data, error } = await rewriteArticle({
      title: top.title,
      content: top.content,
      category: targetCategory,
      source: top.source
    });

    if (error || !data) {
      return res.status(500).json({ category: targetCategory, status: 'gemini failed', error });
    }

    const { error: dbError } = await supabase
      .from('pulse_takes')
      .upsert({
        category: targetCategory,
        article_id: top.id,
        article_title: top.title,
        article_link: top.link,
        source: top.source,
        take: data.engineer,
        take_engineer: data.engineer,
        take_pm: data.pm,
        take_founder: data.founder,
        take_email: data.email,
        image_url: top.imageUrl || null,
        generated_at: new Date().toISOString()
      }, { onConflict: 'category' });

    if (dbError) {
      return res.status(500).json({ category: targetCategory, status: 'db error', error: dbError.message });
    }

    return res.status(200).json({ category: targetCategory, status: 'ok' });

  } catch (err) {
    return res.status(500).json({ 
      error: 'Server crashed', 
      message: err.message
    });
  }
}
