// lib/categorize.js
// Improved classifier with title weighting and negative keywords

const CATEGORY_KEYWORDS = {
  Models: [
    'model', 'gpt', 'claude', 'gemini', 'llama', 'mistral', 'qwen',
    'deepseek', 'llm', 'training', 'parameters', 'multimodal', 'inference',
    'open-source', 'open-weights', 'benchmark', 'dataset', 'fine-tune',
    'weights', 'reasoning', 'vision', 'audio model', 'embedding',
    'nemotron', 'anthropic model', 'openai model', 'frontier model'
  ],
  Tools: [
    'tool', 'api', 'sdk', 'framework', 'library', 'plugin', 'extension',
    'copilot', 'cursor', 'ide', 'integration', 'platform', 'developer',
    'app', 'software', 'update', 'feature', 'release', 'v2', 'v3',
    'workflow', 'automation', 'agent', 'chatbot', 'assistant',
    'homekit', 'device', 'hardware', 'gadget'
  ],
  Money: [
    'funding', 'raise', 'valuation', 'acquisition', 'acquire', 'ipo',
    'revenue', 'pricing', 'cost', 'billion', 'million', 'investment',
    'vc', 'startup', 'deal', 'profit', 'series a', 'series b', 'series c',
    'seed round', 'term sheet', 'exit', 'merger'
  ],
  Policy: [
    'regulation', 'policy', 'law', 'eu ai act', 'government', 'compliance',
    'privacy', 'dpdp', 'copyright', 'watermark', 'provenance',
    'safety', 'ban', 'senate', 'congress', 'ministry', 'parliament',
    'antitrust', 'lawsuit', 'court', 'ruling', 'senator', 'legislation'
  ]
}

// Negative keywords — if these appear, the story is probably NOT that category
const NEGATIVE_KEYWORDS = {
  Policy: ['game', 'nintendo', 'pikmin', 'mario', 'zelda', 'pokemon', 'playstation', 'xbox'],
  Money: ['game', 'nintendo', 'pikmin', 'mario'],
  Models: ['funding', 'raises', 'acquisition', 'ipo'],
  Tools: ['raises', 'acquires', 'funding round']
}

function scoreCategory(text, category) {
  let score = 0
  for (const kw of CATEGORY_KEYWORDS[category]) {
    if (text.includes(kw)) score += 1
  }
  return score
}

function categorize(title, content) {
  const titleText = (title || '').toLowerCase()
  const bodyText = (content || '').toLowerCase()
  
  const scores = { Models: 0, Tools: 0, Money: 0, Policy: 0 }

  for (const category of Object.keys(scores)) {
    const titleScore = scoreCategory(titleText, category) * 3
    const bodyScore = scoreCategory(bodyText, category)
    scores[category] = titleScore + bodyScore

    // Apply negative keywords
    if (NEGATIVE_KEYWORDS[category]) {
      for (const neg of NEGATIVE_KEYWORDS[category]) {
        if (titleText.includes(neg) || bodyText.includes(neg)) {
          scores[category] -= 5
        }
      }
    }
  }

  // Find highest score
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [topCategory, topScore] = entries[0]
  const [, secondScore] = entries[1]

  // If nothing matched well, default to Models
  if (topScore <= 0) return 'Models'

  // If tie or very close, prefer Models
  if (topScore - secondScore <= 1 && scores.Models > 0) return 'Models'

  return topCategory
}

module.exports = { categorize }
