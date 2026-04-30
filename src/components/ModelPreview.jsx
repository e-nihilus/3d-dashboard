import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

function getExtension(url) {
  return url.split('.').pop().split('?')[0].toLowerCase();
}

function loadModel(url) {
  const ext = getExtension(url);

  if (ext === 'glb' || ext === 'gltf') {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
    });
  }

  if (ext === 'obj') {
    const loader = new OBJLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  if (ext === 'fbx') {
    const loader = new FBXLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  return Promise.reject(new Error(`Unsupported format: ${ext}`));
}

function cleanupObject3D(object) {
  object.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose();
    }
    const mat = node.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => {
        if (m.map) m.map.dispose();
        if (m.normalMap) m.normalMap.dispose();
        if (m.roughnessMap) m.roughnessMap.dispose();
        if (m.metalnessMap) m.metalnessMap.dispose();
        if (m.emissiveMap) m.emissiveMap.dispose();
        m.dispose();
      });
    } else if (mat) {
      if (mat.map) mat.map.dispose();
      if (mat.normalMap) mat.normalMap.dispose();
      if (mat.roughnessMap) mat.roughnessMap.dispose();
      if (mat.metalnessMap) mat.metalnessMap.dispose();
      if (mat.emissiveMap) mat.emissiveMap.dispose();
      mat.dispose();
    }
  });
}

function fitCameraToObject(object, camera, controls, floor) {
  const bounds = new THREE.Box3().setFromObject(object);
  if (bounds.isEmpty()) {
    camera.position.set(0, 1.4, 5.8);
    controls.target.set(0, 0, 0);
    controls.update();
    return;
  }

  // Center the object at the origin
  const center = bounds.getCenter(new THREE.Vector3());
  object.position.sub(center);

  // Recompute bounds after centering
  const centeredBounds = new THREE.Box3().setFromObject(object);
  const size = centeredBounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Use FOV to calculate the ideal distance so the model fills ~70% of the view
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const distance = (maxDim / 2) / Math.tan(fovRad / 2) * 1.5;

  camera.position.set(distance * 0.65, distance * 0.35, distance * 0.65);
  camera.near = maxDim * 0.001;
  camera.far = maxDim * 200;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = distance * 0.3;
  controls.maxDistance = distance * 5;
  controls.update();

  // Scale grid to match the model
  if (floor) {
    const gridScale = maxDim * 1.5;
    floor.scale.set(gridScale / 28, 1, gridScale / 28);
    floor.position.y = centeredBounds.min.y;
  }
}

const ModelPreview = forwardRef(function ModelPreview({ modelPath, enableZoom = false, enablePan = false, autoRotate = true, onObjectSelected }, ref) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const autoRotateRef = useRef(autoRotate);
  const mainModelRef = useRef(null);
  const importsRef = useRef(new Map());
  const importsGroupRef = useRef(null);
  const hdriRef = useRef({ texture: null, envMap: null, pmremGenerator: null });
  const initialTransformsRef = useRef(new Map());
  const transformControlsRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const onObjectSelectedRef = useRef(onObjectSelected);

  useEffect(() => {
    onObjectSelectedRef.current = onObjectSelected;
  }, [onObjectSelected]);

  const getObjectTransforms = useCallback(() => {
    const transforms = {};
    if (mainModelRef.current) {
      const m = mainModelRef.current;
      transforms.main = {
        position: m.position.toArray(),
        rotation: [m.rotation.x, m.rotation.y, m.rotation.z],
        scale: m.scale.toArray(),
      };
    }
    for (const [id, entry] of importsRef.current) {
      const o = entry.object;
      transforms[id] = {
        position: o.position.toArray(),
        rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
        scale: o.scale.toArray(),
      };
    }
    return transforms;
  }, []);

  const setObjectTransform = useCallback((id, transform) => {
    let target = null;
    if (id === 'main' && mainModelRef.current) {
      target = mainModelRef.current;
    } else {
      const entry = importsRef.current.get(id);
      if (entry) target = entry.object;
    }
    if (!target || !transform) return;
    if (transform.position) target.position.fromArray(transform.position);
    if (transform.rotation) target.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
    if (transform.scale) target.scale.fromArray(transform.scale);
  }, []);

  const captureScreenshot = useCallback(() => {
    const internals = sceneRef.current;
    if (!internals) return null;
    // Render one frame and capture
    internals.renderer.render(internals.scene, internals.camera);
    return internals.renderer.domElement.toDataURL('image/png');
  }, []);

  useImperativeHandle(ref, () => ({
    getScene: () => sceneRef.current,
    addImportedModel,
    removeImportedModel,
    clearImportedModels,
    setHdri,
    clearHdri,
    getImportedModels: () => Array.from(importsRef.current.keys()),
    selectObject: (id) => selectObjectById(id),
    deselectObject,
    restoreObject,
    setTransformMode: (mode) => {
      if (transformControlsRef.current) transformControlsRef.current.setMode(mode);
    },
    getObjectTransforms,
    setObjectTransform,
    captureScreenshot,
  }));

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const addImportedModel = useCallback(async (url, meta) => {
    const internals = sceneRef.current;
    if (!internals) return null;

    const id = meta?.id || `import-${Date.now()}`;

    try {
      const object = await loadModel(url);
      object.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      // Scale relative to main model
      const mainBounds = mainModelRef.current
        ? new THREE.Box3().setFromObject(mainModelRef.current)
        : null;
      const mainSize = mainBounds
        ? mainBounds.getSize(new THREE.Vector3())
        : new THREE.Vector3(2, 2, 2);
      const mainMaxDim = Math.max(mainSize.x, mainSize.y, mainSize.z);

      const importBounds = new THREE.Box3().setFromObject(object);
      const importSize = importBounds.getSize(new THREE.Vector3());
      const importMaxDim = Math.max(importSize.x, importSize.y, importSize.z);

      if (importMaxDim > 0) {
        const targetSize = mainMaxDim * 0.35;
        const scaleFactor = targetSize / importMaxDim;
        object.scale.multiplyScalar(scaleFactor);
      }

      // Place on floor, offset from center
      const importCount = importsRef.current.size;
      const offsetDir = importCount % 2 === 0 ? 1 : -1;
      const offsetAmount = mainMaxDim * 0.6 * (Math.floor(importCount / 2) + 1);
      object.position.set(offsetDir * offsetAmount, 0, 0);

      // Align to floor
      const placedBounds = new THREE.Box3().setFromObject(object);
      const floor = internals.scene.getObjectByName('floor');
      const floorY = floor ? floor.position.y : 0;
      object.position.y -= placedBounds.min.y - floorY;

      object.userData = { importId: id, ...meta };
      importsGroupRef.current?.add(object);
      importsRef.current.set(id, { object, meta });

      // Store initial transform for restore
      initialTransformsRef.current.set(id, {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone(),
      });

      return id;
    } catch (err) {
      console.error('Failed to import model:', err);
      return null;
    }
  }, []);

  const removeImportedModel = useCallback((id) => {
    const entry = importsRef.current.get(id);
    if (!entry) return;

    importsGroupRef.current?.remove(entry.object);
    cleanupObject3D(entry.object);
    importsRef.current.delete(id);
    initialTransformsRef.current.delete(id);
  }, []);

  const clearImportedModels = useCallback(() => {
    for (const [id] of importsRef.current) {
      removeImportedModel(id);
    }
  }, [removeImportedModel]);

  const setHdri = useCallback(async (url) => {
    const internals = sceneRef.current;
    if (!internals) return;

    if (!hdriRef.current.pmremGenerator) {
      hdriRef.current.pmremGenerator = new THREE.PMREMGenerator(internals.renderer);
      hdriRef.current.pmremGenerator.compileEquirectangularShader();
    }

    const prevTexture = hdriRef.current.texture;
    const prevEnvMap = hdriRef.current.envMap;

    const rgbeLoader = new RGBELoader();
    return new Promise((resolve, reject) => {
      rgbeLoader.load(
        url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          const envMap = hdriRef.current.pmremGenerator.fromEquirectangular(texture).texture;

          internals.scene.background = texture;
          internals.scene.environment = envMap;

          hdriRef.current.texture = texture;
          hdriRef.current.envMap = envMap;

          // Dispose previous textures after the new ones are applied
          prevTexture?.dispose();
          prevEnvMap?.dispose();

          resolve();
        },
        undefined,
        (err) => {
          console.error('Failed to load HDRI:', err);
          reject(err);
        },
      );
    });
  }, []);

  const clearHdri = useCallback(() => {
    const internals = sceneRef.current;
    if (!internals) return;

    if (hdriRef.current.texture) {
      hdriRef.current.texture.dispose();
      hdriRef.current.texture = null;
    }
    if (hdriRef.current.envMap) {
      hdriRef.current.envMap.dispose();
      hdriRef.current.envMap = null;
    }

    internals.scene.background = new THREE.Color('#dce8ed');
    internals.scene.environment = null;
  }, []);

  const selectObjectById = useCallback((id) => {
    const internals = sceneRef.current;
    if (!internals || !transformControlsRef.current) return;

    let target = null;
    if (id === 'main' && mainModelRef.current) {
      target = mainModelRef.current;
    } else {
      const entry = importsRef.current.get(id);
      if (entry) target = entry.object;
    }

    if (target) {
      selectedObjectRef.current = target;
      transformControlsRef.current.attach(target);
      autoRotateRef.current = false;
      onObjectSelectedRef.current?.(id);
    }
  }, []);

  const deselectObject = useCallback(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
    selectedObjectRef.current = null;
    onObjectSelectedRef.current?.(null);
  }, []);

  const restoreObject = useCallback((id) => {
    let target = null;
    if (id === 'main' && mainModelRef.current) {
      target = mainModelRef.current;
    } else {
      const entry = importsRef.current.get(id);
      if (entry) target = entry.object;
    }

    const saved = initialTransformsRef.current.get(id);
    if (target && saved) {
      target.position.copy(saved.position);
      target.rotation.copy(saved.rotation);
      target.scale.copy(saved.scale);
      // Re-attach transform controls if this object is currently selected
      if (selectedObjectRef.current === target && transformControlsRef.current) {
        transformControlsRef.current.detach();
        transformControlsRef.current.attach(target);
      }
    }
  }, []);

  const handleCanvasClick = useCallback((event) => {
    const internals = sceneRef.current;
    if (!internals) return;

    // Ignore if dragging transform controls
    if (transformControlsRef.current?.dragging) return;

    const rect = internals.renderer.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, internals.camera);

    // Collect all selectable objects (main model + imports)
    const selectables = [];
    if (mainModelRef.current) selectables.push(mainModelRef.current);
    for (const [, entry] of importsRef.current) {
      selectables.push(entry.object);
    }

    // Gather all meshes with a reference to their root selectable
    const meshToRoot = [];
    for (const root of selectables) {
      root.traverse((node) => {
        if (node.isMesh) meshToRoot.push({ mesh: node, root });
      });
    }

    const meshes = meshToRoot.map((e) => e.mesh);
    const intersects = raycasterRef.current.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const hit = meshToRoot.find((e) => e.mesh === hitMesh);
      if (hit) {
        const root = hit.root;
        const id = root === mainModelRef.current
          ? 'main'
          : root.userData?.importId || null;
        if (id) {
          selectedObjectRef.current = root;
          transformControlsRef.current?.attach(root);
          autoRotateRef.current = false;
          onObjectSelectedRef.current?.(id);
        }
      }
    } else {
      deselectObject();
    }
  }, [deselectObject]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modelPath) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#dce8ed');

    // Groups for organization
    const importsGroup = new THREE.Group();
    importsGroup.name = 'importsGroup';
    scene.add(importsGroup);
    importsGroupRef.current = importsGroup;

    // Lights — stored by name so they can be accessed externally
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.72);
    ambientLight.name = 'ambient';

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.05);
    keyLight.position.set(5.4, 8.6, 7.2);
    keyLight.name = 'keyLight';

    const fillLight = new THREE.DirectionalLight('#8dd7d2', 0.52);
    fillLight.position.set(-4.2, 4.3, -5.7);
    fillLight.name = 'fillLight';

    const rimLight = new THREE.PointLight('#ffffff', 0.6);
    rimLight.position.set(-2, 5, -6);
    rimLight.name = 'rimLight';

    const hemiLight = new THREE.HemisphereLight('#f0f5ff', '#444444', 0);
    hemiLight.name = 'hemiLight';
    hemiLight.visible = false;

    // Grid floor
    const floor = new THREE.GridHelper(28, 28, '#2d3f45', '#a2b8be');
    floor.position.y = -0.001;
    floor.material.opacity = 0.3;
    floor.material.transparent = true;
    floor.name = 'floor';

    scene.add(ambientLight, keyLight, fillLight, rimLight, hemiLight, floor);

    // Camera
    const camera = new THREE.PerspectiveCamera(58, 1, 0.03, 2400);
    camera.position.set(0, 1.4, 5.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = enablePan;
    controls.enableZoom = enableZoom;
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

    // Transform controls for moving objects
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate');
    transformControls.setSize(0.8);
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Disable orbit controls while dragging transform
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });

    // Expose scene internals
    sceneRef.current = { scene, camera, renderer, controls, transformControls };

    // Sizing
    const applySize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    container.appendChild(renderer.domElement);
    applySize();

    // Click to select objects
    renderer.domElement.addEventListener('click', handleCanvasClick);

    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(container);

    // Render loop
    let frameId = null;

    const tick = () => {
      controls.update();

      // Auto-rotate
      if (mainModelRef.current && autoRotateRef.current) {
        mainModelRef.current.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(tick);
    };
    tick();

    // Load model
    let cancelled = false;

    loadModel(modelPath)
      .then((object) => {
        if (cancelled) {
          cleanupObject3D(object);
          return;
        }
        mainModelRef.current = object;
        object.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        scene.add(object);
        fitCameraToObject(object, camera, controls, floor);

        // Store initial transform for main model
        initialTransformsRef.current.set('main', {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone(),
        });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load 3D model:', err);
        }
      });

    // Cleanup
    return () => {
      cancelled = true;
      sceneRef.current = null;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();

      // Cleanup main model
      if (mainModelRef.current) {
        scene.remove(mainModelRef.current);
        cleanupObject3D(mainModelRef.current);
        mainModelRef.current = null;
      }

      // Cleanup imports
      for (const [, entry] of importsRef.current) {
        importsGroup.remove(entry.object);
        cleanupObject3D(entry.object);
      }
      importsRef.current.clear();
      importsGroupRef.current = null;
      initialTransformsRef.current.clear();

      // Cleanup HDRI
      if (hdriRef.current.texture) {
        hdriRef.current.texture.dispose();
        hdriRef.current.texture = null;
      }
      if (hdriRef.current.envMap) {
        hdriRef.current.envMap.dispose();
        hdriRef.current.envMap = null;
      }
      if (hdriRef.current.pmremGenerator) {
        hdriRef.current.pmremGenerator.dispose();
        hdriRef.current.pmremGenerator = null;
      }

      // Cleanup transform controls
      transformControls.detach();
      transformControls.dispose();
      transformControlsRef.current = null;
      selectedObjectRef.current = null;

      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, enableZoom, enablePan, handleCanvasClick]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
      }}
    />
  );
});

export default ModelPreview;
