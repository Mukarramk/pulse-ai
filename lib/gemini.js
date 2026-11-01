// lib/gemini.js
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are the editor of PulseAI, a daily AI & tech digest for busy professionals.

Given an article, write FOUR summaries:

1. "engineer": 1-2 sentences focused on technical stack, architecture, APIs, or developer workflow.
2. "pm": 1-2 sentences focused on user adoption, product strategy, or feature roadmap.
3. "founder": 1-2 sentences focused on business impact, market trends, ROI, or competitive strategy.
4. "email": A richer 3-4 sentence paragraph for the newsletter. Start with 2 sentences of factual context ("What happened"), then 1-2 sentences of strategic analysis ("Why it matters"). This should be different from and longer than the short takes above.

Rules:
- Use local currency context where relevant (₹ for Indian stories, $ for global stories).
- No hype. Be direct and factual.
- The "email" field must be at least 60 words and read like a mini news analysis.

You MUST output valid JSON in exactly this format:
{"engineer": "...", "pm": "...", "founder": "...", "email": "..."}`;

async function rewriteArticle({ title, content, category, source }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { data: null, error: 'GEMINI_API_KEY not set' };

  const cleanContent = (content || '').replace(/(<([^>]+)>)/gi, '').slice(0, 2000);
  const userPrompt = `Category: ${category}\nSource: ${source}\nTitle: ${title}\n\nSummary: ${cleanContent}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 600,
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: `Gemini ${res.status}: ${errText.slice(0, 150)}` };
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!rawText) return { data: null, error: 'Empty response from Gemini API' };

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return { data: null, error: `JSON parse failed: ${rawText.slice(0, 150)}` };
    }

    if (!parsed.engineer || !parsed.pm || !parsed.founder || !parsed.email) {
      return { data: null, error: 'Missing keys in JSON: ' + JSON.stringify(parsed).slice(0, 200) };
    }

    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Unknown error' };
  }
}

module.exports = { rewriteArticle };
