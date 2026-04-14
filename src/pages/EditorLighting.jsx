import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';

const envPresets = [
  { icon: 'portrait_lighting', label: 'Studio Pro', active: true },
  { icon: 'wb_twilight', label: 'Golden Hour', active: false },
  { icon: 'cloud', label: 'Overcast', active: false },
  { icon: 'nightlight', label: 'Neon Night', active: false },
  { icon: 'wb_sunny', label: 'Daylight', active: false },
  { icon: 'park', label: 'Outdoor', active: false },
];

const lights = [
  { name: 'Key Light', type: 'Directional', icon: 'light_mode', intensity: 80, color: '#fff5e6', enabled: true },
  { name: 'Fill Light', type: 'Area', icon: 'crop_square', intensity: 40, color: '#e6f0ff', enabled: true },
  { name: 'Rim Light', type: 'Point', icon: 'circle', intensity: 60, color: '#ffffff', enabled: true },
  { name: 'Ambient', type: 'Hemisphere', icon: 'wb_iridescent', intensity: 25, color: '#f0f5ff', enabled: false },
];

export default function EditorLighting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelPath = searchParams.get('model') || '';
  const title = searchParams.get('title') || 'Untitled Model';
  const [selectedEnv, setSelectedEnv] = useState(0);
  const [selectedLight, setSelectedLight] = useState(0);

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

        <div className="grid grid-cols-12 gap-6 flex-1">
          {/* Left — Light List */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Light Sources */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">lightbulb</span>
                  <h3 className="font-headline font-bold text-on-surface text-sm">Light Sources</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">add</span>
                </button>
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
                  <div className={`w-2 h-2 rounded-full ${light.enabled ? 'bg-primary-container' : 'bg-slate-300'}`}></div>
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
                { label: 'Exposure', value: 65 },
                { label: 'Contrast', value: 50 },
                { label: 'Saturation', value: 55 },
              ].map((prop) => (
                <div key={prop.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span>{prop.label}</span>
                    <span className="text-primary">{prop.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${prop.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center — 3D Viewport */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
            <div className="relative flex-1 min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 group">
              {modelPath ? (
                <ModelPreview modelPath={modelPath} enableZoom enablePan />
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
                  <button className="material-symbols-outlined text-amber-500 hover:text-amber-400 transition-colors">light_mode</button>
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">visibility</button>
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">grid_on</button>
                </div>
                <div className="w-px h-6 bg-outline-variant/30"></div>
                <div className="flex items-center gap-3">
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">zoom_in</button>
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">fullscreen</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Light Properties & Environment */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Selected Light Properties */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">tune</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Light Properties</h3>
              </div>
              {[
                { label: 'Intensity', value: lights[selectedLight].intensity },
                { label: 'Shadow Softness', value: 65 },
                { label: 'Temperature', value: 50 },
                { label: 'Radius', value: 30 },
              ].map((prop) => (
                <div key={prop.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span>{prop.label}</span>
                    <span className="text-primary">{prop.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-amber-300 rounded-full" style={{ width: `${prop.value}%` }}></div>
                  </div>
                </div>
              ))}

              {/* Light Color */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Light Color</span>
                <div className="flex gap-2">
                  {['#fff5e6', '#e6f0ff', '#ffffff', '#ffe4e1', '#e8f5e9', '#fce4ec'].map((c) => (
                    <button
                      key={c}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
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
                {envPresets.map((preset, idx) => (
                  <button
                    key={preset.label}
                    onClick={() => setSelectedEnv(idx)}
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
                  { label: 'Cast Shadows', enabled: true },
                  { label: 'Contact Shadows', enabled: true },
                  { label: 'Ambient Occlusion', enabled: false },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface-variant">{toggle.label}</span>
                    <div className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${toggle.enabled ? 'bg-primary-container' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${toggle.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
