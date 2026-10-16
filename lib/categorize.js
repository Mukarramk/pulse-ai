// Simple keyword-based categorizer for PulseAI
// Assigns each article to one of: Models, Tools, Money, Policy

const CATEGORY_KEYWORDS = {
  Models: [
    'model', 'gpt', 'claude', 'gemini', 'llama', 'mistral', 'qwen',
    'deepseek', 'release', 'weights', 'benchmark', 'training',
    'parameters', 'multimodal', 'frontier', 'inference'
  ],
  Tools: [
    'tool', 'api', 'sdk', 'framework', 'agent', 'codex', 'copilot',
    'cursor', 'ide', 'plugin', 'integration', 'library', 'platform',
    'developer', 'workflow', 'automation'
  ],
  Money: [
    'funding', 'raise', 'valuation', 'acquisition', 'acquire', 'ipo',
    'revenue', 'pricing', 'cost', 'billion', 'million', 'investment',
    'vc', 'startup', 'deal', 'profit'
  ],
  Policy: [
    'regulation', 'policy', 'law', 'eu', 'government', 'compliance',
    'privacy', 'dpdp', 'ai act', 'watermark', 'provenance', 'copyright',
    'safety', 'ban', 'senate', 'congress', 'india', 'ministry'
  ]
}

function categorize(title, content) {
  const text = `${title || ''} ${content || ''}`.toLowerCase()
  const scores = { Models: 0, Tools: 0, Money: 0, Policy: 0 }

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) scores[cat]++
    }
  }

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return top[1] > 0 ? top[0] : 'Models' // default bucket
}

module.exports = { categorize }
