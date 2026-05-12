import type { PersonaType } from '@/types'
import type { PersonaState } from '@/state/PersonaState'
import type { NetworkState } from '@/state/NetworkState'

/**
 * PersonaSystem: Behavior rules for each persona type
 *
 * Handles:
 * - Goal assignment based on type
 * - Emotional state updates based on context
 * - Simple persona-specific behaviors
 *
 * This is a pure utility module—no side effects beyond what it returns
 */

/**
 * Set persona-specific goals based on their type
 * Called once when persona is created
 */
export function initializePersonaGoals(persona: PersonaState): void {
  const goals = getGoalsForType(persona.persona)
  persona.goals = goals
}

/**
 * Return goals appropriate for each persona type
 */
function getGoalsForType(
  personaType: PersonaType,
): PersonaState['goals'] {
  switch (personaType) {
    case 'Stan':
      return {
        primaryGoal: 'defend_idol_and_cluster',
        urgency: 0.9,
        progress: 0,
      }
    case 'BotFarm':
      return {
        primaryGoal: 'amplify_signal_maximize_reach',
        urgency: 0.95,
        progress: 0,
      }
    case 'Outraged':
      return {
        primaryGoal: 'intensify_emotional_cascade',
        urgency: 0.85,
        progress: 0,
      }
    case 'Journalist':
      return {
        primaryGoal: 'gather_and_synthesize_narrative',
        urgency: 0.6,
        progress: 0,
      }
    case 'Normie':
      return {
        primaryGoal: 'maintain_equilibrium_avoid_conflict',
        urgency: 0.3,
        progress: 0,
      }
    case 'CloutChaser':
      return {
        primaryGoal: 'maximize_engagement_and_visibility',
        urgency: 0.8,
        progress: 0,
      }
    case 'ReplyGuy':
      return {
        primaryGoal: 'respond_to_everything_gain_visibility',
        urgency: 0.7,
        progress: 0,
      }
    case 'IronyPoisoned':
      return {
        primaryGoal: 'inject_chaos_undermine_seriousness',
        urgency: 0.6,
        progress: 0,
      }
    case 'MainCharacter':
      return {
        primaryGoal: 'center_discourse_on_self',
        urgency: 0.9,
        progress: 0,
      }
    case 'RatioVulture':
      return {
        primaryGoal: 'identify_losing_positions_deliver_ratio',
        urgency: 0.7,
        progress: 0,
      }
    case 'TonePolice':
      return {
        primaryGoal: 'moderate_discourse_police_emotion',
        urgency: 0.5,
        progress: 0,
      }
    case 'Contextualizer':
      return {
        primaryGoal: 'provide_receipts_synthesize_background',
        urgency: 0.4,
        progress: 0,
      }
  }
}

/**
 * Update a persona's emotional state based on interactions with others
 *
 * Called during engine tick when personas interact
 * This is intentionally simple—just basic emotional rules
 */
export function updateEmotionalState(
  persona: PersonaState,
  networkState: NetworkState,
  deltaMs: number,
): void {
  // Skip the actual updates for Phase 1a
  // This is just the structure. Real logic comes in Phase 1b when we add memory.
  void persona
  void networkState
  void deltaMs
}

/**
 * Determine if a persona should take an action this tick
 * Based on their cooldown and persona type
 */
export function shouldTakeAction(
  persona: PersonaState,
  nowMs: number,
): boolean {
  // Can act if cooldown expired
  if (!persona.canAct(nowMs)) {
    return false
  }

  // Faster personas act more often
  const actionFrequency = getActionFrequency(persona.persona)
  const randomChance = Math.random() < actionFrequency
  return randomChance
}

/**
 * How often should each persona type try to take an action?
 * Higher = more frequently
 */
function getActionFrequency(personaType: PersonaType): number {
  switch (personaType) {
    case 'BotFarm':
      return 0.9 // Very frequently
    case 'ReplyGuy':
      return 0.8
    case 'Outraged':
      return 0.75
    case 'CloutChaser':
      return 0.6
    case 'MainCharacter':
      return 0.6
    case 'Stan':
      return 0.5
    case 'IronyPoisoned':
      return 0.5
    case 'RatioVulture':
      return 0.4
    case 'Journalist':
      return 0.3
    case 'TonePolice':
      return 0.3
    case 'Contextualizer':
      return 0.2
    case 'Normie':
      return 0.1 // Rarely acts
  }
}

/**
 * Set a cooldown after persona takes an action
 * Different types have different cooldowns
 */
export function setCooldown(persona: PersonaState, nowMs: number): void {
  const cooldownMs = getCooldownMs(persona.persona)
  persona.recordAction(cooldownMs, nowMs)
}

/**
 * How long should each persona wait before acting again? (ms)
 */
function getCooldownMs(personaType: PersonaType): number {
  switch (personaType) {
    case 'BotFarm':
      return 200 // Can act frequently
    case 'ReplyGuy':
      return 300
    case 'Outraged':
      return 400
    case 'Stan':
      return 500
    case 'CloutChaser':
      return 600
    case 'MainCharacter':
      return 700
    case 'IronyPoisoned':
      return 800
    case 'RatioVulture':
      return 1000
    case 'Journalist':
      return 1500
    case 'TonePolice':
      return 1200
    case 'Contextualizer':
      return 2000
    case 'Normie':
      return 3000 // Rarely acts
  }
}
