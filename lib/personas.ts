import type {
  AnalysisResult,
  PersonaConfig,
  PersonaLink,
  PersonaNode,
  PersonaType,
  SimRound,
} from '@/types'

export const PERSONA_CONFIG: Record<PersonaType, PersonaConfig> = {
  Stan: { color: '#FF007A', baseRadius: 6, linkStrength: 1.0, linkDistance: 40, spawnRound: 1, behaviorType: 'cluster' },
  BotFarm: { color: '#00FF41', baseRadius: 5, linkStrength: 0.9, linkDistance: 35, spawnRound: 3, behaviorType: 'lattice' },
  Outraged: { color: '#FF4500', baseRadius: 8, linkStrength: -0.8, linkDistance: 100, spawnRound: 4, behaviorType: 'repulsion' },
  Journalist: { color: '#FBBF24', baseRadius: 7, linkStrength: 0.6, linkDistance: 80, spawnRound: 4, behaviorType: 'bridge' },
  Normie: { color: '#888888', baseRadius: 5, linkStrength: 0.3, linkDistance: 60, spawnRound: 1, behaviorType: 'drift' },
  CloutChaser: { color: '#A855F7', baseRadius: 6, linkStrength: 0.5, linkDistance: 55, spawnRound: 2, behaviorType: 'migrate' },
  ReplyGuy: { color: '#06B6D4', baseRadius: 5, linkStrength: 0.4, linkDistance: 45, spawnRound: 1, behaviorType: 'attach' },
  IronyPoisoned: { color: '#84CC16', baseRadius: 5, linkStrength: 0.2, linkDistance: 70, spawnRound: 2, behaviorType: 'random' },
  MainCharacter: { color: '#F97316', baseRadius: 10, linkStrength: 0.7, linkDistance: 50, spawnRound: 3, behaviorType: 'gravity' },
  RatioVulture: { color: '#EF4444', baseRadius: 6, linkStrength: 0.3, linkDistance: 65, spawnRound: 4, behaviorType: 'swarm' },
  TonePolice: { color: '#E2E8F0', baseRadius: 5, linkStrength: 0.4, linkDistance: 75, spawnRound: 3, behaviorType: 'intercept' },
  Contextualizer: { color: '#10B981', baseRadius: 7, linkStrength: 0.2, linkDistance: 90, spawnRound: 4, behaviorType: 'late' },
}

const ADJECTIVES = [
  'toxic', 'based', 'cursed', 'ratified', 'unhinged', 'deleted',
  'viral', 'cancelled', 'doomer', 'glazed', 'sigma', 'bitter',
  'cooked', 'salty', 'chronic', 'terminal', 'offline', 'stealth',
  'void', 'hollow', 'phantom', 'liminal', 'hyper', 'feral',
  'ethereal', 'spectral', 'rogue', 'static', 'glitch', 'neon',
  'pixel', 'digital', 'null', 'binary', 'proxy', 'ghost',
  'echo', 'cipher', 'burnt', 'fragmented',
]

const NOUNS = [
  'poster', 'account', 'node', 'signal', 'thread', 'reply',
  'ratio', 'take', 'moment', 'narrative', 'cluster', 'vector',
  'cascade', 'surge', 'wave', 'feed', 'scroll', 'drift', 'void',
  'pattern', 'entity', 'presence', 'agent', 'force', 'echo',
  'ghost', 'proxy', 'current', 'stream', 'nexus', 'vertex',
  'pulse', 'trace', 'spark', 'fragment', 'shard', 'loop',
  'flux', 'static', 'archive', 'broadcast',
]

export function generateHandle(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 99)
  return `@${adj}${noun}${num}`
}

const FALLBACK_COMMENTS: Record<PersonaType, string[]> = {
  Stan: [
    'I will not stand for this disrespect',
    'They could never',
    'My fave is literally flawless bye',
    'Not you coming for them with zero receipts',
    'The way I am SEETHING right now',
  ],
  BotFarm: [
    'Agree. Share this message.',
    'This is correct. Amplify.',
    'Consensus confirmed. Redistribute.',
    'Signal boosted. Comply.',
    'Verified. Continue spreading.',
  ],
  Outraged: [
    'I am literally shaking rn',
    'Delete this before they find it',
    'The audacity is sending me',
    'NOT okay. Not now. Not ever.',
    'I cannot believe we are still doing this',
  ],
  Journalist: [
    'This is important and here is why',
    'Thread incoming. Buckle up.',
    'Sources confirm what we already suspected',
    'The story writes itself honestly',
    'Off the record this is worse than it looks',
  ],
  Normie: [
    'idk seems fine to me',
    'can we please talk about something else',
    'I just saw this on my feed',
    'wait what happened',
    'this is a lot',
  ],
  CloutChaser: [
    'Not me inserting myself into this discourse',
    'The engagement on this tho',
    "I don't usually do this but",
    'Ratio incoming watch',
    'Everyone follow me I have thoughts',
  ],
  ReplyGuy: [
    'Well actually if you look at the data',
    "I've been saying this for years",
    'Hot take but hear me out',
    "This aged poorly and here's why",
    'Technically speaking however',
  ],
  IronyPoisoned: [
    'lmao whatever I guess',
    'this is so real for no reason',
    'crying at how cooked this is',
    'not me actually agreeing with this',
    "it's giving unhinged and I respect it",
  ],
  MainCharacter: [
    "This is literally about me and I'm fine",
    'I need everyone to know how this affected me',
    'My response thread is 47 parts long',
    'POV: you are me reading this',
    'The way this keeps finding me specifically',
  ],
  RatioVulture: [
    'ratio',
    'L',
    'L + ratio',
    'ratio + fell off',
    'L + ratio + nobody asked',
  ],
  TonePolice: [
    'This is why no one takes you seriously',
    'You could make this point without being mean',
    'The hostility is really unnecessary here',
    'I agree with you but not like this',
    'Maybe try leading with empathy next time',
  ],
  Contextualizer: [
    'Here is the full thread with receipts',
    'Nobody is talking about the actual backstory',
    'The archived version tells a different story',
    'I made a doc with all sources linked',
    'This started six months ago and here is how',
  ],
}

export function generateComment(persona: PersonaType, replies: string[]): string {
  if (replies.length > 0 && Math.random() < 0.6) {
    return replies[Math.floor(Math.random() * replies.length)]
  }
  const pool = FALLBACK_COMMENTS[persona]
  return pool[Math.floor(Math.random() * pool.length)]
}

function makeNode(
  persona: PersonaType,
  overrides: Partial<PersonaNode>,
  analysis: AnalysisResult,
  canvasW: number,
  canvasH: number,
): PersonaNode {
  const cfg = PERSONA_CONFIG[persona]
  const mass = 1 + Math.abs(analysis.sentiment_vector[2]) * 2

  return {
    id: crypto.randomUUID(),
    persona,
    handle: generateHandle(),
    comment: generateComment(persona, analysis.micro_replies as string[]),
    radius: cfg.baseRadius,
    color: cfg.color,
    mass,
    pulsePhase: Math.random() * Math.PI * 2,
    ringPhase: 0,
    dashRotation: 0,
    isHub: false,
    gridLocked: false,
    spawnTime: Date.now(),
    connectionCount: 0,
    allegiance: (Math.random() - 0.5) * 2,
    velocitySpikeTimer: Date.now() - Math.random() * 3000,
    x: canvasW / 2 + (Math.random() - 0.5) * 30,
    y: canvasH / 2 + (Math.random() - 0.5) * 30,
    vx: 0,
    vy: 0,
    ...overrides,
  }
}

function scaleCount(base: number, weight: number): number {
  return Math.max(1, Math.round(base * (0.5 + weight)))
}

export function generateNodes(
  round: SimRound,
  existing: PersonaNode[],
  analysis: AnalysisResult,
  canvasW: number,
  canvasH: number,
): PersonaNode[] {
  void existing
  const w = analysis.persona_weights
  const nodes: PersonaNode[] = []

  if (round === 1) {
    for (let i = 0; i < scaleCount(25, w.Normie); i += 1) nodes.push(makeNode('Normie', {}, analysis, canvasW, canvasH))
    for (let i = 0; i < scaleCount(15, w.Stan); i += 1) {
      nodes.push(
        makeNode(
          'Stan',
          {
            x: canvasW / 2 + (Math.random() - 0.5) * 60,
            y: canvasH / 2 + (Math.random() - 0.5) * 60,
          },
          analysis,
          canvasW,
          canvasH,
        ),
      )
    }
    for (let i = 0; i < scaleCount(5, w.ReplyGuy); i += 1) nodes.push(makeNode('ReplyGuy', {}, analysis, canvasW, canvasH))
  }

  if (round === 2) {
    for (let i = 0; i < scaleCount(10, w.Stan); i += 1) nodes.push(makeNode('Stan', {}, analysis, canvasW, canvasH))
    for (let i = 0; i < scaleCount(8, w.CloutChaser); i += 1) nodes.push(makeNode('CloutChaser', {}, analysis, canvasW, canvasH))
    for (let i = 0; i < scaleCount(5, w.IronyPoisoned); i += 1) nodes.push(makeNode('IronyPoisoned', {}, analysis, canvasW, canvasH))
  }

  if (round === 3) {
    const cols = 10
    const rows = 10
    const colSpacing = 35
    const rowSpacing = 25
    const gridW = (cols - 1) * colSpacing
    const gridH = (rows - 1) * rowSpacing
    const startX = (canvasW - gridW) / 2
    const startY = (canvasH - gridH) / 2

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        nodes.push(
          makeNode(
            'BotFarm',
            {
              x: startX + col * colSpacing,
              y: startY + row * rowSpacing,
              gridLocked: true,
              vx: 0,
              vy: 0,
            },
            analysis,
            canvasW,
            canvasH,
          ),
        )
      }
    }

    for (let i = 0; i < scaleCount(5, w.MainCharacter); i += 1) nodes.push(makeNode('MainCharacter', {}, analysis, canvasW, canvasH))
    for (let i = 0; i < scaleCount(5, w.TonePolice); i += 1) nodes.push(makeNode('TonePolice', {}, analysis, canvasW, canvasH))
  }

  if (round === 4) {
    nodes.push(
      makeNode(
        'Outraged',
        {
          isHub: true,
          radius: 18,
          x: canvasW / 2 + (Math.random() - 0.5) * 40,
          y: canvasH / 2 + (Math.random() - 0.5) * 40,
        },
        analysis,
        canvasW,
        canvasH,
      ),
    )

    for (let i = 0; i < Math.min(5, scaleCount(4, w.Outraged)); i += 1) {
      nodes.push(makeNode('Outraged', {}, analysis, canvasW, canvasH))
    }
    for (let i = 0; i < Math.min(3, scaleCount(2, w.Journalist)); i += 1) {
      nodes.push(makeNode('Journalist', {}, analysis, canvasW, canvasH))
    }
    for (let i = 0; i < Math.min(4, scaleCount(3, w.RatioVulture)); i += 1) {
      nodes.push(makeNode('RatioVulture', {}, analysis, canvasW, canvasH))
    }
    for (let i = 0; i < Math.min(3, scaleCount(2, w.Contextualizer)); i += 1) {
      nodes.push(makeNode('Contextualizer', {}, analysis, canvasW, canvasH))
    }
  }

  if (round === 5) {
    for (let i = 0; i < scaleCount(20, w.BotFarm); i += 1) nodes.push(makeNode('BotFarm', { gridLocked: false }, analysis, canvasW, canvasH))
    for (let i = 0; i < Math.min(4, scaleCount(3, w.Outraged)); i += 1) {
      nodes.push(makeNode('Outraged', {}, analysis, canvasW, canvasH))
    }
    for (let i = 0; i < scaleCount(5, w.CloutChaser); i += 1) nodes.push(makeNode('CloutChaser', {}, analysis, canvasW, canvasH))
  }

  return nodes
}

export function generateLinks(nodes: PersonaNode[]): PersonaLink[] {
  const links: PersonaLink[] = []

  const byPersona = (p: PersonaType) => nodes.filter((n) => n.persona === p)
  const stans = byPersona('Stan')
  const bots = byPersona('BotFarm')
  const outraged = byPersona('Outraged')
  const normies = byPersona('Normie')
  const journalists = byPersona('Journalist')

  stans.forEach((stan) => {
    stans
      .filter((s) => s.id !== stan.id)
      .forEach((other) => {
        links.push({
          id: crypto.randomUUID(),
          source: stan.id,
          target: other.id,
          strength: 1.0,
          color: '#FF007A88',
          isRepulsion: false,
          opacity: 0.5,
        })
      })
  })

  bots.forEach((bot, i) => {
    if (i + 1 < bots.length && (i + 1) % 10 !== 0) {
      links.push({
        id: crypto.randomUUID(),
        source: bot.id,
        target: bots[i + 1].id,
        strength: 0.9,
        color: '#00FF4199',
        isRepulsion: false,
        opacity: 0.7,
      })
    }
    if (i + 10 < bots.length) {
      links.push({
        id: crypto.randomUUID(),
        source: bot.id,
        target: bots[i + 10].id,
        strength: 0.9,
        color: '#00FF4199',
        isRepulsion: false,
        opacity: 0.7,
      })
    }
  })

  outraged.forEach((o) => {
    normies.forEach((n) => {
      links.push({
        id: crypto.randomUUID(),
        source: o.id,
        target: n.id,
        strength: -0.8,
        color: '#FF450033',
        isRepulsion: true,
        opacity: 0.15,
      })
    })
  })

  journalists.forEach((j) => {
    const targets = [...outraged.slice(0, 2), ...normies.slice(0, 2)]
    targets.forEach((t) => {
      links.push({
        id: crypto.randomUUID(),
        source: j.id,
        target: t.id,
        strength: 0.6,
        color: '#FBBF2466',
        isRepulsion: false,
        opacity: 0.35,
      })
    })
  })

  return links
}
