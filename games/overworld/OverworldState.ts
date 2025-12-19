/**
 * Overworld Navigation System - Town center and area exploration
 */

import { Vector2 } from '../hero/HeroGameState';

export interface NavigationNode {
  id: string;
  name: string;
  position: Vector2;
  type: 'town' | 'forest' | 'dungeon' | 'mountain' | 'lake';
  isUnlocked: boolean;
  requiredLevel: number;
  description: string;
  dangerLevel: number; // 1-5, affects enemy difficulty
  isExplored: boolean;
  rewards: string[]; // Potential rewards from exploring
}

export interface Area {
  id: string;
  name: string;
  type: 'town' | 'forest' | 'dungeon' | 'mountain' | 'lake';
  size: { width: number; height: number };
  enemyCount: number;
  difficulty: number;
  isProcedural: boolean; // true for generated areas, false for fixed town
  discoveredAt: number; // timestamp when first discovered
  lastVisited: number; // timestamp of last visit
  clearCount: number; // how many times cleared
}

export interface OverworldState {
  currentArea: string; // ID of current area
  areas: Map<string, Area>;
  navigationNodes: NavigationNode[];
  playerPosition: Vector2;
  discoveredAreas: Set<string>;
  travelCooldown: number; // prevents spamming travel
  lastTravelTime: number;
}

export class OverworldManager {
  private state: OverworldState;
  private onStateChange?: (state: OverworldState) => void;

  constructor() {
    this.state = this.initializeOverworld();
  }

  private initializeOverworld(): OverworldState {
    // Create the town center as the starting hub
    const townArea: Area = {
      id: 'town_center',
      name: 'Oathbound Town',
      type: 'town',
      size: { width: 30, height: 30 },
      enemyCount: 0, // Safe zone
      difficulty: 0,
      isProcedural: false,
      discoveredAt: Date.now(),
      lastVisited: Date.now(),
      clearCount: 0,
    };

    // Create initial navigation nodes
    const navigationNodes: NavigationNode[] = [
      {
        id: 'town_center',
        name: 'Town Center',
        position: { x: 0, y: 0 },
        type: 'town',
        isUnlocked: true,
        requiredLevel: 1,
        description: 'The heart of Oathbound Town. Safe haven and trading hub.',
        dangerLevel: 0,
        isExplored: true,
        rewards: ['trading', 'resting', 'upgrades'],
      },
      {
        id: 'whispering_woods',
        name: 'Whispering Woods',
        position: { x: 15, y: 10 },
        type: 'forest',
        isUnlocked: true,
        requiredLevel: 1,
        description: 'A dense forest filled with ancient trees and mysterious creatures.',
        dangerLevel: 2,
        isExplored: false,
        rewards: ['wood', 'herbs', 'forest treasures'],
      },
      {
        id: 'forgotten_caves',
        name: 'Forgotten Caves',
        position: { x: -12, y: 18 },
        type: 'dungeon',
        isUnlocked: false,
        requiredLevel: 3,
        description: 'Dark underground caverns hiding forgotten secrets.',
        dangerLevel: 4,
        isExplored: false,
        rewards: ['minerals', 'ancient artifacts', 'rare weapons'],
      },
      {
        id: 'crystal_lake',
        name: 'Crystal Lake',
        position: { x: 20, y: -15 },
        type: 'lake',
        isUnlocked: false,
        requiredLevel: 2,
        description: 'A serene lake with crystal-clear waters and aquatic mysteries.',
        dangerLevel: 1,
        isExplored: false,
        rewards: ['fish', 'pearls', 'water magic items'],
      },
      {
        id: 'storm_peaks',
        name: 'Storm Peaks',
        position: { x: -18, y: -12 },
        type: 'mountain',
        isUnlocked: false,
        requiredLevel: 5,
        description: 'Towering mountains where storms rage eternally.',
        dangerLevel: 5,
        isExplored: false,
        rewards: ['rare ores', 'storm magic', 'legendary equipment'],
      },
    ];

    const areas = new Map<string, Area>();
    areas.set(townArea.id, townArea);

    return {
      currentArea: 'town_center',
      areas,
      navigationNodes,
      playerPosition: { x: 0, y: 0 },
      discoveredAreas: new Set(['town_center']),
      travelCooldown: 1000, // 1 second cooldown between travels
      lastTravelTime: 0,
    };
  }

  getState(): OverworldState {
    return { ...this.state };
  }

  setStateChangeCallback(callback: (state: OverworldState) => void): void {
    this.onStateChange = callback;
  }

  private updateState(newState: Partial<OverworldState>): void {
    this.state = { ...this.state, ...newState };
    this.onStateChange?.(this.state);
  }

  /**
   * Travel to a navigation node/area
   */
  travelToNode(nodeId: string, heroLevel: number): { success: boolean; reason?: string; areaId?: string } {
    const node = this.state.navigationNodes.find(n => n.id === nodeId);
    if (!node) {
      return { success: false, reason: 'Node not found' };
    }

    if (!node.isUnlocked) {
      return { success: false, reason: 'Node is locked' };
    }

    if (heroLevel < node.requiredLevel) {
      return { success: false, reason: `Requires hero level ${node.requiredLevel}` };
    }

    // Check travel cooldown
    const now = Date.now();
    if (now - this.state.lastTravelTime < this.state.travelCooldown) {
      return { success: false, reason: 'Traveling too quickly' };
    }

    // Create or get the area
    let area = this.state.areas.get(nodeId);
    if (!area) {
      area = this.createAreaFromNode(node);
      this.state.areas.set(nodeId, area);
    }

    // Update area visit time
    area.lastVisited = now;
    if (!this.state.discoveredAreas.has(nodeId)) {
      area.discoveredAt = now;
      this.state.discoveredAreas.add(nodeId);
    }

    // Update state
    this.updateState({
      currentArea: nodeId,
      playerPosition: { x: 0, y: 0 }, // Reset position in new area
      lastTravelTime: now,
    });

    return { success: true, areaId: nodeId };
  }

  /**
   * Create a procedural area from a navigation node
   */
  private createAreaFromNode(node: NavigationNode): Area {
    const baseEnemyCount = node.dangerLevel * 3 + Math.floor(Math.random() * 3);
    const sizeMultiplier = node.dangerLevel * 10 + 20;

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      size: {
        width: sizeMultiplier + Math.floor(Math.random() * 10),
        height: sizeMultiplier + Math.floor(Math.random() * 10),
      },
      enemyCount: baseEnemyCount,
      difficulty: node.dangerLevel,
      isProcedural: true,
      discoveredAt: Date.now(),
      lastVisited: Date.now(),
      clearCount: 0,
    };
  }

  /**
   * Check if a node can be unlocked based on progress
   */
  checkNodeUnlocks(heroLevel: number, areasCleared: number): NavigationNode[] {
    const newlyUnlocked: NavigationNode[] = [];

    for (const node of this.state.navigationNodes) {
      if (!node.isUnlocked && heroLevel >= node.requiredLevel) {
        node.isUnlocked = true;
        newlyUnlocked.push(node);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.updateState({
        navigationNodes: [...this.state.navigationNodes],
      });
    }

    return newlyUnlocked;
  }

  /**
   * Mark an area as cleared (all enemies defeated)
   */
  markAreaCleared(areaId: string): void {
    const area = this.state.areas.get(areaId);
    if (area) {
      area.clearCount += 1;

      // Check if this unlocks new nodes
      const heroLevel = 1; // This should be passed in from hero state
      this.checkNodeUnlocks(heroLevel, area.clearCount);

      this.updateState({
        areas: new Map(this.state.areas),
      });
    }
  }

  /**
   * Get available navigation nodes for the current area
   */
  getAvailableNodes(): NavigationNode[] {
    return this.state.navigationNodes.filter(node => node.isUnlocked);
  }

  /**
   * Get the current area information
   */
  getCurrentArea(): Area | null {
    return this.state.areas.get(this.state.currentArea) || null;
  }

  /**
   * Check if player is in town (safe zone)
   */
  isInTown(): boolean {
    const currentArea = this.getCurrentArea();
    return currentArea?.type === 'town';
  }

  /**
   * Get exploration progress
   */
  getExplorationStats(): {
    discoveredAreas: number;
    totalAreas: number;
    clearedAreas: number;
    availableNodes: number;
  } {
    const clearedAreas = Array.from(this.state.areas.values()).filter(area => area.clearCount > 0).length;

    return {
      discoveredAreas: this.state.discoveredAreas.size,
      totalAreas: this.state.areas.size,
      clearedAreas,
      availableNodes: this.getAvailableNodes().length,
    };
  }
}
