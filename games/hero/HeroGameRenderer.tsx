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

export default function HeroGameRenderer({ oath }: HeroGameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<HeroGameManager | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const sceneRef = useRef<ReturnType<typeof createGameScene> | null>(null);
  const [gameState, setGameState] = useState<HeroGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      if (!canvasRef.current) return;

      try {
        // Initialize game manager
        const gameManager = new HeroGameManager(oath);
        gameRef.current = gameManager;

        // Load sprite atlas
        await loadEnvironmentAtlas();

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

        // Create enemy sprites
        const enemies = gameManager.getState().enemies;
        for (const enemy of enemies) {
          const enemySprite = createEnemySprite(enemy);
          if (enemySprite) {
            resources.scene.add(enemySprite);
            enemySprite.userData.enemyId = enemy.id;
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
          updateSceneObjects(resources.scene, newState);
        });

        // Start the engine
        gameEngine.start();

        setGameState(gameManager.getState());
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
    };
  }, [oath]);

  const createHeroSprite = (): THREE.Mesh | null => {
    const spriteUV = getEnvironmentSprite('barrel'); // Placeholder - use hero sprite when available
    if (!spriteUV) return null;

    // Create a simple colored quad for now
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, 0.5, 0);
    mesh.userData.isHero = true;

    return mesh;
  };

  const createEnemySprite = (enemy: any): THREE.Mesh | null => {
    const spriteUV = getEnvironmentSprite('barrel_broken'); // Placeholder
    if (!spriteUV) return null;

    const geometry = new THREE.PlaneGeometry(0.8, 0.8);
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(enemy.position.x, 0.4, enemy.position.z);
    mesh.userData.enemyId = enemy.id;

    return mesh;
  };

  const setupInputHandling = (canvas: HTMLCanvasElement, camera: THREE.Camera, gameManager: HeroGameManager) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check for enemy clicks
      if (sceneRef.current) {
        const intersects = raycaster.intersectObjects(sceneRef.current.scene.children);
        const enemyIntersect = intersects.find(intersect =>
          intersect.object.userData.enemyId
        );

        if (enemyIntersect) {
          gameManager.attackEnemy(enemyIntersect.object.userData.enemyId);
          return;
        }
      }

      // Ground click for movement
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

      if (intersectionPoint) {
        gameManager.setTargetPosition({
          x: intersectionPoint.x,
          z: intersectionPoint.z,
        });
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  };

  const updateSceneObjects = (scene: THREE.Scene, state: HeroGameState) => {
    // Update hero position
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-center">
          <div className="text-xl mb-2">Loading Hero Game...</div>
          <div className="text-sm text-gray-300">Preparing your adventure</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-600"
        style={{ aspectRatio: '16/9' }}
      />

      {/* HUD Overlay */}
      {gameState && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg min-w-64">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="text-yellow-400 font-bold">{gameState.hero.stats.level}</span>
            </div>
            <div className="flex justify-between">
              <span>XP:</span>
              <span>{gameState.hero.stats.experience}/{gameState.hero.stats.experienceToNext}</span>
            </div>
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
          </div>
        </div>
      )}

      {/* Skill Tree Button */}
      <button
        className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        onClick={() => {/* TODO: Open skill tree modal */}}
      >
        Skills ({gameState?.hero.stats.skillPoints || 0})
      </button>
    </div>
  );
}
