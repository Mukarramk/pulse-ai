// lib/gemini.js
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are the editor of PulseAI, a daily AI & tech digest for Indian developers and founders.
Rewrite the given article in 1-2 sentences. Focus on why it matters for an Indian tech professional. Use rupees (₹) if pricing is mentioned. Output ONLY the rewritten text.`;

async function rewriteArticle({ title, content, category, source }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { text: null, error: 'GEMINI_API_KEY not set' };

  const cleanContent = (content || '').replace(/(<([^>]+)>)/gi, '').slice(0, 1500);
  const userPrompt = `Category: ${category}\nSource: ${source}\nTitle: ${title}\n\nSummary: ${cleanContent}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 200 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { text: null, error: `Gemini ${res.status}: ${errText.slice(0, 100)}` };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    return { text, error: null };
  } catch (err) {
    return { text: null, error: err.message || 'Unknown error' };
  }
}

module.exports = { rewriteArticle };
