import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3'

export type PersonaType =
  | 'Stan'
  | 'BotFarm'
  | 'Outraged'
  | 'Journalist'
  | 'Normie'
  | 'CloutChaser'
  | 'ReplyGuy'
  | 'IronyPoisoned'
  | 'MainCharacter'
  | 'RatioVulture'
  | 'TonePolice'
  | 'Contextualizer'

export interface PersonaNode extends SimulationNodeDatum {
  id: string
  persona: PersonaType
  handle: string
  comment: string
  radius: number
  color: string
  mass: number
  pulsePhase: number
  ringPhase: number
  dashRotation: number
  isHub: boolean
  gridLocked: boolean
  spawnTime: number
  connectionCount: number
  allegiance: number
  velocitySpikeTimer: number
}

export interface PersonaLink extends SimulationLinkDatum<PersonaNode> {
  id: string
  strength: number
  color: string
  isRepulsion: boolean
  opacity: number
}

export interface AnalysisResult {
  sentiment_vector: [number, number, number, number, number]
  persona_weights: {
    Stan: number
    BotFarm: number
    Outraged: number
    Journalist: number
    Normie: number
    CloutChaser: number
    ReplyGuy: number
    IronyPoisoned: number
    MainCharacter: number
    RatioVulture: number
    TonePolice: number
    Contextualizer: number
  }
  risk_score: number
  risk_label: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTINCTION'
  summary: string
  micro_replies: [string, string, string, string, string, string, string, string]
}

export type SimRound = 1 | 2 | 3 | 4 | 5 | 6
export type AppState = 'idle' | 'analyzing' | 'simulating' | 'report'

export interface TooltipState {
  visible: boolean
  x: number
  y: number
  node: PersonaNode | null
}

export interface LogMessage {
  id: string
  text: string
  timestamp: number
}

export interface RingEffect {
  nodeId: string
  radius: number
  alpha: number
  startTime: number
}

export interface SimulationRefs {
  addNodes: (nodes: PersonaNode[]) => void
  addLinks: (links: PersonaLink[]) => void
  getLinks: () => PersonaLink[]
  getNodes: () => PersonaNode[]
  setRound: (round: SimRound) => void
  reheatAlpha: (value: number) => void
  stopSimulation: () => void
  applyGreyscale: () => void
}

export interface PersonaConfig {
  color: string
  baseRadius: number
  linkStrength: number
  linkDistance: number
  spawnRound: number
  behaviorType: string
}
