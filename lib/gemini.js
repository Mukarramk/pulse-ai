// lib/gemini.js
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are the editor of PulseAI, a daily AI & tech digest for Indian professionals.
Given an article, write THREE short summaries (1-2 sentences each), tailored to different roles.
Rules:
- engineer: Focus on technical stack, architecture, APIs, or developer workflow.
- pm: Focus on user adoption, product strategy, or feature roadmap.
- founder: Focus on business impact, market trends, ROI, or competitive strategy.
- Use rupees (₹) if pricing is mentioned.
- No hype. Be direct.
You MUST output valid JSON in exactly this format:
{"engineer": "...", "pm": "...", "founder": "..."}`;

async function rewriteArticle({ title, content, category, source }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { data: null, error: 'GEMINI_API_KEY not set' };

  const cleanContent = (content || '').replace(/(<([^>]+)>)/gi, '').slice(0, 1500);
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
          maxOutputTokens: 400,
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

    if (!parsed.engineer || !parsed.pm || !parsed.founder) {
      return { data: null, error: 'Missing keys in JSON: ' + JSON.stringify(parsed) };
    }

    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Unknown error' };
  }
}

module.exports = { rewriteArticle };
