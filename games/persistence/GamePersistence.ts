/**
 * Game Persistence - Save/load game progress using localStorage
 */

import { HeroGameState, Weapon, Armor, Skill } from '../hero/HeroGameState';

export interface SavedHeroProgress {
  heroLevel: number;
  experience: number;
  skillPoints: number;
  skills: Skill[];
  equippedWeapon: Weapon | null;
  equippedArmor: Armor[];
  inventoryWeapons: Weapon[];
  inventoryArmor: Armor[];
}

export interface SavedAreaProgress {
  enemiesDefeated: number;
  areasExplored: string[];
  buildingsUnlocked: string[];
}

export interface SavedGameProgress {
  hero: SavedHeroProgress;
  area: SavedAreaProgress;
  lastSaved: number;
  version: string;
}

const STORAGE_KEY_PREFIX = 'oathquest_game_';
const CURRENT_VERSION = '1.0.0';

export class GamePersistence {
  private oathId: string;
  private gameMode: 'hero' | 'pet';

  constructor(oathId: string, gameMode: 'hero' | 'pet') {
    this.oathId = oathId;
    this.gameMode = gameMode;
  }

  private getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.oathId}_${this.gameMode}`;
  }

  /**
   * Save hero game progress
   */
  saveHeroProgress(state: HeroGameState): void {
    const progress: SavedGameProgress = {
      hero: {
        heroLevel: state.hero.stats.level,
        experience: state.hero.stats.experience,
        skillPoints: state.hero.stats.skillPoints,
        skills: state.hero.skills,
        equippedWeapon: state.hero.equippedWeapon,
        equippedArmor: state.hero.equippedArmor,
        inventoryWeapons: [state.hero.equippedWeapon].filter(Boolean) as Weapon[], // Simplified - just equipped for now
        inventoryArmor: state.hero.equippedArmor,
      },
      area: {
        enemiesDefeated: state.area.enemiesDefeated,
        areasExplored: ['starting_area'], // Placeholder
        buildingsUnlocked: [], // Will be implemented with town system
      },
      lastSaved: Date.now(),
      version: CURRENT_VERSION,
    };

    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }

  /**
   * Load hero game progress
   */
  loadHeroProgress(): Partial<HeroGameState> | null {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (!saved) return null;

      const progress: SavedGameProgress = JSON.parse(saved);

      // Version check - for future migrations
      if (progress.version !== CURRENT_VERSION) {
        console.warn('Game save version mismatch, loading with defaults');
        return null;
      }

      return {
        hero: {
          stats: {
            level: progress.hero.heroLevel,
            experience: progress.hero.experience,
            experienceToNext: progress.hero.heroLevel * 100,
            skillPoints: progress.hero.skillPoints,
            health: 100 + (progress.hero.heroLevel - 1) * 20,
            maxHealth: 100 + (progress.hero.heroLevel - 1) * 20,
            stamina: 100,
            maxStamina: 100,
            attack: 10 + (progress.hero.heroLevel - 1) * 2,
            defense: 5 + (progress.hero.heroLevel - 1) * 1,
          },
          skills: progress.hero.skills,
          equippedWeapon: progress.hero.equippedWeapon,
          equippedArmor: progress.hero.equippedArmor,
        },
        area: {
          enemiesDefeated: progress.area.enemiesDefeated,
        },
      };
    } catch (error) {
      console.error('Failed to load game progress:', error);
      return null;
    }
  }

  /**
   * Check if save exists
   */
  hasSaveData(): boolean {
    return localStorage.getItem(this.getStorageKey()) !== null;
  }

  /**
   * Delete save data
   */
  deleteSaveData(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  /**
   * Get save info for UI display
   */
  getSaveInfo(): { lastSaved: number; version: string } | null {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (!saved) return null;

      const progress: SavedGameProgress = JSON.parse(saved);
      return {
        lastSaved: progress.lastSaved,
        version: progress.version,
      };
    } catch {
      return null;
    }
  }

  /**
   * Export save data as string (for backup/sharing)
   */
  exportSaveData(): string | null {
    const data = localStorage.getItem(this.getStorageKey());
    return data;
  }

  /**
   * Import save data from string
   */
  importSaveData(saveData: string): boolean {
    try {
      const progress: SavedGameProgress = JSON.parse(saveData);
      if (progress.version !== CURRENT_VERSION) {
        console.error('Incompatible save version');
        return false;
      }

      localStorage.setItem(this.getStorageKey(), saveData);
      return true;
    } catch (error) {
      console.error('Failed to import save data:', error);
      return false;
    }
  }
}

// Utility functions for managing all saves
export const getAllSaveKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

export const getSaveSummary = (key: string): { oathId: string; gameMode: string; lastSaved: number } | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const progress: SavedGameProgress = JSON.parse(data);
    const parts = key.replace(STORAGE_KEY_PREFIX, '').split('_');
    const oathId = parts[0];
    const gameMode = parts[1];

    return {
      oathId,
      gameMode,
      lastSaved: progress.lastSaved,
    };
  } catch {
    return null;
  }
};

export const deleteAllSaves = (): void => {
  const keys = getAllSaveKeys();
  keys.forEach(key => localStorage.removeItem(key));
};
