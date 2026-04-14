import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';

const materialPresets = [
  { name: 'Matte Clay', icon: 'circle', color: '#c4b5a0' },
  { name: 'Glossy White', icon: 'circle', color: '#f0f0f0' },
  { name: 'Brushed Metal', icon: 'circle', color: '#8a8a8a' },
  { name: 'Glass', icon: 'circle', color: '#a8d8ea' },
  { name: 'Wood Oak', icon: 'circle', color: '#b5854b' },
  { name: 'Marble', icon: 'circle', color: '#e8e4e0' },
];

const textureChannels = [
  { label: 'Albedo', icon: 'palette', active: true },
  { label: 'Normal', icon: 'blur_on', active: false },
  { label: 'Roughness', icon: 'grain', active: false },
  { label: 'Metallic', icon: 'auto_awesome', active: false },
  { label: 'AO', icon: 'contrast', active: false },
];

export default function EditorMaterials() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelPath = searchParams.get('model') || '';
  const title = searchParams.get('title') || 'Untitled Model';
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState(0);

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
                <span className="material-symbols-outlined text-xs">palette</span>
                Materials Editor
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 flex-1">
          {/* Left Panel — Material Properties */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Material Presets */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">palette</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Material Presets</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {materialPresets.map((mat, idx) => (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMaterial(idx)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      selectedMaterial === idx
                        ? 'bg-primary/10 border-2 border-primary-container'
                        : 'bg-surface-container hover:bg-surface-container-highest'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full shadow-inner border border-white/50"
                      style={{ background: mat.color }}
                    ></div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-on-surface-variant">{mat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Surface Properties */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">tune</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Surface Properties</h3>
              </div>
              {[
                { label: 'Roughness', value: 35 },
                { label: 'Metallic', value: 0 },
                { label: 'Opacity', value: 100 },
                { label: 'IOR', value: 50 },
              ].map((prop) => (
                <div key={prop.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span>{prop.label}</span>
                    <span className="text-primary">{prop.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${prop.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Color Picker */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">colorize</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Base Color</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#c4b5a0] border-2 border-white shadow-md"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-on-surface">#C4B5A0</p>
                  <p className="text-[10px] text-on-surface-variant">RGB: 196, 181, 160</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['#c4b5a0', '#2d2d2d', '#ffffff', '#8b0000', '#1e3a5f', '#2d5a27'].map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ background: c }}
                  ></button>
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
                <span className="flex h-2 w-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Material Preview</span>
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

            {/* Texture Channels */}
            <div className="glass-panel rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                {textureChannels.map((ch, idx) => (
                  <button
                    key={ch.label}
                    onClick={() => setSelectedChannel(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      selectedChannel === idx
                        ? 'bg-primary/15 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{ch.icon}</span>
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel — Material Slots */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">layers</span>
                  <h3 className="font-headline font-bold text-on-surface text-sm">Material Slots</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">add</span>
                </button>
              </div>

              {[
                { name: 'Body', material: 'Matte Clay', color: '#c4b5a0', active: true },
                { name: 'Sole', material: 'Rubber Black', color: '#2d2d2d', active: false },
                { name: 'Laces', material: 'Cotton White', color: '#f0f0f0', active: false },
                { name: 'Logo', material: 'Metallic Gold', color: '#d4a843', active: false },
                { name: 'Interior', material: 'Fabric Mesh', color: '#6b7280', active: false },
              ].map((slot) => (
                <button
                  key={slot.name}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    slot.active ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-container'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner border border-white/50 shrink-0"
                    style={{ background: slot.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{slot.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{slot.material}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                </button>
              ))}
            </div>

            {/* UV Map Preview */}
            <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">map</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">UV Map</h3>
              </div>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/60 flex items-center justify-center">
                <div className="text-center text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-4xl mb-2 block">grid_on</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider">UV Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
