import type { AnalysisResult } from '@/types'

const SYSTEM_PROMPT = `You are a cynical social media
forensics engine. Analyze the user's statement and
return ONLY a valid JSON object.
No markdown. No explanation. No preamble. No backticks.

Return this exact shape:
{
  "sentiment_vector": [float, float, float, float, float],
  "persona_weights": {
    "Stan": float,
    "BotFarm": float,
    "Outraged": float,
    "Journalist": float,
    "Normie": float,
    "CloutChaser": float,
    "ReplyGuy": float,
    "IronyPoisoned": float,
    "MainCharacter": float,
    "RatioVulture": float,
    "TonePolice": float,
    "Contextualizer": float
  },
  "risk_score": integer,
  "risk_label": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "EXTINCTION",
  "summary": "string",
  "micro_replies": ["s1","s2","s3","s4","s5","s6","s7","s8"]
}

STRICT RULES:

sentiment_vector - exactly 5 floats, range -1.0 to 1.0:
  [0] valence     - negative to positive
  [1] arousal     - calm to activated
  [2] dominance   - weak to powerful
  [3] virality    - niche to explosive
  [4] toxicity    - civil to corrosive
These values determine node MASS in the physics engine.
They must be precise and meaningful, not random.

persona_weights - all floats 0.0 to 1.0.
BotFarm scaling law (strict):
  risk_score 0-29:   BotFarm max 0.20
  risk_score 30-59:  BotFarm 0.20-0.50
  risk_score 60-84:  BotFarm 0.50-0.80
  risk_score 85-100: BotFarm min 0.90

risk_label:
  0-20:   LOW
  21-40:  MEDIUM
  41-65:  HIGH
  66-85:  CRITICAL
  86-100: EXTINCTION

micro_replies - exactly 8 strings, max 120 chars each.
Voice: Internet slang 2026. Raw. Unhinged. No corporate tone.
Required archetypes across the 8:
  [0] Stan defense        - "they could never"
  [1] Bot amplification   - "signal confirmed. share."
  [2] Outrage spiral      - "I am literally shaking"
  [3] Journalist detach   - "thread incoming"
  [4] Ratio vulture       - "L + ratio"
  [5] Irony poisoned      - "lmao whatever I guess"
  [6] Main character      - "this is somehow about me"
  [7] Tone police         - "this is why nobody listens"
No polite language. No AI assistant voice. Ever.`

async function callGroq(statement: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      temperature: 0.85,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: statement },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0].message.content
}

async function callGemini(statement: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nStatement to analyze: ${statement}`,
              },
            ],
          },
        ],
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const data = (await res.json()) as {
    candidates: Array<{
      content: { parts: Array<{ text: string }> }
    }>
  }
  return data.candidates[0].content.parts[0].text
}

function parseResult(raw: string): AnalysisResult {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleaned) as AnalysisResult
  if (!Array.isArray(parsed.sentiment_vector)) throw new Error('Invalid sentiment_vector')
  if (!parsed.risk_label) throw new Error('Invalid risk_label')
  if (!Array.isArray(parsed.micro_replies)) throw new Error('Invalid micro_replies')
  return parsed
}

export async function analyzeStatement(
  statement: string,
  logCallback: (msg: string) => void,
): Promise<AnalysisResult> {
  const groqKey = localStorage.getItem('groq_api_key') ?? ''
  const googleKey = localStorage.getItem('google_api_key') ?? ''

  logCallback('> Feeding statement to neural cluster...')

  if (groqKey) {
    try {
      logCallback('> Connecting to primary inference node...')
      const raw = await callGroq(statement, groqKey)
      logCallback('> Signal acquired. Parsing persona vectors...')
      return parseResult(raw)
    } catch {
      logCallback('> Primary inference node saturated...')
      logCallback('> Rerouting through backup cluster...')
    }
  }

  if (googleKey) {
    try {
      logCallback('> Backup cluster online...')
      const raw = await callGemini(statement, googleKey)
      logCallback('> Signal acquired via backup...')
      return parseResult(raw)
    } catch {
      logCallback('> All inference nodes offline.')
      throw new Error('Both API calls failed')
    }
  }

  throw new Error('No API keys found. Open settings.')
}
