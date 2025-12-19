/**
 * Sprite System - Atlas loading and UV coordinate management
 * Parses sprite atlas JSON files and provides UV coordinates for rendering
 */

export interface SpriteFrame {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteUV {
  u: number;        // Left UV coordinate (0-1)
  v: number;        // Top UV coordinate (0-1)
  u2: number;       // Right UV coordinate (0-1)
  v2: number;       // Bottom UV coordinate (0-1)
  width: number;    // Original width in pixels
  height: number;   // Original height in pixels
}

export interface SpriteAtlas {
  frames: Map<string, SpriteUV>;
  textureWidth: number;
  textureHeight: number;
  texturePath: string;
}

class SpriteLoader {
  private atlases: Map<string, SpriteAtlas> = new Map();
  private loadingPromises: Map<string, Promise<SpriteAtlas>> = new Map();

  /**
   * Load a sprite atlas from JSON
   */
  async loadAtlas(atlasName: string, jsonPath: string, texturePath: string): Promise<SpriteAtlas> {
    // Check if already loaded
    if (this.atlases.has(atlasName)) {
      return this.atlases.get(atlasName)!;
    }

    // Check if currently loading
    if (this.loadingPromises.has(atlasName)) {
      return this.loadingPromises.get(atlasName)!;
    }

    // Start loading
    const loadPromise = this.loadAtlasInternal(atlasName, jsonPath, texturePath);
    this.loadingPromises.set(atlasName, loadPromise);

    try {
      const atlas = await loadPromise;
      this.atlases.set(atlasName, atlas);
      return atlas;
    } finally {
      this.loadingPromises.delete(atlasName);
    }
  }

  private async loadAtlasInternal(atlasName: string, jsonPath: string, texturePath: string): Promise<SpriteAtlas> {
    try {
      console.log(`Loading atlas ${atlasName} from ${jsonPath}`);

      // Load JSON data
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load atlas JSON: ${jsonPath} (${response.status})`);
      }

      const frames: SpriteFrame[] = await response.json();
      console.log(`Loaded ${frames.length} frames from atlas`);
      const frameMap = new Map<string, SpriteUV>();

      // Get texture dimensions (we'll need to load the image to get this)
      // For now, we'll estimate or you can pass dimensions
      // TODO: Load the actual texture to get dimensions
      const textureWidth = 2048;  // Estimated, should load actual texture
      const textureHeight = 2048; // Estimated, should load actual texture

      // Convert frames to UV coordinates
      for (const frame of frames) {
        const uv: SpriteUV = {
          u: frame.x / textureWidth,
          v: frame.y / textureHeight,
          u2: (frame.x + frame.width) / textureWidth,
          v2: (frame.y + frame.height) / textureHeight,
          width: frame.width,
          height: frame.height
        };
        frameMap.set(frame.name, uv);
      }

      const atlas: SpriteAtlas = {
        frames: frameMap,
        textureWidth,
        textureHeight,
        texturePath
      };

      return atlas;
    } catch (error) {
      console.error(`Error loading atlas ${atlasName}:`, error);
      throw error;
    }
  }

  /**
   * Get a sprite frame by name from a loaded atlas
   */
  getSprite(atlasName: string, spriteName: string): SpriteUV | null {
    const atlas = this.atlases.get(atlasName);
    if (!atlas) {
      console.warn(`Atlas ${atlasName} not loaded`);
      return null;
    }

    const sprite = atlas.frames.get(spriteName);
    if (!sprite) {
      console.warn(`Sprite ${spriteName} not found in atlas ${atlasName}`);
      return null;
    }

    return sprite;
  }

  /**
   * Check if an atlas is loaded
   */
  isAtlasLoaded(atlasName: string): boolean {
    return this.atlases.has(atlasName);
  }

  /**
   * Get all sprite names in an atlas
   */
  getSpriteNames(atlasName: string): string[] {
    const atlas = this.atlases.get(atlasName);
    if (!atlas) return [];
    return Array.from(atlas.frames.keys());
  }

  /**
   * Unload an atlas to free memory
   */
  unloadAtlas(atlasName: string): void {
    this.atlases.delete(atlasName);
  }

  /**
   * Get atlas info for debugging
   */
  getAtlasInfo(atlasName: string): { frameCount: number; texturePath: string } | null {
    const atlas = this.atlases.get(atlasName);
    if (!atlas) return null;

    return {
      frameCount: atlas.frames.size,
      texturePath: atlas.texturePath
    };
  }
}

// Singleton instance
export const spriteLoader = new SpriteLoader();

// Predefined atlas paths
export const ATLAS_PATHS = {
  ENVIRONMENT: {
    name: 'environment',
    json: '/_unused/asset_import_folder/environment_spritesheet01.json',
    texture: '/_unused/asset_import_folder/environment_spritesheet01.png'
  }
} as const;

/**
 * Convenience function to load the environment atlas
 */
export async function loadEnvironmentAtlas(): Promise<SpriteAtlas> {
  return spriteLoader.loadAtlas(
    ATLAS_PATHS.ENVIRONMENT.name,
    ATLAS_PATHS.ENVIRONMENT.json,
    ATLAS_PATHS.ENVIRONMENT.texture
  );
}

/**
 * Get environment sprite UVs
 */
export function getEnvironmentSprite(spriteName: string): SpriteUV | null {
  return spriteLoader.getSprite(ATLAS_PATHS.ENVIRONMENT.name, spriteName);
}
