/**
 * Hero Game State - Core game state management for the Hero ARPG
 */

import { Oath } from '../../App';
import { GamePersistence } from '../persistence/GamePersistence';

export interface Vector2 {
  x: number;
  y: number;
}

export interface HeroStats {
  level: number;
  experience: number;
  experienceToNext: number;
  skillPoints: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
}

export interface Position {
  x: number;
  z: number;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  level: number;
  type: 'goblin' | 'orc' | 'skeleton' | 'wolf';
  isAlive: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  type: 'sword' | 'axe' | 'bow' | 'staff';
  damage: number;
  masteryLevel: number; // 0-100, starts at 25
  kills: number;
  maxMasteryKills: number; // Usually 100
}

export interface Armor {
  id: string;
  name: string;
  type: 'helmet' | 'chest' | 'boots' | 'gloves';
  defense: number;
  spriteName: string; // For visual representation
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  requiredSkillPoints: number;
  prerequisites: string[]; // Skill IDs required
  effects: SkillEffect[];
  isUnlocked: boolean;
}

export interface SkillEffect {
  type: 'damage' | 'defense' | 'health' | 'stamina' | 'attack_speed';
  value: number;
  isPercentage: boolean;
}

export interface HeroGameState {
  hero: {
    position: Position;
    stats: HeroStats;
    equippedWeapon: Weapon | null;
    equippedArmor: Armor[];
    skills: Skill[];
  };
  enemies: Enemy[];
  area: {
    size: { width: number; height: number };
    enemiesDefeated: number;
  };
  combat: {
    isInCombat: boolean;
    targetEnemy: string | null;
    lastAttackTime: number;
    attackCooldown: number;
  };
  navigation: {
    targetPosition: Position | null;
    isMoving: boolean;
    moveSpeed: number;
  };
}

export class HeroGameManager {
  private oath: Oath;
  private state: HeroGameState;
  private persistence: GamePersistence;
  private onStateChange?: (state: HeroGameState) => void;
  private autoSaveTimer: number | null = null;

  constructor(oath: Oath) {
    this.oath = oath;
    this.persistence = new GamePersistence(oath.id, 'hero');
    this.state = this.initializeGameState();

    // Auto-save every 30 seconds
    this.autoSaveTimer = window.setInterval(() => {
      this.saveProgress();
    }, 30000);
  }

  private initializeGameState(): HeroGameState {
    // Try to load saved progress first
    const savedProgress = this.persistence.loadHeroProgress();

    // Calculate base level from willpower (each 100 willpower = 1 level)
    const baseHeroLevel = Math.floor(this.oath.currencies.willpower / 100) + 1;

    // Use saved level if it's higher (player progress), otherwise use base level
    const heroLevel = savedProgress?.hero.stats.level
      ? Math.max(baseHeroLevel, savedProgress.hero.stats.level)
      : baseHeroLevel;

    const skillPoints = savedProgress?.hero.stats.skillPoints ?? heroLevel;

    // Merge saved skills with defaults
    const defaultSkills = this.getDefaultSkills();
    const mergedSkills = defaultSkills.map(defaultSkill => {
      const savedSkill = savedProgress?.hero.skills.find(s => s.id === defaultSkill.id);
      return savedSkill ? { ...defaultSkill, ...savedSkill } : defaultSkill;
    });

    return {
      hero: {
        position: { x: 0, z: 0 },
        stats: {
          level: heroLevel,
          experience: savedProgress?.hero.stats.experience ?? Math.floor(this.oath.currencies.willpower),
          experienceToNext: heroLevel * 100,
          skillPoints: skillPoints,
          health: 100 + (heroLevel - 1) * 20,
          maxHealth: 100 + (heroLevel - 1) * 20,
          stamina: 100,
          maxStamina: 100,
          attack: 10 + (heroLevel - 1) * 2,
          defense: 5 + (heroLevel - 1) * 1,
        },
        equippedWeapon: savedProgress?.hero.equippedWeapon ?? null,
        equippedArmor: savedProgress?.hero.equippedArmor ?? [],
        skills: mergedSkills,
      },
      enemies: this.generateEnemies(),
      area: {
        size: { width: 50, height: 50 },
        enemiesDefeated: savedProgress?.area.enemiesDefeated ?? 0,
      },
      combat: {
        isInCombat: false,
        targetEnemy: null,
        lastAttackTime: 0,
        attackCooldown: 1000, // 1 second
      },
      navigation: {
        targetPosition: null,
        isMoving: false,
        moveSpeed: 5, // units per second
      },
    };
  }

  private getDefaultSkills(): Skill[] {
    return [
      {
        id: 'basic_attack',
        name: 'Basic Attack',
        description: 'Basic melee attack',
        requiredLevel: 1,
        requiredSkillPoints: 0,
        prerequisites: [],
        effects: [{ type: 'damage', value: 10, isPercentage: false }],
        isUnlocked: true,
      },
      {
        id: 'power_strike',
        name: 'Power Strike',
        description: 'Stronger attack with higher damage',
        requiredLevel: 2,
        requiredSkillPoints: 1,
        prerequisites: ['basic_attack'],
        effects: [{ type: 'damage', value: 25, isPercentage: false }],
        isUnlocked: false,
      },
      {
        id: 'defensive_stance',
        name: 'Defensive Stance',
        description: 'Increase defense temporarily',
        requiredLevel: 3,
        requiredSkillPoints: 1,
        prerequisites: [],
        effects: [{ type: 'defense', value: 20, isPercentage: true }],
        isUnlocked: false,
      },
    ];
  }

  private generateEnemies(): Enemy[] {
    const enemies: Enemy[] = [];
    const enemyTypes: Enemy['type'][] = ['goblin', 'orc', 'skeleton'];
    const numEnemies = 5 + Math.floor(Math.random() * 5); // 5-10 enemies

    for (let i = 0; i < numEnemies; i++) {
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const level = Math.max(1, this.state?.hero.stats.level ?? 1 + Math.floor(Math.random() * 3) - 1);

      enemies.push({
        id: `enemy_${i}`,
        position: {
          x: (Math.random() - 0.5) * 40, // Spread across the area
          z: (Math.random() - 0.5) * 40,
        },
        health: 30 + level * 10,
        maxHealth: 30 + level * 10,
        level,
        type,
        isAlive: true,
      });
    }

    return enemies;
  }

  // Public API methods
  getState(): HeroGameState {
    return { ...this.state };
  }

  setStateChangeCallback(callback: (state: HeroGameState) => void): void {
    this.onStateChange = callback;
  }

  private updateState(newState: Partial<HeroGameState>): void {
    this.state = { ...this.state, ...newState };
    this.onStateChange?.(this.state);
  }

  /**
   * Save current progress to localStorage
   */
  private saveProgress(): void {
    this.persistence.saveHeroProgress(this.state);
  }

  /**
   * Manually save progress (for important events like level ups)
   */
  public saveProgressNow(): void {
    this.saveProgress();
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    // Final save on dispose
    this.saveProgress();
  }

  // Movement
  setTargetPosition(position: Position): void {
    this.updateState({
      navigation: {
        ...this.state.navigation,
        targetPosition: position,
        isMoving: true,
      },
    });
  }

  // Combat
  attackEnemy(enemyId: string): void {
    const enemy = this.state.enemies.find(e => e.id === enemyId);
    if (!enemy || !enemy.isAlive) return;

    const now = Date.now();
    if (now - this.state.combat.lastAttackTime < this.state.combat.attackCooldown) return;

    // Calculate damage
    const damage = this.state.hero.stats.attack + (this.state.hero.equippedWeapon?.damage ?? 0);
    const actualDamage = Math.max(1, damage - enemy.level * 2);

    const newHealth = Math.max(0, enemy.health - actualDamage);
    const isDead = newHealth <= 0;

    // Update enemy
    const updatedEnemies = this.state.enemies.map(e =>
      e.id === enemyId
        ? { ...e, health: newHealth, isAlive: !isDead }
        : e
    );

    this.updateState({
      enemies: updatedEnemies,
      combat: {
        ...this.state.combat,
        lastAttackTime: now,
        isInCombat: true,
        targetEnemy: enemyId,
      },
    });

    // Handle enemy death
    if (isDead) {
      this.handleEnemyDeath(enemy);
    }
  }

  private handleEnemyDeath(enemy: Enemy): void {
    // Grant experience
    const expGained = enemy.level * 10;
    const newExp = this.state.hero.stats.experience + expGained;

    // Check for level up
    let newLevel = this.state.hero.stats.level;
    let newSkillPoints = this.state.hero.stats.skillPoints;
    let expToNext = this.state.hero.stats.experienceToNext;

    if (newExp >= expToNext) {
      newLevel += 1;
      newSkillPoints += 1;
      expToNext = newLevel * 100;
    }

    // Chance to drop weapon/armor
    const drops = this.generateDrops(enemy);

    this.updateState({
      area: {
        ...this.state.area,
        enemiesDefeated: this.state.area.enemiesDefeated + 1,
      },
      hero: {
        ...this.state.hero,
        stats: {
          ...this.state.hero.stats,
          experience: newExp,
          level: newLevel,
          skillPoints: newSkillPoints,
          experienceToNext: expToNext,
        },
      },
    });

    // Add drops to inventory (simplified - just equip them for now)
    if (drops.weapon) {
      this.equipWeapon(drops.weapon);
    }
    if (drops.armor) {
      this.equipArmor(drops.armor);
    }
  }

  private generateDrops(enemy: Enemy): { weapon?: Weapon; armor?: Armor } {
    const drops: { weapon?: Weapon; armor?: Armor } = {};

    // 30% chance for weapon drop
    if (Math.random() < 0.3) {
      drops.weapon = {
        id: `weapon_${Date.now()}`,
        name: `${enemy.type} ${enemy.type === 'skeleton' ? 'Bone' : 'Iron'} Sword`,
        type: 'sword',
        damage: 5 + enemy.level * 2,
        masteryLevel: 25, // Starts at 25%
        kills: 0,
        maxMasteryKills: 100,
      };
    }

    // 20% chance for armor drop
    if (Math.random() < 0.2) {
      const armorTypes: Armor['type'][] = ['helmet', 'chest', 'boots'];
      const type = armorTypes[Math.floor(Math.random() * armorTypes.length)];

      drops.armor = {
        id: `armor_${Date.now()}`,
        name: `${enemy.type} ${type}`,
        type,
        defense: 2 + enemy.level,
        spriteName: `${enemy.type}_${type}`,
      };
    }

    return drops;
  }

  private equipWeapon(weapon: Weapon): void {
    this.updateState({
      hero: {
        ...this.state.hero,
        equippedWeapon: weapon,
      },
    });
  }

  private equipArmor(armor: Armor): void {
    const existingArmor = this.state.hero.equippedArmor.find(a => a.type === armor.type);
    const newArmor = existingArmor
      ? this.state.hero.equippedArmor.map(a => a.type === armor.type ? armor : a)
      : [...this.state.hero.equippedArmor, armor];

    this.updateState({
      hero: {
        ...this.state.hero,
        equippedArmor: newArmor,
      },
    });
  }

  // Skills
  unlockSkill(skillId: string): boolean {
    const skill = this.state.hero.skills.find(s => s.id === skillId);
    if (!skill) return false;

    // Check requirements
    if (this.state.hero.stats.level < skill.requiredLevel) return false;
    if (this.state.hero.stats.skillPoints < skill.requiredSkillPoints) return false;

    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqSkill = this.state.hero.skills.find(s => s.id === prereq);
      if (!prereqSkill?.isUnlocked) return false;
    }

    // Unlock skill
    const updatedSkills = this.state.hero.skills.map(s =>
      s.id === skillId
        ? { ...s, isUnlocked: true }
        : s
    );

    this.updateState({
      hero: {
        ...this.state.hero,
        skills: updatedSkills,
        stats: {
          ...this.state.hero.stats,
          skillPoints: this.state.hero.stats.skillPoints - skill.requiredSkillPoints,
        },
      },
    });

    return true;
  }

  // Update loop - called by game engine
  update(deltaTime: number): void {
    this.updateMovement(deltaTime);
    this.updateCombat(deltaTime);
  }

  private updateMovement(deltaTime: number): void {
    if (!this.state.navigation.targetPosition || !this.state.navigation.isMoving) return;

    const hero = this.state.hero;
    const target = this.state.navigation.targetPosition;
    const distance = Math.sqrt(
      Math.pow(target.x - hero.position.x, 2) +
      Math.pow(target.z - hero.position.z, 2)
    );

    if (distance < 0.1) {
      // Reached destination
      this.updateState({
        navigation: {
          ...this.state.navigation,
          isMoving: false,
          targetPosition: null,
        },
      });
      return;
    }

    // Move towards target
    const moveDistance = this.state.navigation.moveSpeed * (deltaTime / 1000);
    const ratio = moveDistance / distance;

    const newX = hero.position.x + (target.x - hero.position.x) * ratio;
    const newZ = hero.position.z + (target.z - hero.position.z) * ratio;

    this.updateState({
      hero: {
        ...this.state.hero,
        position: { x: newX, z: newZ },
      },
    });
  }

  private updateCombat(deltaTime: number): void {
    // Reset combat state if no target or target is dead
    if (this.state.combat.targetEnemy) {
      const target = this.state.enemies.find(e => e.id === this.state.combat.targetEnemy);
      if (!target || !target.isAlive) {
        this.updateState({
          combat: {
            ...this.state.combat,
            isInCombat: false,
            targetEnemy: null,
          },
        });
      }
    }
  }
}
