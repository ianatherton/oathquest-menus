/**
 * Game Engine - Core game loop and timing system
 * Provides fixed timestep updates, pause/resume functionality, and delta time calculations
 */

export interface GameUpdateCallback {
  (deltaTime: number): void;
}

export interface GameRenderCallback {
  (deltaTime: number, alpha: number): void;
}

export class GameEngine {
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimestep: number = 1000 / 60; // 60 FPS
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  private updateCallbacks: GameUpdateCallback[] = [];
  private renderCallbacks: GameRenderCallback[] = [];

  constructor() {
    this.gameLoop = this.gameLoop.bind(this);
  }

  /**
   * Start the game engine
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Stop the game engine
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pause the game (updates stop, but rendering continues)
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the game from pause
   */
  resume(): void {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  /**
   * Check if the game is currently running
   */
  isGameRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check if the game is currently paused
   */
  isGamePaused(): boolean {
    return this.isPaused;
  }

  /**
   * Add an update callback (called at fixed 60 FPS)
   */
  addUpdateCallback(callback: GameUpdateCallback): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add a render callback (called as fast as possible)
   */
  addRenderCallback(callback: GameRenderCallback): () => void {
    this.renderCallbacks.push(callback);
    return () => {
      const index = this.renderCallbacks.indexOf(callback);
      if (index > -1) {
        this.renderCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Main game loop using fixed timestep with interpolation
   */
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death - clamp delta time
    const clampedDelta = Math.min(deltaTime, this.fixedTimestep * 3);

    if (!this.isPaused) {
      // Accumulate time for fixed updates
      this.accumulator += clampedDelta;

      // Perform fixed updates
      while (this.accumulator >= this.fixedTimestep) {
        this.update(this.fixedTimestep);
        this.accumulator -= this.fixedTimestep;
      }
    }

    // Calculate interpolation alpha for smooth rendering
    const alpha = this.isPaused ? 0 : this.accumulator / this.fixedTimestep;

    // Render with interpolation
    this.render(clampedDelta, alpha);

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Fixed timestep update
   */
  private update(deltaTime: number): void {
    for (const callback of this.updateCallbacks) {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error('Error in game update callback:', error);
      }
    }
  }

  /**
   * Variable timestep render with interpolation
   */
  private render(deltaTime: number, alpha: number): void {
    for (const callback of this.renderCallbacks) {
      try {
        callback(deltaTime, alpha);
      } catch (error) {
        console.error('Error in game render callback:', error);
      }
    }
  }

  /**
   * Get the current fixed timestep in milliseconds
   */
  getFixedTimestep(): number {
    return this.fixedTimestep;
  }

  /**
   * Get the target FPS
   */
  getTargetFPS(): number {
    return 1000 / this.fixedTimestep;
  }
}

// Singleton instance for easy access
export const gameEngine = new GameEngine();
