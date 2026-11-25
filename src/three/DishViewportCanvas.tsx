import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { Recipe } from '../data/recipes';
import { buildDishModel, type DishAssembly } from './dishModels';
import { createCulinaryMaterialLibrary, type VesselFinishPreset } from './materials';
import { createProceduralTexturePack } from './proceduralTextures';

export type CameraPreset = 'hero' | 'overhead' | 'closeup' | 'side';
export type LightingPreset = 'morning' | 'bistro' | 'studio';

interface DishViewportCanvasProps {
  recipe: Recipe;
  explodeFactor: number;
  finishPreset: VesselFinishPreset;
  lightingPreset: LightingPreset;
  cameraPreset: CameraPreset;
  cameraPresetSeq: number;
  autoSpin: boolean;
  onInspectPart?: (partLabel: string | null) => void;
}

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  hero: { pos: [2.7, 2.25, 3.05], target: [0, 0.3, 0] },
  overhead: { pos: [0.02, 4.15, 0.35], target: [0, 0.15, 0] },
  closeup: { pos: [1.45, 1.15, 1.65], target: [0, 0.35, 0] },
  side: { pos: [3.35, 0.72, 0.2], target: [0, 0.32, 0] },
};

const LIGHTING_PRESETS: Record<
  LightingPreset,
  {
    bgHex: number;
    keyColor: number;
    keyIntensity: number;
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
    rimIntensity: number;
  }
> = {
  morning: {
    bgHex: 0xefe9dc,
    keyColor: 0xfff1d6,
    keyIntensity: 2.3,
    hemiSky: 0xdbe8f5,
    hemiGround: 0x8b6f4e,
    hemiIntensity: 0.75,
    rimIntensity: 0.85,
  },
  bistro: {
    bgHex: 0x1c221d,
    keyColor: 0xffb978,
    keyIntensity: 2.5,
    hemiSky: 0x45586b,
    hemiGround: 0x3b2a1c,
    hemiIntensity: 0.55,
    rimIntensity: 1.15,
  },
  studio: {
    bgHex: 0xf4f3ef,
    keyColor: 0xffffff,
    keyIntensity: 2.1,
    hemiSky: 0xe6eff8,
    hemiGround: 0x7c7b74,
    hemiIntensity: 0.9,
    rimIntensity: 0.75,
  },
};

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _rayPointer = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export default function DishViewportCanvas({
  recipe,
  explodeFactor,
  finishPreset,
  lightingPreset,
  cameraPreset,
  cameraPresetSeq,
  autoSpin,
  onInspectPart,
}: DishViewportCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  // Mutable refs for React props so Three.js scene stays mounted across UI updates
  const targetExplodeRef = useRef(explodeFactor);
  const currentExplodeRef = useRef(explodeFactor);
  const autoSpinRef = useRef(autoSpin);
  const onInspectPartRef = useRef(onInspectPart);
  targetExplodeRef.current = explodeFactor;
  autoSpinRef.current = autoSpin;
  onInspectPartRef.current = onInspectPart;

  const sceneControllerRef = useRef<{
    loadRecipeDish: (nextRecipe: Recipe) => void;
    applyFinish: (preset: VesselFinishPreset) => void;
    applyLighting: (preset: LightingPreset) => void;
    triggerCameraPreset: (preset: CameraPreset) => void;
    requestRender: () => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const initLight = LIGHTING_PRESETS[lightingPreset];
    scene.background = new THREE.Color(initLight.bgHex);
    scene.fog = new THREE.FogExp2(initLight.bgHex, 0.042);

    const camera = new THREE.PerspectiveCamera(
      40,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      60,
    );
    const initialCam = CAMERA_PRESETS[cameraPreset];
    camera.position.set(...initialCam.pos);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTexturePack(maxAniso);
    const materials = createCulinaryMaterialLibrary(textures);
    materials.applyVesselFinish(finishPreset);

    // 3-Point Studio Lighting Rig + Softbox Area Light (<= 1 shadow caster)
    const hemiLight = new THREE.HemisphereLight(
      initLight.hemiSky,
      initLight.hemiGround,
      initLight.hemiIntensity,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(initLight.keyColor, initLight.keyIntensity);
    keyLight.position.set(3.8, 5.6, 3.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    const d = 3.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xcde2ff, initLight.rimIntensity);
    rimLight.position.set(-4.2, 3.2, -3.6);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xfff8ed, 2.2, 4.5, 2.5);
      softbox.position.set(-2.5, 3.6, 3.2);
      softbox.lookAt(0, 0.3, 0);
      scene.add(softbox);
    }

    // Grounded Culinary Environment (Infinite Dining Surface + Oak Turntable Plinth)
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: initLight.bgHex,
      roughness: 0.92,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.145;
    ground.receiveShadow = true;
    scene.add(ground);

    const plinthGroup = new THREE.Group();
    const plinthTopGeo = new THREE.CylinderGeometry(1.88, 1.92, 0.12, 64);
    const plinthTop = new THREE.Mesh(plinthTopGeo, materials.tableWood);
    plinthTop.position.y = -0.06;
    plinthTop.receiveShadow = true;
    plinthTop.castShadow = true;
    plinthGroup.add(plinthTop);

    const rimRingGeo = new THREE.TorusGeometry(1.9, 0.018, 14, 72);
    rimRingGeo.rotateX(Math.PI / 2);
    const rimRing = new THREE.Mesh(rimRingGeo, materials.turntableRim);
    rimRing.position.y = -0.005;
    plinthGroup.add(rimRing);

    const baseFootGeo = new THREE.CylinderGeometry(1.48, 1.54, 0.03, 48);
    const baseFoot = new THREE.Mesh(baseFootGeo, materials.vesselAccent);
    baseFoot.position.y = -0.13;
    baseFoot.receiveShadow = true;
    plinthGroup.add(baseFoot);

    // Woven linen table runner offset cleanly beneath dish
    const runnerGeo = new THREE.BoxGeometry(2.1, 0.01, 2.1);
    const runner = new THREE.Mesh(runnerGeo, materials.linenCloth);
    runner.position.y = -0.002;
    runner.rotation.y = Math.PI / 10;
    runner.receiveShadow = true;
    plinthGroup.add(runner);

    scene.add(plinthGroup);

    // Dish assembly container
    const dishStage = new THREE.Group();
    scene.add(dishStage);
    let currentAssembly: DishAssembly | null = null;

    const loadRecipeDish = (nextRecipe: Recipe) => {
      if (currentAssembly) {
        dishStage.remove(currentAssembly.root);
        currentAssembly.dispose();
        currentAssembly = null;
      }
      currentAssembly = buildDishModel(nextRecipe, materials);
      // Apply current explode factor immediately on switch
      const exp = currentExplodeRef.current;
      currentAssembly.explodableParts.forEach((part) => {
        part.position.y = (part.userData.baseY as number) + (part.userData.explodeOffset as number) * exp;
      });
      dishStage.add(currentAssembly.root);
    };

    loadRecipeDish(recipe);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.65;
    controls.maxDistance = 6.8;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.target.set(...initialCam.target);
    controls.update();

    let isCameraTransitioning = false;
    let activePresetTarget = initialCam;

    controls.addEventListener('start', () => {
      isCameraTransitioning = false;
    });

    // Raycaster for layer inspection
    const raycaster = new THREE.Raycaster();
    let lastHoverTime = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 50) return;
      lastHoverTime = now;
      if (!currentAssembly) return;

      const rect = renderer.domElement.getBoundingClientRect();
      _rayPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _rayPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_rayPointer, camera);
      const hits = raycaster.intersectObjects(currentAssembly.explodableParts, true);
      if (hits.length > 0) {
        const label = (hits[0].object.userData.partLabel as string | undefined) ?? null;
        renderer.domElement.style.cursor = label ? 'pointer' : 'grab';
        onInspectPartRef.current?.(label);
      } else {
        renderer.domElement.style.cursor = 'grab';
        onInspectPartRef.current?.(null);
      }
    };

    const handlePointerLeave = () => {
      renderer.domElement.style.cursor = 'grab';
      onInspectPartRef.current?.(null);
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Frame & software-WebGL paced render loop
    let frameId = 0;
    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
    let lastFrameTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function stepAndRender() {
      if (disposed) return false;
      const now = performance.now();
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      let needsAnotherFrame = false;

      // 1. Smoothly damp exploded view
      const targetExp = targetExplodeRef.current;
      if (Math.abs(currentExplodeRef.current - targetExp) > 0.001) {
        currentExplodeRef.current = THREE.MathUtils.damp(
          currentExplodeRef.current,
          targetExp,
          8.5,
          dt,
        );
        if (Math.abs(currentExplodeRef.current - targetExp) <= 0.001) {
          currentExplodeRef.current = targetExp;
        } else {
          needsAnotherFrame = true;
        }
        if (currentAssembly) {
          currentAssembly.explodableParts.forEach((part) => {
            part.position.y =
              (part.userData.baseY as number) +
              (part.userData.explodeOffset as number) * currentExplodeRef.current;
          });
        }
      }

      // 2. Smoothly damp camera preset transitions
      if (isCameraTransitioning) {
        _targetCamPos.set(...activePresetTarget.pos);
        _targetLookAt.set(...activePresetTarget.target);
        const alpha = 1 - Math.exp(-6.5 * dt);
        camera.position.lerp(_targetCamPos, alpha);
        controls.target.lerp(_targetLookAt, alpha);

        if (
          camera.position.distanceTo(_targetCamPos) < 0.015 &&
          controls.target.distanceTo(_targetLookAt) < 0.01
        ) {
          camera.position.copy(_targetCamPos);
          controls.target.copy(_targetLookAt);
          isCameraTransitioning = false;
        } else {
          needsAnotherFrame = true;
        }
      }

      // 3. Gentle turntable spin (disabled on software WebGL for deterministic idle)
      if (autoSpinRef.current && !isSoftwareGl) {
        dishStage.rotation.y += dt * 0.28;
        plinthGroup.rotation.y += dt * 0.28;
        needsAnotherFrame = true;
      }

      if (controls.update()) {
        needsAnotherFrame = true;
      }

      renderer.render(scene, camera);
      return needsAnotherFrame;
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const keepGoing = stepAndRender();
        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || keepGoing || (autoSpinRef.current && !isSoftwareGl))) {
            requestRender();
          }
        };
        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    controls.addEventListener('change', requestRender);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    sceneControllerRef.current = {
      loadRecipeDish: (nextRecipe: Recipe) => {
        loadRecipeDish(nextRecipe);
        requestRender();
      },
      applyFinish: (preset: VesselFinishPreset) => {
        materials.applyVesselFinish(preset);
        requestRender();
      },
      applyLighting: (preset: LightingPreset) => {
        const cfg = LIGHTING_PRESETS[preset];
        (scene.background as THREE.Color).setHex(cfg.bgHex);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(cfg.bgHex);
        }
        groundMat.color.setHex(cfg.bgHex);
        keyLight.color.setHex(cfg.keyColor);
        keyLight.intensity = cfg.keyIntensity;
        hemiLight.color.setHex(cfg.hemiSky);
        hemiLight.groundColor.setHex(cfg.hemiGround);
        hemiLight.intensity = cfg.hemiIntensity;
        rimLight.intensity = cfg.rimIntensity;
        requestRender();
      },
      triggerCameraPreset: (preset: CameraPreset) => {
        activePresetTarget = CAMERA_PRESETS[preset];
        isCameraTransitioning = true;
        requestRender();
      },
      requestRender,
    };

    // Initial render
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      if (currentAssembly) currentAssembly.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      plinthTopGeo.dispose();
      rimRingGeo.dispose();
      baseFootGeo.dispose();
      runnerGeo.dispose();
      materials.dispose();
      textures.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      sceneControllerRef.current = null;
    };
    // Mount WebGL scene once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync props to live Three.js controller without recreating the canvas
  useEffect(() => {
    sceneControllerRef.current?.loadRecipeDish(recipe);
  }, [recipe]);

  useEffect(() => {
    sceneControllerRef.current?.requestRender();
  }, [explodeFactor, autoSpin]);

  useEffect(() => {
    sceneControllerRef.current?.applyFinish(finishPreset);
  }, [finishPreset]);

  useEffect(() => {
    sceneControllerRef.current?.applyLighting(lightingPreset);
  }, [lightingPreset]);

  useEffect(() => {
    if (cameraPresetSeq > 0) {
      sceneControllerRef.current?.triggerCameraPreset(cameraPreset);
    }
  }, [cameraPreset, cameraPresetSeq]);

  if (webglError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f3efe5] text-[#252b25] p-8 text-center">
        <img
          src={recipe.image}
          alt={recipe.name}
          referrerPolicy="no-referrer"
          className="w-64 h-48 object-cover rounded-xl mb-4 shadow-sm"
        />
        <p className="font-display text-2xl font-semibold mb-1">{recipe.name}</p>
        <p className="text-sm text-[#666d63]">
          Interactive 3D view requires WebGL support in this browser.
        </p>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full select-none" aria-label={`3D view of ${recipe.name}`} />;
}
