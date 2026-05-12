import type { PersonaType } from '@/types'

/**
 * PersonaState: What a persona knows, feels, and wants
 *
 * SEPARATE FROM rendering. This is pure simulation state.
 * D3 renders a PersonaNode. This is the brain behind that node.
 *
 * Why separate:
 * - Simulation logic doesn't depend on canvas/pixels
 * - Can test behavior without rendering
 * - Can change personality without touching animation code
 * - Can run headless (no UI needed)
 */

/** Simple representation of how a persona feels */
export interface EmotionalState {
  /** -1 (negative/angry) to 1 (positive/happy) */
  valence: number

  /** -1 (calm) to 1 (activated/energetic) */
  arousal: number

  /** -1 (submissive) to 1 (dominant/assertive) */
  dominance: number

  /** How strongly they believe what they're saying (0-1) */
  conviction: number
}

/** What a persona knows or has seen */
export interface PersonaMemory {
  /** Simple map: which other personas have they seen? */
  seenPersonas: Set<string>

  /** Trust level toward specific personas: -1 (distrust) to 1 (trust) */
  trustMap: Map<string, number>

  /** Original statement at round 1 */
  originalStatement: string

  /** How they're interpreting the narrative (one of: supportive, opposed, neutral, undecided) */
  narrativePosition: 'supportive' | 'opposed' | 'neutral' | 'undecided'

  /** Timestamp when this persona was created */
  createdAtMs: number
}

/** What a persona is trying to accomplish */
export interface PersonaGoals {
  /** Persona-specific primary motivation (examples: "amplify signal", "defend idol", "gain engagement") */
  primaryGoal: string

  /** How much this goal matters to them (0-1) */
  urgency: number

  /** Progress toward goal (0-1). Used for emergent behavior later. */
  progress: number
}

/**
 * PersonaState: The complete internal state of a persona
 *
 * This is what the simulation engine tracks and updates.
 * D3 reads this (indirectly through PersonaNode) to decide how to render.
 */
export class PersonaState {
  /** Unique ID matching the D3 node */
  readonly id: string

  /** Which type of persona (Stan, BotFarm, etc) */
  readonly persona: PersonaType

  /** Display name (@handle) */
  handle: string

  /** Current emotional state */
  emotionalState: EmotionalState

  /** What they know/remember */
  memory: PersonaMemory

  /** What they're trying to do */
  goals: PersonaGoals

  /** Last time they performed an action (used for cooldowns) */
  lastActionMs: number

  /** How long to wait before next action (ms) */
  cooldownMs: number

  constructor(
    id: string,
    persona: PersonaType,
    handle: string,
    statement: string,
    sentimentVector: [number, number, number, number, number],
  ) {
    this.id = id
    this.persona = persona
    this.handle = handle
    this.lastActionMs = Date.now()
    this.cooldownMs = 0

    // Initialize emotional state from AI sentiment vector
    // sentiment_vector: [valence, arousal, dominance, virality, toxicity]
    // We use first 3 for emotional state
    this.emotionalState = {
      valence: sentimentVector[0],
      arousal: sentimentVector[1],
      dominance: sentimentVector[2],
      conviction: 0.5, // neutral starting conviction
    }

    // Initialize memory
    this.memory = {
      seenPersonas: new Set(),
      trustMap: new Map(),
      originalStatement: statement,
      narrativePosition: 'neutral',
      createdAtMs: Date.now(),
    }

    // Initialize goals (persona-specific, set by PersonaSystem later)
    this.goals = {
      primaryGoal: 'exist',
      urgency: 0.5,
      progress: 0,
    }
  }

  /**
   * Update emotional state based on what happens around them
   * Called by SimulationEngine during each tick
   */
  updateEmotionalState(delta: Partial<EmotionalState>): void {
    if (delta.valence !== undefined) this.emotionalState.valence = delta.valence
    if (delta.arousal !== undefined) this.emotionalState.arousal = delta.arousal
    if (delta.dominance !== undefined) this.emotionalState.dominance = delta.dominance
    if (delta.conviction !== undefined) this.emotionalState.conviction = delta.conviction
  }

  /**
   * Remember another persona (increase trust slightly)
   */
  recordInteraction(otherPersonaId: string, trustDelta: number = 0.1): void {
    const currentTrust = this.memory.trustMap.get(otherPersonaId) ?? 0
    const newTrust = Math.max(-1, Math.min(1, currentTrust + trustDelta))
    this.memory.trustMap.set(otherPersonaId, newTrust)
    this.memory.seenPersonas.add(otherPersonaId)
  }

  /**
   * Check if enough time has passed to perform another action
   */
  canAct(nowMs: number): boolean {
    return nowMs - this.lastActionMs >= this.cooldownMs
  }

  /**
   * Record that we performed an action (starts cooldown)
   */
  recordAction(cooldownMs: number = 500, nowMs: number = Date.now()): void {
    this.lastActionMs = nowMs
    this.cooldownMs = cooldownMs
  }
}
