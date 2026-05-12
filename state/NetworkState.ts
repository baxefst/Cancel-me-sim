import type { AnalysisResult, PersonaType, SimRound } from '@/types'
import type { PersonaState } from './PersonaState'

/**
 * NetworkState: Global state of the entire social network
 *
 * Tracks:
 * - All personas and their state
 * - Relationships between them
 * - Event history for narrative reconstruction
 * - Current round
 *
 * Updated by SimulationEngine each tick
 * Read by components to render state
 */

/** Record of something that happened */
export interface NetworkEvent {
  id: string
  timestamp: number
  round: SimRound
  type: 'interaction' | 'state_change' | 'goal_update' | 'memory_update'
  sourcePersonaId: string
  targetPersonaId?: string
  details: Record<string, unknown>
}

export class NetworkState {
  /** All personas in the network (by ID) */
  personas: Map<string, PersonaState> = new Map()

  /** Trust relationships: personaId → (otherPersonaId → trustValue) */
  relationships: Map<string, Map<string, number>> = new Map()

  /** Timeline of events for debugging/narrative reconstruction */
  eventLog: NetworkEvent[] = []

  /** Original statement that triggered all this */
  originalStatement: string = ''

  /** AI analysis (sentiment, weights, etc) */
  analysis: AnalysisResult | null = null

  /** Current round (1-6) */
  currentRound: SimRound = 1

  /** When this simulation started */
  startedAtMs: number = Date.now()

  constructor() {}

  /**
   * Add a persona to the network
   */
  addPersona(state: PersonaState): void {
    this.personas.set(state.id, state)
    // Initialize their relationship map
    if (!this.relationships.has(state.id)) {
      this.relationships.set(state.id, new Map())
    }
  }

  /**
   * Record a relationship change
   */
  setRelationship(fromId: string, toId: string, trust: number): void {
    if (!this.relationships.has(fromId)) {
      this.relationships.set(fromId, new Map())
    }
    this.relationships.get(fromId)!.set(toId, trust)
  }

  /**
   * Get relationship trust level (default 0 if unknown)
   */
  getRelationship(fromId: string, toId: string): number {
    return this.relationships.get(fromId)?.get(toId) ?? 0
  }

  /**
   * Log an event
   */
  recordEvent(
    sourcePersonaId: string,
    type: NetworkEvent['type'],
    details: Record<string, unknown>,
    targetPersonaId?: string,
  ): void {
    const event: NetworkEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      round: this.currentRound,
      type,
      sourcePersonaId,
      targetPersonaId,
      details,
    }
    this.eventLog.push(event)
  }

  /**
   * Get all personas of a specific type
   */
  getPersonasByType(personaType: PersonaType): PersonaState[] {
    return Array.from(this.personas.values()).filter(
      (p) => p.persona === personaType,
    )
  }

  /**
   * Get total persona count
   */
  getTotalPersonas(): number {
    return this.personas.size
  }

  /**
   * Clear all state (for new simulation)
   */
  reset(): void {
    this.personas.clear()
    this.relationships.clear()
    this.eventLog = []
    this.originalStatement = ''
    this.analysis = null
    this.currentRound = 1
    this.startedAtMs = Date.now()
  }
}
