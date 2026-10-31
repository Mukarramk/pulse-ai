// v3 - newsletter trigger
export default async function handler(req, res) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const { fetchAllFeeds } = require('../../../lib/rss');
    const { rewriteArticle } = require('../../../lib/gemini');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const articles = await fetchAllFeeds();
    const results = [];
    const CATEGORIES = ['Models', 'Tools', 'Money', 'Policy'];

    for (const cat of CATEGORIES) {
      const candidates = articles.filter(a => a.category === cat);
      
      if (candidates.length === 0) {
        results.push({ category: cat, status: 'no articles found' });
        continue;
      }

      const top = candidates[0];

      const { data, error } = await rewriteArticle({
        title: top.title,
        content: top.content,
        category: cat,
        source: top.source
      });

      if (error || !data) {
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
          take: data.engineer,
          take_engineer: data.engineer,
          take_pm: data.pm,
          take_founder: data.founder,
          image_url: top.imageUrl || null,
          generated_at: new Date().toISOString()
        }, { onConflict: 'category' });

      if (dbError) {
        results.push({ category: cat, status: 'db error', error: dbError.message });
      } else {
        results.push({ category: cat, status: 'ok' });
      }
    }

    // Automatically trigger the newsletter after the pulse updates
    try {
      await fetch('https://pulse-ai-tawny-psi.vercel.app/api/send-newsletter')
      results.push({ step: 'newsletter', status: 'triggered' })
    } catch (newsletterErr) {
      results.push({ step: 'newsletter', status: 'failed', error: newsletterErr.message })
    }

    return res.status(200).json({ success: true, results });

  } catch (err) {
    return res.status(500).json({ 
      error: 'Server crashed', 
      message: err.message
    });
  }
}
