/**
 * Three.js Resources - Scene setup, materials, and lighting
 * Provides pre-configured scene elements for the oath games
 */

import * as THREE from 'three';

export interface GameResources {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dispose: () => void;
}

/**
 * Create a basic game scene with ground plane and lighting
 */
export function createGameScene(canvas: HTMLCanvasElement, width: number, height: number): GameResources {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue

  // Camera - orthographic-like perspective for 2.5D game feel
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x8B7355, // Brownish ground color
    transparent: false
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Lighting setup
  setupLighting(scene);

  // Add some basic fog for atmosphere
  scene.fog = new THREE.Fog(0x87CEEB, 20, 50);

  return {
    scene,
    camera,
    renderer,
    dispose: () => {
      renderer.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
    }
  };
}

/**
 * Setup scene lighting for game atmosphere
 */
function setupLighting(scene: THREE.Scene): void {
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  // Directional light (sun) with shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 5);
  directionalLight.castShadow = true;

  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;

  scene.add(directionalLight);

  // Add a subtle hemisphere light for better ground lighting
  const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.3);
  scene.add(hemisphereLight);
}

/**
 * Create a sprite material from texture atlas
 */
export function createSpriteMaterial(texture: THREE.Texture, uv: { u: number; v: number; u2: number; v2: number }): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      uvOffset: { value: new THREE.Vector2(uv.u, uv.v) },
      uvScale: { value: new THREE.Vector2(uv.u2 - uv.u, uv.v2 - uv.v) }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform vec2 uvOffset;
      uniform vec2 uvScale;

      void main() {
        vUv = uv * uvScale + uvOffset;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      varying vec2 vUv;

      void main() {
        vec4 texColor = texture2D(map, vUv);
        if (texColor.a < 0.1) discard;
        gl_FragColor = texColor;
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  return material;
}

/**
 * Create a simple sprite quad for 2D elements in 3D space
 */
export function createSpriteQuad(width: number, height: number, material: THREE.Material): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

/**
 * Load texture from path
 */
export async function loadTexture(path: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (texture) => {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        resolve(texture);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

/**
 * Create animated sprite material with frame support
 */
export function createAnimatedSpriteMaterial(
  texture: THREE.Texture,
  frameWidth: number,
  frameHeight: number,
  totalFrames: number,
  framesPerRow: number
): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      frame: { value: 0 },
      framesPerRow: { value: framesPerRow },
      totalFrames: { value: totalFrames }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float frame;
      uniform float framesPerRow;
      uniform float totalFrames;
      varying vec2 vUv;

      void main() {
        float frameX = mod(frame, framesPerRow);
        float frameY = floor(frame / framesPerRow);

        vec2 frameSize = vec2(1.0 / framesPerRow, 1.0 / ceil(totalFrames / framesPerRow));
        vec2 frameOffset = vec2(frameX * frameSize.x, frameY * frameSize.y);

        vec2 uv = vUv * frameSize + frameOffset;

        vec4 texColor = texture2D(map, uv);
        if (texColor.a < 0.1) discard;
        gl_FragColor = texColor;
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  return material;
}

/**
 * Resize renderer and update camera aspect ratio
 */
export function resizeGame(resources: GameResources, width: number, height: number): void {
  resources.camera.aspect = width / height;
  resources.camera.updateProjectionMatrix();
  resources.renderer.setSize(width, height);
}
