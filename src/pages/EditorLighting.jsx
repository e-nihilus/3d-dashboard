import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';
import PolyHavenPanel from '../components/PolyHavenPanel';

const ENV_PRESETS = [
  {
    icon: 'portrait_lighting', label: 'Studio Pro',
    background: '#dce8ed',
    ambient: { color: '#ffffff', intensity: 0.72 },
    key: { color: '#ffffff', intensity: 1.05, position: [5.4, 8.6, 7.2] },
    fill: { color: '#8dd7d2', intensity: 0.52, position: [-4.2, 4.3, -5.7] },
    exposure: 1.0,
  },
  {
    icon: 'wb_twilight', label: 'Golden Hour',
    background: '#f5e6d3',
    ambient: { color: '#ffe0b2', intensity: 0.5 },
    key: { color: '#ff9800', intensity: 1.3, position: [8, 3, 5] },
    fill: { color: '#ff6f00', intensity: 0.35, position: [-5, 2, -3] },
    exposure: 1.1,
  },
  {
    icon: 'cloud', label: 'Overcast',
    background: '#d5dde2',
    ambient: { color: '#cfd8dc', intensity: 1.0 },
    key: { color: '#b0bec5', intensity: 0.6, position: [0, 10, 0] },
    fill: { color: '#90a4ae', intensity: 0.4, position: [-3, 4, -4] },
    exposure: 0.9,
  },
  {
    icon: 'nightlight', label: 'Neon Night',
    background: '#1a1a2e',
    ambient: { color: '#1a237e', intensity: 0.3 },
    key: { color: '#e040fb', intensity: 1.2, position: [5, 6, 4] },
    fill: { color: '#00e5ff', intensity: 0.8, position: [-4, 3, -5] },
    exposure: 0.8,
  },
  {
    icon: 'wb_sunny', label: 'Daylight',
    background: '#e3f2fd',
    ambient: { color: '#ffffff', intensity: 0.9 },
    key: { color: '#fff9c4', intensity: 1.4, position: [6, 10, 4] },
    fill: { color: '#bbdefb', intensity: 0.3, position: [-4, 5, -6] },
    exposure: 1.2,
  },
  {
    icon: 'park', label: 'Outdoor',
    background: '#e8f5e9',
    ambient: { color: '#c8e6c9', intensity: 0.7 },
    key: { color: '#fff176', intensity: 1.1, position: [7, 9, 5] },
    fill: { color: '#a5d6a7', intensity: 0.4, position: [-5, 3, -4] },
    exposure: 1.0,
  },
];

const INITIAL_LIGHTS = [
  { name: 'Key Light', type: 'Directional', sceneName: 'keyLight', icon: 'light_mode', intensity: 80, color: '#fff5e6', enabled: true },
  { name: 'Fill Light', type: 'Area', sceneName: 'fillLight', icon: 'crop_square', intensity: 40, color: '#e6f0ff', enabled: true },
  { name: 'Rim Light', type: 'Point', sceneName: 'rimLight', icon: 'circle', intensity: 60, color: '#ffffff', enabled: true },
  { name: 'Ambient', type: 'Hemisphere', sceneName: 'hemiLight', icon: 'wb_iridescent', intensity: 25, color: '#f0f5ff', enabled: false },
];

const LIGHT_COLORS = ['#fff5e6', '#e6f0ff', '#ffffff', '#ffe4e1', '#e8f5e9', '#fce4ec'];

const MAX_INTENSITIES = {
  keyLight: 2.5,
  fillLight: 1.5,
  rimLight: 2.0,
  hemiLight: 1.5,
};

function getSceneLight(previewRef, sceneName) {
  const internals = previewRef.current?.getScene?.();
  if (!internals) return null;
  return internals.scene.getObjectByName(sceneName) ?? null;
}

export default function EditorLighting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelPath = searchParams.get('model') || '';
  const title = searchParams.get('title') || 'Untitled Model';
  const previewRef = useRef(null);

  const [selectedEnv, setSelectedEnv] = useState(0);
  const [selectedLight, setSelectedLight] = useState(0);
  const [lights, setLights] = useState(INITIAL_LIGHTS);

  const [globalExposure, setGlobalExposure] = useState(65);
  const [globalContrast, setGlobalContrast] = useState(50);
  const [globalSaturation, setGlobalSaturation] = useState(55);

  const [shadowSoftness, setShadowSoftness] = useState(65);
  const [temperature, setTemperature] = useState(50);
  const [radius, setRadius] = useState(30);

  const [castShadows, setCastShadows] = useState(true);
  const [contactShadows, setContactShadows] = useState(true);
  const [ambientOcclusion, setAmbientOcclusion] = useState(false);

  const [showGizmos, setShowGizmos] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const [activeHdriId, setActiveHdriId] = useState(null);

  const handleApplyHdri = useCallback(async (hdriInfo) => {
    try {
      await previewRef.current?.setHdri(hdriInfo.hdrUrl);
      setActiveHdriId(hdriInfo.id);
    } catch {
      // HDRI loading failed
    }
  }, []);

  const handleResetHdri = useCallback(() => {
    previewRef.current?.clearHdri();
    setActiveHdriId(null);
    // Re-apply the current preset background
    const preset = ENV_PRESETS[selectedEnv];
    const internals = previewRef.current?.getScene?.();
    if (internals && preset) {
      internals.scene.background = new THREE.Color(preset.background);
      internals.scene.environment = null;
    }
  }, [selectedEnv]);

  // Apply a single light change to the Three.js scene
  const applyLightToScene = useCallback((sceneName, intensity, color, enabled) => {
    const light = getSceneLight(previewRef, sceneName);
    if (!light) return;
    const max = MAX_INTENSITIES[sceneName] || 1.5;
    light.intensity = (intensity / 100) * max;
    light.color.set(color);
    light.visible = enabled;
  }, []);

  // Sync all lights to the scene whenever they change
  useEffect(() => {
    lights.forEach((l) => applyLightToScene(l.sceneName, l.intensity, l.color, l.enabled));
  }, [lights, applyLightToScene]);

  // Apply global exposure
  useEffect(() => {
    const internals = previewRef.current?.getScene?.();
    if (!internals) return;
    internals.renderer.toneMappingExposure = 0.4 + (globalExposure / 100) * 1.6;
  }, [globalExposure]);

  // Apply environment preset
  const applyEnvPreset = useCallback((idx) => {
    setSelectedEnv(idx);
    const preset = ENV_PRESETS[idx];
    const internals = previewRef.current?.getScene?.();
    if (!internals) return;

    internals.scene.background = new THREE.Color(preset.background);
    internals.renderer.toneMappingExposure = preset.exposure;
    setGlobalExposure(Math.round(((preset.exposure - 0.4) / 1.6) * 100));

    const ambient = internals.scene.getObjectByName('ambient');
    if (ambient) {
      ambient.color.set(preset.ambient.color);
      ambient.intensity = preset.ambient.intensity;
    }

    const keyLight = internals.scene.getObjectByName('keyLight');
    if (keyLight) {
      keyLight.color.set(preset.key.color);
      keyLight.intensity = preset.key.intensity;
      keyLight.position.set(...preset.key.position);
    }

    const fillLight = internals.scene.getObjectByName('fillLight');
    if (fillLight) {
      fillLight.color.set(preset.fill.color);
      fillLight.intensity = preset.fill.intensity;
      fillLight.position.set(...preset.fill.position);
    }

    // Sync the UI state for key and fill
    setLights((prev) =>
      prev.map((l) => {
        if (l.sceneName === 'keyLight') {
          return { ...l, intensity: Math.round((preset.key.intensity / MAX_INTENSITIES.keyLight) * 100), color: preset.key.color };
        }
        if (l.sceneName === 'fillLight') {
          return { ...l, intensity: Math.round((preset.fill.intensity / MAX_INTENSITIES.fillLight) * 100), color: preset.fill.color };
        }
        return l;
      }),
    );
  }, []);

  // Update a specific light property
  const updateLight = useCallback((idx, changes) => {
    setLights((prev) => prev.map((l, i) => (i === idx ? { ...l, ...changes } : l)));
  }, []);

  // Toggle light on/off
  const toggleLight = useCallback((idx) => {
    setLights((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, enabled: !l.enabled } : l)),
    );
  }, []);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => {
      const next = !prev;
      const floor = getSceneLight(previewRef, 'floor');
      if (floor) floor.visible = next;
      return next;
    });
  }, []);

  // Toggle shadow maps
  const toggleCastShadows = useCallback((value) => {
    setCastShadows(value);
    const internals = previewRef.current?.getScene?.();
    if (!internals) return;
    internals.renderer.shadowMap.enabled = value;
    internals.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = value;
        node.receiveShadow = value;
      }
    });
    internals.renderer.shadowMap.needsUpdate = true;
  }, []);

  const current = lights[selectedLight];

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 lg:p-8 gap-6 max-w-[1920px] mx-auto w-full overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/editor?model=${encodeURIComponent(modelPath)}&title=${encodeURIComponent(title)}`)}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline text-xl font-bold text-on-surface">{title}</h1>
              <p className="text-on-surface-variant text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">lightbulb</span>
                Lighting Editor
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 flex-1 items-start">
          {/* Left — Light List */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Light Sources */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">lightbulb</span>
                  <h3 className="font-headline font-bold text-on-surface text-sm">Light Sources</h3>
                </div>
              </div>

              {lights.map((light, idx) => (
                <button
                  key={light.name}
                  onClick={() => setSelectedLight(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    selectedLight === idx ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-container'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${light.enabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-lg">{light.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{light.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{light.type} • {light.intensity}%</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLight(idx); }}
                    className={`w-2 h-2 rounded-full ${light.enabled ? 'bg-primary-container' : 'bg-slate-300'}`}
                    title={light.enabled ? 'Disable' : 'Enable'}
                  ></button>
                </button>
              ))}
            </div>

            {/* Global Settings */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">settings</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Global Settings</h3>
              </div>
              {[
                { label: 'Exposure', value: globalExposure, onChange: setGlobalExposure },
                { label: 'Contrast', value: globalContrast, onChange: setGlobalContrast },
                { label: 'Saturation', value: globalSaturation, onChange: setGlobalSaturation },
              ].map((prop) => (
                <div key={prop.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span>{prop.label}</span>
                    <span className="text-primary">{prop.value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={prop.value}
                    onChange={(e) => prop.onChange(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-surface-container-highest cursor-pointer accent-primary-container"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Center — 3D Viewport */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative h-[400px] lg:h-[580px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 group">
              {modelPath ? (
                <ModelPreview ref={previewRef} modelPath={modelPath} enableZoom enablePan autoRotate={autoRotate} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <span className="material-symbols-outlined text-6xl mb-4 block">view_in_ar</span>
                    <p className="font-headline font-bold text-lg">No model loaded</p>
                    <p className="text-sm mt-1">Select a model from the dashboard.</p>
                  </div>
                </div>
              )}

              {/* Viewport HUD */}
              <div className="absolute top-4 left-4 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lighting Preview</span>
              </div>

              {/* Light Gizmo Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel px-5 py-2.5 rounded-full flex items-center gap-6 shadow-2xl z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowGizmos((v) => !v)}
                    className={`material-symbols-outlined transition-colors ${showGizmos ? 'text-amber-500' : 'text-outline hover:text-primary'}`}
                    title="Toggle gizmos"
                  >light_mode</button>
                  <button
                    onClick={() => {
                      const internals = previewRef.current?.getScene?.();
                      if (!internals) return;
                      internals.scene.traverse((node) => {
                        if (node.isMesh && node.name !== 'floor') {
                          node.visible = !node.visible;
                        }
                      });
                    }}
                    className="material-symbols-outlined text-outline hover:text-primary transition-colors"
                    title="Toggle model visibility"
                  >visibility</button>
                  <button
                    onClick={toggleGrid}
                    className={`material-symbols-outlined transition-colors ${showGrid ? 'text-primary' : 'text-outline hover:text-primary'}`}
                    title="Toggle grid"
                  >grid_on</button>
                  <button
                    onClick={() => setAutoRotate((v) => !v)}
                    className={`material-symbols-outlined transition-colors ${autoRotate ? 'text-primary' : 'text-outline hover:text-primary'}`}
                    title={autoRotate ? 'Stop rotation' : 'Start rotation'}
                  >{autoRotate ? 'motion_photos_pause' : '3d_rotation'}</button>
                </div>
                <div className="w-px h-6 bg-outline-variant/30"></div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const internals = previewRef.current?.getScene?.();
                      if (internals) {
                        const offset = internals.camera.position.clone().sub(internals.controls.target);
                        offset.multiplyScalar(0.8);
                        internals.camera.position.copy(internals.controls.target).add(offset);
                        internals.controls.update();
                      }
                    }}
                    className="material-symbols-outlined text-outline hover:text-primary transition-colors"
                    title="Zoom in"
                  >zoom_in</button>
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors" title="Fullscreen">fullscreen</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Light Properties & Environment */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Selected Light Properties */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">tune</span>
                  <h3 className="font-headline font-bold text-on-surface text-sm">{current.name}</h3>
                </div>
                <button
                  onClick={() => toggleLight(selectedLight)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${current.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}
                >
                  {current.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              {[
                { label: 'Intensity', value: current.intensity, onChange: (v) => updateLight(selectedLight, { intensity: v }) },
                { label: 'Shadow Softness', value: shadowSoftness, onChange: setShadowSoftness },
                { label: 'Temperature', value: temperature, onChange: setTemperature },
                { label: 'Radius', value: radius, onChange: setRadius },
              ].map((prop) => (
                <div key={prop.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span>{prop.label}</span>
                    <span className="text-primary">{prop.value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={prop.value}
                    onChange={(e) => prop.onChange(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-surface-container-highest cursor-pointer accent-amber-300"
                  />
                </div>
              ))}

              {/* Light Color */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Light Color</span>
                <div className="flex gap-2">
                  {LIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateLight(selectedLight, { color: c })}
                      className={`w-7 h-7 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${current.color === c ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`}
                      style={{ background: c }}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            {/* Environment Presets */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">wb_sunny</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Environment</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ENV_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.label}
                    onClick={() => applyEnvPreset(idx)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      selectedEnv === idx
                        ? 'bg-primary/10 border-2 border-primary-container text-primary'
                        : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined">{preset.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow Settings */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">shadow</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Shadows</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Cast Shadows', enabled: castShadows, onToggle: () => toggleCastShadows(!castShadows) },
                  { label: 'Contact Shadows', enabled: contactShadows, onToggle: () => setContactShadows(!contactShadows) },
                  { label: 'Ambient Occlusion', enabled: ambientOcclusion, onToggle: () => setAmbientOcclusion(!ambientOcclusion) },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface-variant">{toggle.label}</span>
                    <button
                      onClick={toggle.onToggle}
                      className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${toggle.enabled ? 'bg-primary-container' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${toggle.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Poly Haven HDRI Environment */}
            <PolyHavenPanel
              activeHdriId={activeHdriId}
              onApplyHdri={handleApplyHdri}
              onResetHdri={handleResetHdri}
            />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
