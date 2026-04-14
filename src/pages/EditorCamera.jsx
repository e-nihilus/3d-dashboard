import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';

const cameraPresets = [
  { name: 'Front', icon: 'crop_portrait', rotation: '0° / 0°' },
  { name: 'Side', icon: 'crop_landscape', rotation: '0° / 90°' },
  { name: 'Top', icon: 'crop_din', rotation: '90° / 0°' },
  { name: '3/4 View', icon: 'view_in_ar', rotation: '30° / 45°' },
  { name: 'Low Angle', icon: 'north_east', rotation: '-20° / 30°' },
  { name: 'Custom', icon: 'tune', rotation: '—' },
];

const savedShots = [
  { name: 'Hero Shot', fov: 35, desc: 'Product showcase angle' },
  { name: 'Detail Close-up', fov: 50, desc: 'Texture detail view' },
  { name: 'Wide Context', fov: 24, desc: 'Environment framing' },
];

export default function EditorCamera() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelPath = searchParams.get('model') || '';
  const title = searchParams.get('title') || 'Untitled Model';
  const [selectedPreset, setSelectedPreset] = useState(3);

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
                <span className="material-symbols-outlined text-xs">videocam</span>
                Camera Editor
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container text-on-primary-container font-bold text-sm shadow-lg hover:shadow-primary/10 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            Capture Shot
          </button>
        </header>

        <div className="grid grid-cols-12 gap-6 flex-1">
          {/* Left — Camera Settings */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Camera Presets */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">videocam</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Camera Presets</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {cameraPresets.map((preset, idx) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedPreset(idx)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      selectedPreset === idx
                        ? 'bg-primary/10 border-2 border-primary-container text-primary'
                        : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{preset.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lens Properties */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">camera</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Lens Properties</h3>
              </div>
              {[
                { label: 'Focal Length', value: 50, unit: 'mm' },
                { label: 'Aperture', value: 35, unit: 'f/2.8' },
                { label: 'Focus Distance', value: 60, unit: 'm' },
              ].map((prop) => (
                <div key={prop.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span>{prop.label}</span>
                    <span className="text-primary">{prop.unit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${prop.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Depth of Field */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">blur_on</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Depth of Field</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Enable DoF', enabled: true },
                  { label: 'Auto Focus', enabled: true },
                  { label: 'Bokeh Preview', enabled: false },
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
                <span className="material-symbols-outlined text-primary text-sm">videocam</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Camera View</span>
              </div>

              {/* Rule of thirds overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white"></div>
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white"></div>
              </div>

              {/* Camera Info */}
              <div className="absolute bottom-4 left-4 glass-panel px-3 py-2 rounded-lg text-[10px] font-mono text-on-surface-variant space-y-0.5">
                <p>FOV: 50mm  |  f/2.8</p>
                <p>Rot: {cameraPresets[selectedPreset].rotation}</p>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button className="glass-panel p-2 rounded-full hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-sm">grid_4x4</span>
                </button>
                <button className="glass-panel p-2 rounded-full hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-sm">fullscreen</span>
                </button>
              </div>
            </div>

            {/* Position Inputs */}
            <div className="glass-panel rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { axis: 'Position', values: ['X: 0.00', 'Y: 1.50', 'Z: 3.00'] },
                  { axis: 'Rotation', values: ['X: 30°', 'Y: 45°', 'Z: 0°'] },
                  { axis: 'Target', values: ['X: 0.00', 'Y: 0.50', 'Z: 0.00'] },
                ].map((group) => (
                  <div key={group.axis} className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{group.axis}</span>
                    <div className="space-y-1">
                      {group.values.map((val) => (
                        <div key={val} className="bg-surface-container rounded-lg px-3 py-1.5 text-xs font-mono text-on-surface">
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Saved Shots & Animation */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Saved Camera Shots */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">photo_library</span>
                  <h3 className="font-headline font-bold text-on-surface text-sm">Saved Shots</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">add</span>
                </button>
              </div>

              {savedShots.map((shot) => (
                <button
                  key={shot.name}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-all text-left"
                >
                  <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white/60 text-sm">photo_camera</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{shot.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{shot.fov}mm • {shot.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Camera Animation */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">animation</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Camera Path</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Orbit 360°', duration: '8s', icon: 'replay' },
                  { label: 'Zoom In', duration: '3s', icon: 'zoom_in' },
                  { label: 'Dolly Slide', duration: '5s', icon: 'trending_flat' },
                ].map((anim) => (
                  <div key={anim.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">{anim.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-on-surface">{anim.label}</p>
                      <p className="text-[10px] text-on-surface-variant">{anim.duration} duration</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">play_circle</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 rounded-full bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors">
                Generate Camera Path
              </button>
            </div>

            {/* Post-Processing */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">auto_fix_high</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Post Effects</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Vignette', enabled: true },
                  { label: 'Chromatic Aberration', enabled: false },
                  { label: 'Film Grain', enabled: false },
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
