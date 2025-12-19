/**
 * Hero Game Renderer - Three.js rendering and input handling for Hero game
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createGameScene, createSpriteQuad, loadTexture, createSpriteMaterial } from '../core/resources';
import { gameEngine, GameEngine } from '../core/engine';
import { loadEnvironmentAtlas, getEnvironmentSprite } from '../core/sprites';
import { HeroGameManager, HeroGameState, Position } from './HeroGameState';
import { Oath } from '../../App';

interface HeroGameRendererProps {
  oath: Oath;
}

export default React.memo(function HeroGameRenderer({ oath }: HeroGameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<HeroGameManager | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const sceneRef = useRef<ReturnType<typeof createGameScene> | null>(null);
  const [gameState, setGameState] = useState<HeroGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      if (!canvasRef.current) {
        console.error('HeroGameRenderer: No canvas element found');
        return;
      }

      try {
        // Initialize game manager
        const gameManager = new HeroGameManager(oath);
        gameRef.current = gameManager;

        // Load sprite atlas (optional - game works without it)
        try {
          await loadEnvironmentAtlas();
        } catch (spriteError) {
          console.warn('Failed to load sprite atlas, using fallback:', spriteError);
        }

        // Create Three.js scene
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const resources = createGameScene(canvas, rect.width, rect.height);
        sceneRef.current = resources;

        // Create hero sprite
        const heroSprite = createHeroSprite();
        if (heroSprite) {
          resources.scene.add(heroSprite);
        }

        // Create sprites based on game mode
        const gameState = gameManager.getState();

        if (gameState.gameMode === 'combat') {
          // Create enemy sprites for combat
          const enemies = gameState.enemies;
          for (const enemy of enemies) {
            const enemySprite = createEnemySprite(enemy);
            if (enemySprite) {
              resources.scene.add(enemySprite);
              enemySprite.userData.enemyId = enemy.id;
            }
          }
        } else {
          // Create navigation nodes for overworld
          const overworldManager = gameManager.getOverworldManager();
          const nodes = overworldManager.getAvailableNodes();
          for (const node of nodes) {
            const nodeSprite = createNavigationNode(node);
            if (nodeSprite) {
              resources.scene.add(nodeSprite);
              nodeSprite.userData.nodeId = node.id;
            }
          }
        }

        // Setup input handling
        setupInputHandling(canvas, resources.camera, gameManager);

        // Setup game engine
        engineRef.current = gameEngine;
        gameEngine.addUpdateCallback((deltaTime) => {
          gameManager.update(deltaTime);
        });

        gameEngine.addRenderCallback(() => {
          resources.renderer.render(resources.scene, resources.camera);
        });

        // Set state change callback
        gameManager.setStateChangeCallback((newState) => {
          setGameState({ ...newState });

          // Handle mode changes by clearing and recreating scene objects
          if (newState.gameMode !== gameState?.gameMode) {
            // Clear existing game objects
            const objectsToRemove = resources.scene.children.filter(obj =>
              obj.userData.isHero || obj.userData.enemyId || obj.userData.nodeId
            );
            objectsToRemove.forEach(obj => resources.scene.remove(obj));

            // Recreate objects for new mode
            if (newState.gameMode === 'combat') {
              // Add hero
              const heroSprite = createHeroSprite();
              if (heroSprite) {
                resources.scene.add(heroSprite);
              }

              // Add enemies
              for (const enemy of newState.enemies) {
                const enemySprite = createEnemySprite(enemy);
                if (enemySprite) {
                  resources.scene.add(enemySprite);
                  enemySprite.userData.enemyId = enemy.id;
                }
              }
            } else {
              // Add navigation nodes
              const overworldManager = gameManager.getOverworldManager();
              const nodes = overworldManager.getAvailableNodes();
              for (const node of nodes) {
                const nodeSprite = createNavigationNode(node);
                if (nodeSprite) {
                  resources.scene.add(nodeSprite);
                  nodeSprite.userData.nodeId = node.id;
                }
              }
            }
          } else {
            // Update existing objects
            updateSceneObjects(resources.scene, newState);
          }
        });

        // Start the engine
        gameEngine.start();

        setGameState(gameState);
        setIsLoading(false);

      } catch (error) {
        console.error('Failed to initialize hero game:', error);
        setIsLoading(false);
      }
    };

    initGame();

    return () => {
      // Cleanup
      if (engineRef.current) {
        engineRef.current.stop();
      }
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
      if (gameRef.current) {
        gameRef.current.dispose();
      }
    };
  }, [oath.id]); // Use oath.id instead of full oath object to prevent infinite re-renders

  const createHeroSprite = (): THREE.Mesh | null => {
    try {
      // Create a simple colored quad for now (works without sprites)
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(0, 0.5, 0);
      mesh.userData.isHero = true;

      return mesh;
    } catch (error) {
      console.error('Failed to create hero sprite:', error);
      return null;
    }
  };

  const createEnemySprite = (enemy: any): THREE.Mesh | null => {
    try {
      // Create a simple colored quad for now (works without sprites)
      const geometry = new THREE.PlaneGeometry(0.8, 0.8);
      const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(enemy.position.x, 0.4, enemy.position.z);
      mesh.userData.enemyId = enemy.id;

      return mesh;
    } catch (error) {
      console.error('Failed to create enemy sprite for', enemy.id, ':', error);
      return null;
    }
  };

  const createNavigationNode = (node: any): THREE.Mesh | null => {
    try {
      const geometry = new THREE.PlaneGeometry(2, 2);
      const colors = {
        town: 0x00ff00,     // Green for town
        forest: 0x008000,   // Dark green for forest
        dungeon: 0x800080,  // Purple for dungeon
        mountain: 0x808080, // Gray for mountain
        lake: 0x0080ff,     // Blue for lake
      };
      const material = new THREE.MeshLambertMaterial({
        color: colors[node.type] || 0xffffff,
        transparent: true,
        opacity: node.isExplored ? 1.0 : 0.7
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(node.position.x, 0.1, node.position.y);
      mesh.rotation.x = -Math.PI / 2; // Lay flat on ground
      mesh.userData.nodeId = node.id;

      return mesh;
    } catch (error) {
      console.error('Failed to create navigation node for', node.id, ':', error);
      return null;
    }
  };

  const setupInputHandling = (canvas: HTMLCanvasElement, camera: THREE.Camera, gameManager: HeroGameManager) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

  const handleClick = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (sceneRef.current) {
      const intersects = raycaster.intersectObjects(sceneRef.current.scene.children);
      const gameState = gameManager.getState();

      if (gameState.gameMode === 'combat') {
        // Combat mode: check for enemy clicks
        const enemyIntersect = intersects.find(intersect =>
          intersect.object.userData.enemyId
        );

        if (enemyIntersect) {
          gameManager.attackEnemy(enemyIntersect.object.userData.enemyId);
          return;
        }

        // Ground click for movement in combat
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

        if (intersectionPoint) {
          gameManager.setTargetPosition({
            x: intersectionPoint.x,
            z: intersectionPoint.z,
          });
        }
      } else {
        // Overworld mode: check for navigation node clicks
        const nodeIntersect = intersects.find(intersect =>
          intersect.object.userData.nodeId
        );

        if (nodeIntersect) {
          const result = gameManager.travelToArea(nodeIntersect.object.userData.nodeId);
          if (!result.success && result.reason) {
            console.log('Cannot travel:', result.reason);
          }
          return;
        }
      }
    }
  };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  };

  const updateSceneObjects = (scene: THREE.Scene, state: HeroGameState) => {
    if (state.gameMode === 'combat') {
      // Update hero position in combat
      const heroObject = scene.children.find(obj => obj.userData.isHero);
      if (heroObject) {
        heroObject.position.x = state.hero.position.x;
        heroObject.position.z = state.hero.position.z;
      }

      // Update enemy positions and visibility
      for (const enemy of state.enemies) {
        const enemyObject = scene.children.find(obj => obj.userData.enemyId === enemy.id);
        if (enemyObject) {
          enemyObject.position.x = enemy.position.x;
          enemyObject.position.z = enemy.position.z;
          enemyObject.visible = enemy.isAlive;
        }
      }
    } else {
      // Overworld mode - hide/show appropriate objects
      const heroObject = scene.children.find(obj => obj.userData.isHero);
      if (heroObject) {
        heroObject.visible = false;
      }

      // Update navigation nodes
      const overworldManager = gameRef.current?.getOverworldManager();
      if (overworldManager) {
        const nodes = overworldManager.getAvailableNodes();
        for (const node of nodes) {
          const nodeObject = scene.children.find(obj => obj.userData.nodeId === node.id);
          if (nodeObject) {
            // Could add visual updates based on node state
          }
        }
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-600"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-xl mb-2">Loading Hero Game...</div>
            <div className="text-sm text-gray-300">Preparing your adventure</div>
            <div className="mt-4 text-xs text-gray-400">
              Check browser console (F12) for any errors
            </div>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {!isLoading && !gameState && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-xl mb-2 text-red-400">Failed to Load Hero Game</div>
            <div className="text-sm text-gray-300">Check browser console for errors</div>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      {gameState && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg min-w-64">
          <div className="space-y-2">
            {/* Game Mode Indicator */}
            <div className="text-center border-b border-gray-600 pb-2 mb-2">
              <div className="text-sm text-gray-300">Mode</div>
              <div className={`font-bold ${gameState.gameMode === 'overworld' ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.gameMode === 'overworld' ? '🌍 Overworld' : '⚔️ Combat'}
              </div>
            </div>

            <div className="flex justify-between">
              <span>Level:</span>
              <span className="text-yellow-400 font-bold">{gameState.hero.stats.level}</span>
            </div>
            <div className="flex justify-between">
              <span>XP:</span>
              <span>{gameState.hero.stats.experience}/{gameState.hero.stats.experienceToNext}</span>
            </div>

            {gameState.gameMode === 'combat' && (
              <>
                <div className="flex justify-between">
                  <span>Health:</span>
                  <span>{Math.floor(gameState.hero.stats.health)}/{gameState.hero.stats.maxHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skill Points:</span>
                  <span className="text-blue-400">{gameState.hero.stats.skillPoints}</span>
                </div>
                {gameState.hero.equippedWeapon && (
                  <div className="flex justify-between">
                    <span>Weapon:</span>
                    <span className="text-red-400">{gameState.hero.equippedWeapon.name}</span>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Click enemies to attack, click ground to move
                </div>
              </>
            )}

            {gameState.gameMode === 'overworld' && (
              <>
                <div className="flex justify-between">
                  <span>Current Area:</span>
                  <span className="text-blue-400">{gameState.overworld.currentArea.replace('_', ' ')}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Click colored nodes to travel to areas
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 space-y-2">
        {gameState?.gameMode === 'overworld' && gameState.overworld.currentArea !== 'town_center' && (
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg block"
            onClick={() => gameRef.current?.switchToCombatMode()}
          >
            ⚔️ Enter Combat
          </button>
        )}
        {gameState?.gameMode === 'combat' && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg block"
            onClick={() => gameRef.current?.switchToOverworldMode()}
          >
            🌍 To Overworld
          </button>
        )}
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg block"
          onClick={() => {/* TODO: Open skill tree modal */}}
        >
          Skills ({gameState?.hero.stats.skillPoints || 0})
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg block"
          onClick={() => gameRef.current?.saveProgressNow()}
        >
          💾 Save
        </button>
      </div>
    </div>
  );
});