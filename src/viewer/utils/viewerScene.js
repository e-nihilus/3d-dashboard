import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export const ROTATION_STEP_DEG = 8;
const DEFAULT_STAGE_BACKGROUND_COLOR = '#dce8ed';
const DEFAULT_LIGHT_ADJUSTMENTS = {
  rotationY: 0,
  exposure: 1,
  envIntensity: 1,
  bgIntensity: 1,
  bgBlur: 0,
};
const VIEWER_CUSTOM_LIGHT_SOURCE_KEY = 'viewerCustomLightSourceId';
const VIEWER_CUSTOM_LIGHTS_GROUP_NAME = 'viewer-custom-lights-group';

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatVector(valueX, valueY, valueZ) {
  return `x: ${valueX.toFixed(2)}, y: ${valueY.toFixed(2)}, z: ${valueZ.toFixed(2)}`;
}

export function formatRotation(valueX, valueY, valueZ) {
  return `x: ${valueX.toFixed(1)}deg, y: ${valueY.toFixed(1)}deg, z: ${valueZ.toFixed(1)}deg`;
}

export function getZoomProgressFromDistance(controls, distance) {
  const distanceRange = Math.max(controls.maxDistance - controls.minDistance, 0.0001);
  return clamp(((controls.maxDistance - distance) / distanceRange) * 100, 0, 100);
}

export function cleanupObject3D(object) {
  object.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose();
    }
    const meshMaterial = node.material;
    if (Array.isArray(meshMaterial)) {
      meshMaterial.forEach((material) => material.dispose());
    } else if (meshMaterial) {
      meshMaterial.dispose();
    }
  });
  if (typeof object.dispose === 'function') {
    object.dispose();
  }
}

const TARGET_MODEL_MAX_DIMENSION = 4;

export function normalizeObjectScale(object) {
  const bounds = new THREE.Box3().setFromObject(object);
  if (bounds.isEmpty()) return;
  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim <= 0) return;
  const scale = TARGET_MODEL_MAX_DIMENSION / maxDim;
  object.scale.multiplyScalar(scale);
  object.updateMatrixWorld(true);
  const scaledBounds = new THREE.Box3().setFromObject(object);
  const center = scaledBounds.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= scaledBounds.min.y;
}

export async function loadViewerAsset(asset) {
  if (asset.format === 'glb' || asset.format === 'gltf') {
    const gltfLoader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      gltfLoader.load(asset.url, resolve, undefined, reject);
    });
    return gltf.scene;
  }
  throw new Error(`Unsupported local asset format: ${asset.format}`);
}

function setupDefaultLights(scene) {
  scene.background = new THREE.Color(DEFAULT_STAGE_BACKGROUND_COLOR);
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.72);
  const keyLight = new THREE.DirectionalLight('#ffffff', 1.05);
  keyLight.position.set(5.4, 8.6, 7.2);
  const fillLight = new THREE.DirectionalLight('#8dd7d2', 0.52);
  fillLight.position.set(-4.2, 4.3, -5.7);
  const floor = new THREE.GridHelper(28, 28, '#2d3f45', '#a2b8be');
  floor.position.y = -0.001;
  floor.material.opacity = 0.3;
  floor.material.transparent = true;
  scene.add(ambientLight, keyLight, fillLight, floor);
}

export function createViewerBootstrap(stageElement) {
  const scene = new THREE.Scene();
  setupDefaultLights(scene);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.03, 2400);
  camera.position.set(0, 1.4, 5.8);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.target.set(0, 0.8, 0);
  controls.minDistance = 0.35;
  controls.maxDistance = 180;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_ROTATE,
  };
  controls.update();
  const applyStageSize = () => {
    const width = stageElement.clientWidth;
    const height = stageElement.clientHeight;
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  stageElement.appendChild(renderer.domElement);
  applyStageSize();
  const resizeObserver = new ResizeObserver(() => { applyStageSize(); });
  resizeObserver.observe(stageElement);
  const cleanupCallbacks = [
    () => resizeObserver.disconnect(),
    () => { if (renderer.domElement.parentNode === stageElement) stageElement.removeChild(renderer.domElement); },
    () => controls.dispose(),
    () => pmremGenerator.dispose(),
    () => renderer.dispose(),
  ];
  return { scene, camera, renderer, controls, pmremGenerator, cleanupCallbacks };
}

export async function applyViewerEnvironmentLight(bootstrap, lightAsset, environmentCache, adjustments = DEFAULT_LIGHT_ADJUSTMENTS) {
  if (lightAsset.format !== 'hdr') throw new Error(`Unsupported light format: ${lightAsset.format}`);
  let environmentTexture = environmentCache.get(lightAsset.id);
  if (!environmentTexture) {
    const loader = new RGBELoader();
    const sourceTexture = await loader.loadAsync(lightAsset.url);
    sourceTexture.mapping = THREE.EquirectangularReflectionMapping;
    environmentTexture = bootstrap.pmremGenerator.fromEquirectangular(sourceTexture).texture;
    sourceTexture.dispose();
    environmentCache.set(lightAsset.id, environmentTexture);
  }
  bootstrap.scene.environment = environmentTexture;
  bootstrap.scene.background = environmentTexture;
  bootstrap.scene.environmentIntensity = adjustments.envIntensity ?? DEFAULT_LIGHT_ADJUSTMENTS.envIntensity;
  bootstrap.scene.backgroundIntensity = adjustments.bgIntensity ?? DEFAULT_LIGHT_ADJUSTMENTS.bgIntensity;
  bootstrap.scene.backgroundBlurriness = adjustments.bgBlur ?? DEFAULT_LIGHT_ADJUSTMENTS.bgBlur;
  const rotationY = adjustments.rotationY ?? DEFAULT_LIGHT_ADJUSTMENTS.rotationY;
  const rotationRadians = THREE.MathUtils.degToRad(rotationY);
  bootstrap.scene.environmentRotation.set(0, rotationRadians, 0);
  bootstrap.scene.backgroundRotation.set(0, rotationRadians, 0);
  bootstrap.renderer.toneMappingExposure = adjustments.exposure ?? DEFAULT_LIGHT_ADJUSTMENTS.exposure;
}

export function clearViewerEnvironmentLight(bootstrap) {
  bootstrap.scene.environment = null;
  bootstrap.scene.background = new THREE.Color(DEFAULT_STAGE_BACKGROUND_COLOR);
  bootstrap.scene.environmentIntensity = 1;
  bootstrap.scene.backgroundIntensity = 1;
  bootstrap.scene.backgroundBlurriness = 0;
  bootstrap.scene.environmentRotation.set(0, 0, 0);
  bootstrap.scene.backgroundRotation.set(0, 0, 0);
  bootstrap.renderer.toneMappingExposure = 1;
}

export function clearViewerCustomLights(bootstrap) {
  const existingGroup = bootstrap.scene.getObjectByName(VIEWER_CUSTOM_LIGHTS_GROUP_NAME);
  if (existingGroup) {
    bootstrap.scene.remove(existingGroup);
    cleanupObject3D(existingGroup);
  }
}

export function applyViewerCustomLights(bootstrap, sources, activeSourceId, options = {}) {
  clearViewerCustomLights(bootstrap);
  const sourceHandleMap = new Map();
  if (sources.length === 0) return sourceHandleMap;
  const showHandles = options.showHandles ?? false;
  const customLightsGroup = new THREE.Group();
  customLightsGroup.name = VIEWER_CUSTOM_LIGHTS_GROUP_NAME;
  sources.forEach((source) => {
    const lightColor = new THREE.Color(source.color);
    const position = new THREE.Vector3(source.position.x, source.position.y, source.position.z);
    const lightRange = clamp(source.size * 8, 0.4, 120);
    const isActiveSource = source.id === activeSourceId;
    const light = new THREE.PointLight(lightColor, source.intensity, lightRange, 2);
    light.position.copy(position);
    customLightsGroup.add(light);
    if (!showHandles) return;
    const markerRadius = clamp(0.08 + source.size * 0.035, 0.09, 0.44);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(markerRadius, 20, 20),
      new THREE.MeshBasicMaterial({ color: lightColor, transparent: true, opacity: isActiveSource ? 0.96 : 0.84 })
    );
    marker.position.copy(position);
    marker.userData[VIEWER_CUSTOM_LIGHT_SOURCE_KEY] = source.id;
    customLightsGroup.add(marker);
    const hitRadius = clamp(markerRadius * 2.4, 0.22, 0.92);
    const hitbox = new THREE.Mesh(
      new THREE.SphereGeometry(hitRadius, 10, 10),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitbox.position.copy(position);
    hitbox.userData[VIEWER_CUSTOM_LIGHT_SOURCE_KEY] = source.id;
    customLightsGroup.add(hitbox);
    sourceHandleMap.set(source.id, hitbox);
  });
  bootstrap.scene.add(customLightsGroup);
  return sourceHandleMap;
}

export function getViewerCustomLightSourceIdFromObject(object) {
  if (!object) return null;
  let current = object;
  while (current) {
    const sourceId = current.userData?.[VIEWER_CUSTOM_LIGHT_SOURCE_KEY];
    if (typeof sourceId === 'string' && sourceId.length > 0) return sourceId;
    current = current.parent;
  }
  return null;
}

export function disposeViewerEnvironmentCache(environmentCache) {
  environmentCache.forEach((texture) => { texture.dispose(); });
  environmentCache.clear();
}

export function createTransformControls(camera, rendererElement, orbitControls) {
  const tc = new TransformControls(camera, rendererElement);
  tc.setMode('translate');
  tc.setSize(0.8);
  tc.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;
  });
  return tc;
}

export async function loadHdriFromUrl(bootstrap, url) {
  const rgbeLoader = new RGBELoader();
  const texture = await new Promise((resolve, reject) => {
    rgbeLoader.load(url, resolve, undefined, reject);
  });
  texture.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = bootstrap.pmremGenerator.fromEquirectangular(texture).texture;
  bootstrap.scene.background = texture;
  bootstrap.scene.environment = envMap;
  return { texture, envMap };
}

export function clearHdri(bootstrap) {
  bootstrap.scene.background = new THREE.Color('#dce8ed');
  bootstrap.scene.environment = null;
}

export function fitCameraToObject(object, camera, controls) {
  const bounds = new THREE.Box3().setFromObject(object);
  if (bounds.isEmpty()) {
    camera.position.set(0, 1.2, 5.8);
    controls.target.set(0, 0.8, 0);
    controls.update();
    return { position: camera.position.clone(), target: controls.target.clone(), distance: camera.position.distanceTo(controls.target) };
  }
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  const boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());
  const fovRadians = THREE.MathUtils.degToRad(camera.fov);
  const halfFov = fovRadians * 0.5;
  const distanceFromFov = maxDimension <= 0 ? 4.6 : (maxDimension * 0.62) / Math.tan(halfFov);
  const distanceFromSphere = boundingSphere.radius / Math.sin(halfFov);
  const distance = Math.max(distanceFromFov, distanceFromSphere * 1.1);
  const normalizedDistance = clamp(distance, 1.2, 120);
  const normalizedHeight = Math.max(size.y * 0.42, 0.65);
  camera.position.set(center.x + normalizedDistance * 0.8, center.y + normalizedHeight, center.z + normalizedDistance * 1.12);
  controls.target.copy(center);
  controls.update();
  return { position: camera.position.clone(), target: controls.target.clone(), distance: camera.position.distanceTo(controls.target) };
}

export function buildEditorViewPreset(object) {
  const bounds = new THREE.Box3().setFromObject(object);
  if (bounds.isEmpty()) {
    return { center: new THREE.Vector3(0, 0.8, 0), distance: 5.6, height: 1.2 };
  }
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 1);
  return { center, distance: clamp(maxDimension * 1.35, 2.2, 88), height: clamp(size.y * 0.52, 0.7, 12) };
}

export function applyEditorView(bootstrap, preset, viewId) {
  const { camera, controls } = bootstrap;
  const target = preset.center;
  if (viewId === 'top') {
    camera.position.set(target.x + preset.distance * 0.14, target.y + preset.distance * 1.38, target.z + preset.distance * 0.14);
    controls.target.copy(target);
    controls.update();
    return;
  }
  const azimuthDegByView = { front: 90, right: 0, back: -90, left: 180 };
  const azimuthDeg = viewId === 'isometric' ? 42 : azimuthDegByView[viewId];
  const azimuthRadians = THREE.MathUtils.degToRad(azimuthDeg);
  camera.position.set(target.x + Math.cos(azimuthRadians) * preset.distance, target.y + preset.height, target.z + Math.sin(azimuthRadians) * preset.distance);
  controls.target.copy(target);
  controls.update();
}

export function repositionCamera(view, target) {
  const offset = view.camera.position.clone().sub(view.controls.target);
  view.controls.target.copy(target);
  view.camera.position.copy(target).add(offset);
  view.controls.update();
}

export function buildSeedSceneAssets(creationId, resolvedAsset) {
  if (!resolvedAsset) return [];
  if (resolvedAsset.kind === 'scenario') {
    return [{ id: `${creationId}-scenario-root`, name: resolvedAsset.title, type: 'scenario', origin: 'scene', position: formatVector(0, 0, 0), rotation: formatRotation(0, 0, 0), scale: formatVector(1, 1, 1) }];
  }
  if (resolvedAsset.kind === 'light') return [];
  return [{ id: `${creationId}-object-main`, name: resolvedAsset.title, type: 'object', origin: 'scene', position: formatVector(0, 0, 0), rotation: formatRotation(0, 0, 0), scale: formatVector(1, 1, 1) }];
}

export function buildAppendedAsset(sequence, id, name, type, origin) {
  const x = ((sequence % 5) - 2) * 0.56;
  const z = (((sequence * 3) % 5) - 2) * 0.48;
  const yRotation = ((sequence * 17) % 60) - 30;
  const scale = 0.88 + (sequence % 4) * 0.06;
  return { id, name, type, origin, position: formatVector(x, 0, z), rotation: formatRotation(0, yRotation, 0), scale: formatVector(scale, scale, scale) };
}
