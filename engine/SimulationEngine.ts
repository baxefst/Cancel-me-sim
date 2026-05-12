import type { AnalysisResult, SimRound } from '@/types'
import type { PersonaNode } from '@/types'
import { PersonaState } from '@/state/PersonaState'
import { NetworkState } from '@/state/NetworkState'
import { TickManager } from './TickManager'
import {
  initializePersonaGoals,
  shouldTakeAction,
  setCooldown,
  updateEmotionalState,
} from '@/systems/PersonaSystem'

/**
 * SimulationEngine: The brain of the simulation
 *
 * Responsibilities:
 * - Manage persona state (not rendering)
 * - Run the tick loop
 * - Coordinate systems (goals, emotions, interactions)
 * - Emit state changes so React can render
 *
 * Does NOT:
 * - Touch D3
 * - Handle rendering
 * - Manage UI state
 *
 * Usage:
 *   const engine = new SimulationEngine(analysis)
 *   engine.initializeRound(1, d3Nodes, analysis)
 *
 *   in render loop:
 *     engine.tick(deltaMs)
 *     const personas = engine.getPersonas()  // read state for rendering
 */

export class SimulationEngine {
  /** Tick timer (frame-independent) */
  private tickManager: TickManager

  /** Current network state */
  private networkState: NetworkState

  /** AI analysis data */
  private analysis: AnalysisResult

  /** Callback when persona state changes (so React knows to update) */
  private onPersonaStateChange: (persona: PersonaState) => void = () => {}

  constructor(analysis: AnalysisResult) {
    this.analysis = analysis
    this.networkState = new NetworkState()
    this.tickManager = new TickManager(16) // 16ms = 60 ticks/sec
    this.networkState.analysis = analysis
  }

  /**
   * Initialize a new round with D3 nodes
   *
   * This bridges D3 nodes (rendering) with PersonaState (simulation)
   * Called once per round when new nodes are added
   */
  initializeRound(round: SimRound, nodes: PersonaNode[], analysis: AnalysisResult): void {
    this.networkState.currentRound = round
    this.networkState.analysis = analysis
    this.networkState.originalStatement = analysis.sentiment_vector ? 'statement' : ''

    // For each D3 node, create a corresponding PersonaState
    nodes.forEach((node) => {
      // Skip if we already have this persona (happens in later rounds)
      if (this.networkState.personas.has(node.id)) {
        return
      }

      // Create simulation state for this rendering node
      const personaState = new PersonaState(
        node.id,
        node.persona,
        node.handle,
        analysis.sentiment_vector ? 'statement' : '',
        analysis.sentiment_vector,
      )

      // Set goals based on type
      initializePersonaGoals(personaState)

      // Add to network
      this.networkState.addPersona(personaState)

      // Log creation
      this.networkState.recordEvent(node.id, 'state_change', {
        event: 'persona_created',
        round,
        persona: node.persona,
      })
    })
  }

  /**
   * Register callback for persona state changes
   * React components call this to know when to re-render
   */
  onStateChange(callback: (persona: PersonaState) => void): void {
    this.onPersonaStateChange = callback
  }

  /**
   * Main tick: called every frame
   *
   * Flow:
   * 1. Update tick manager with elapsed time
   * 2. If enough time accumulated, do a simulation tick
   * 3. Update all persona states
   * 4. Check for interactions
   * 5. Report changes to React
   */
  tick(deltaMs: number): void {
    // Update timer
    this.tickManager.update(deltaMs)

    // Only do simulation work if a tick is ready
    if (!this.tickManager.shouldTick()) {
      return
    }

    const nowMs = Date.now()

    // Update each persona
    this.networkState.personas.forEach((persona) => {
      // Update emotions based on context
      updateEmotionalState(persona, this.networkState, 16) // 16ms per tick

      // Check if persona should do something this tick
      if (shouldTakeAction(persona, nowMs)) {
        // For Phase 1a, we don't actually DO anything yet
        // Just mark that they could have
        setCooldown(persona, nowMs)

        // Real interactions come in Phase 1b
      }
    })

    // Consume the tick
    this.tickManager.consumeTick()
  }

  /**
   * Get all personas in current state
   * Used by React components to render
   */
  getPersonas(): PersonaState[] {
    return Array.from(this.networkState.personas.values())
  }

  /**
   * Get the global network state
   */
  getNetworkState(): NetworkState {
    return this.networkState
  }

  /**
   * Set current round (called by SimulationController)
   */
  setRound(round: SimRound): void {
    this.networkState.currentRound = round
  }

  /**
   * Get current round
   */
  getRound(): SimRound {
    return this.networkState.currentRound
  }

  /**
   * Total time elapsed in simulation
   */
  getElapsedMs(): number {
    return this.tickManager.elapsedMs()
  }

  /**
   * Reset everything (for new simulation)
   */
  reset(): void {
    this.networkState.reset()
    this.tickManager.reset()
  }
}
