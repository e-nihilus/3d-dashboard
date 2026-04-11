import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';

export default function Editor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelPath = searchParams.get('model') || '';
  const initialTitle = searchParams.get('title') || 'Untitled Model';
  const fileName = modelPath.split('/').pop();

  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveTitle = async (newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === title) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/api/models/${encodeURIComponent(fileName)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        setTitle(trimmed);
      }
    } catch {
      alert('Could not save. Make sure the API server is running.');
    }
    setSaving(false);
    setIsEditing(false);
  };

  const handleDownload = () => {
    if (!modelPath) return;
    const link = document.createElement('a');
    link.href = modelPath;
    link.download = modelPath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 gap-4 max-w-[1920px] mx-auto w-full h-[calc(100vh-120px)] overflow-hidden">
        {/* Viewport Header */}
        <header className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              {isEditing ? (
                <input
                  ref={inputRef}
                  defaultValue={title}
                  onBlur={(e) => saveTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle(e.target.value);
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  className="font-headline text-xl font-bold text-on-surface bg-transparent border-b-2 border-primary outline-none w-64"
                  disabled={saving}
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 group/title"
                  title="Click to rename"
                >
                  <h1 className="font-headline text-xl font-bold text-on-surface">{title}</h1>
                  <span className="material-symbols-outlined text-on-surface-variant text-base">edit</span>
                </button>
              )}
              <p className="text-on-surface-variant text-xs font-medium">
                {fileName}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/export')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-highest text-on-surface font-bold text-sm hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              Export
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-bold text-sm shadow-lg hover:shadow-primary/10 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download
            </button>
          </div>
        </header>
        
        {/* 3D Viewport */}
        <div className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 group">
          {/* Floating Tools */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl">
              <button className="p-2 hover:bg-white/40 rounded-xl transition-colors text-primary" title="Orbit">
                <span className="material-symbols-outlined">api</span>
              </button>
              <button className="p-2 hover:bg-white/40 rounded-xl transition-colors text-outline" title="Pan">
                <span className="material-symbols-outlined">drag_pan</span>
              </button>
              <button className="p-2 hover:bg-white/40 rounded-xl transition-colors text-outline" title="Zoom">
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
          </div>
          
          {/* 3D Viewer */}
          {modelPath ? (
            <ModelPreview modelPath={modelPath} enableZoom enablePan />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/60">
                <span className="material-symbols-outlined text-6xl mb-4 block">view_in_ar</span>
                <p className="font-headline font-bold text-lg">No model loaded</p>
                <p className="text-sm mt-1">Go back to dashboard and select a model to edit.</p>
              </div>
            </div>
          )}
          
          {/* Bottom Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl z-10">
            <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-8">
              <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">videocam</button>
              <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">grid_on</button>
              <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">measure</button>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white transition-all">
                <span className="material-symbols-outlined text-[18px]">replay_10</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-[28px]">play_arrow</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white transition-all">
                <span className="material-symbols-outlined text-[18px]">forward_10</span>
              </button>
            </div>
            <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-8">
              <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">fullscreen</button>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
