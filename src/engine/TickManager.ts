// src/engine/TickManager.ts

/**
 * TickManager: Frame-independent timing for simulation
 *
 * Why it exists:
 * - D3 physics depends on requestAnimationFrame, which varies by monitor (60fps, 144fps, etc)
 * - This makes simulation frame-dependent and non-portable
 * - TickManager provides a fixed-rate clock independent of render speed
 *
 * Result: Same simulation on any monitor. Easy to test. Deterministic.
 *
 * Usage:
 *   const tm = new TickManager(16) // 16ms per tick = 60 ticks/sec
 *   tm.update(deltaTime)           // call every frame with elapsed ms
 *   if (tm.shouldTick()) {
 *     simulationEngine.tick()      // runs at fixed rate
 *   }
 *   const elapsed = tm.elapsedMs() // total time since start
 */

export class TickManager {
  /** Milliseconds per tick. 16ms = 60 ticks/sec, 33ms = 30 ticks/sec */
  private readonly tickDurationMs: number

  /** Accumulated time since last tick */
  private accumulatorMs: number = 0

  /** Total elapsed time since construction */
  private totalElapsedMs: number = 0

  /** How many ticks have occurred */
  private tickCount: number = 0

  constructor(tickDurationMs: number = 16) {
    this.tickDurationMs = tickDurationMs
  }

  /**
   * Call this every frame with the actual elapsed time since last frame
   * @param deltaMs - Milliseconds elapsed since last frame (from requestAnimationFrame)
   */
  update(deltaMs: number): void {
    this.accumulatorMs += deltaMs
    this.totalElapsedMs += deltaMs
  }

  /**
   * Returns true if enough time has accumulated for a tick
   * Called by engine to decide whether to update simulation
   */
  shouldTick(): boolean {
    return this.accumulatorMs >= this.tickDurationMs
  }

  /**
   * Consumes one tick worth of accumulated time
   * Call this after shouldTick() returns true and you've done a tick
   */
  consumeTick(): void {
    this.accumulatorMs -= this.tickDurationMs
    this.tickCount += 1
  }

  /**
   * Total milliseconds elapsed since TickManager was created
   */
  elapsedMs(): number {
    return this.totalElapsedMs
  }

  /**
   * How many ticks have been consumed
   */
  getTickCount(): number {
    return this.tickCount
  }

  /**
   * Reset all timers (useful when starting new simulation)
   */
  reset(): void {
    this.accumulatorMs = 0
    this.totalElapsedMs = 0
    this.tickCount = 0
  }
}
