import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';
import SketchfabModal from '../components/SketchfabModal';
import PolyHavenPanel from '../components/PolyHavenPanel';

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
  const previewRef = useRef(null);

  // Sketchfab modal state
  const [sketchfabOpen, setSketchfabOpen] = useState(false);
  const [importedModels, setImportedModels] = useState([]);

  // HDRI state
  const [activeHdriId, setActiveHdriId] = useState(null);
  const [activeHdriInfo, setActiveHdriInfo] = useState(null);
  const [showHdriPanel, setShowHdriPanel] = useState(false);

  // Scene save state
  const [sceneId, setSceneId] = useState(searchParams.get('sceneId') || null);
  const [savingScene, setSavingScene] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Transform state
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');

  // Scene restoration state
  const [sceneData, setSceneData] = useState(null);
  const [sceneRestored, setSceneRestored] = useState(false);
  const restoreInFlightRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Fetch scene data when loading with a sceneId
  useEffect(() => {
    if (!sceneId) return;
    let cancelled = false;
    fetch(`http://localhost:5174/api/scenes/${sceneId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled && data) setSceneData(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sceneId]);

  // Restore scene (HDRI + imported models) once preview is ready
  useEffect(() => {
    if (!sceneData || sceneRestored || restoreInFlightRef.current) return;
    const preview = previewRef.current;
    if (!preview) return;

    restoreInFlightRef.current = true;
    let cancelled = false;

    // Wait a bit for the main model to load in ModelPreview
    const timer = setTimeout(async () => {
      try {
        if (cancelled) return;

        // Restore main model transform
        if (sceneData.transforms?.main) {
          preview.setObjectTransform('main', sceneData.transforms.main);
        }

        // Restore HDRI
        if (sceneData.hdri?.hdrUrl) {
          try {
            await preview.setHdri(sceneData.hdri.hdrUrl);
            if (cancelled) return;
            setActiveHdriId(sceneData.hdri.id);
            setActiveHdriInfo(sceneData.hdri);
          } catch {
            // HDRI restore failed
          }
        }

        // Restore imported models
        if (sceneData.importedModels?.length > 0) {
          for (const model of sceneData.importedModels) {
            if (cancelled) return;
            if (model.source === 'sketchfab' && model.uid) {
              try {
                const res = await fetch(`http://localhost:5174/api/sketchfab/models/${model.uid}/download`);
                const data = await res.json();
                if (!res.ok) continue;

                // Find best download format
                const formats = data?.gltf || data?.glb ? data : (data?.formats || data);
                let downloadUrl = null;
                for (const key of ['glb', 'gltf', 'usdz', 'source']) {
                  if (formats[key]?.url) { downloadUrl = formats[key].url; break; }
                }
                if (!downloadUrl) {
                  for (const [, value] of Object.entries(formats)) {
                    if (value && typeof value === 'object' && value.url) { downloadUrl = value.url; break; }
                  }
                }
                if (!downloadUrl) continue;

                if (cancelled) return;

                const addedId = await preview.addImportedModel(downloadUrl, {
                  id: model.id,
                  source: 'sketchfab',
                  title: model.name,
                  author: model.author,
                });

                if (addedId) {
                  // Apply saved transform for this imported model
                  const savedTransform = sceneData.transforms?.[model.id];
                  if (savedTransform) {
                    preview.setObjectTransform(addedId, savedTransform);
                  }

                  setImportedModels((prev) => [...prev, {
                    id: addedId,
                    uid: model.uid,
                    name: model.name,
                    author: model.author,
                    thumbnailUrl: model.thumbnailUrl,
                    source: 'sketchfab',
                  }]);
                }
              } catch {
                // Import restore failed for this model
              }
            }
          }
        }

        if (!cancelled) setSceneRestored(true);
      } finally {
        restoreInFlightRef.current = false;
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sceneData, sceneRestored]);

  const saveTitle = async (newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === title) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5174/api/models/${encodeURIComponent(fileName)}`, {
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

  const handleImportModel = useCallback(async (modelInfo) => {
    const id = await previewRef.current?.addImportedModel(modelInfo.downloadUrl, {
      id: `sketchfab-${modelInfo.uid}`,
      source: 'sketchfab',
      title: modelInfo.name,
      author: modelInfo.author,
      license: modelInfo.license,
    });

    if (id) {
      setImportedModels((prev) => [...prev, {
        id,
        uid: modelInfo.uid,
        name: modelInfo.name,
        author: modelInfo.author,
        thumbnailUrl: modelInfo.thumbnailUrl,
        source: 'sketchfab',
      }]);
    }
  }, []);

  const handleRemoveImport = useCallback((id) => {
    previewRef.current?.removeImportedModel(id);
    setImportedModels((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleApplyHdri = useCallback(async (hdriInfo) => {
    try {
      await previewRef.current?.setHdri(hdriInfo.hdrUrl);
      setActiveHdriId(hdriInfo.id);
      setActiveHdriInfo({ id: hdriInfo.id, name: hdriInfo.name, hdrUrl: hdriInfo.hdrUrl });
    } catch {
      // HDRI loading failed
    }
  }, []);

  const handleResetHdri = useCallback(() => {
    previewRef.current?.clearHdri();
    setActiveHdriId(null);
    setActiveHdriInfo(null);
  }, []);

  const handleObjectSelected = useCallback((id) => {
    setSelectedObjectId(id);
  }, []);

  const handleTransformMode = useCallback((mode) => {
    setTransformMode(mode);
    previewRef.current?.setTransformMode(mode);
  }, []);

  const handleDeselectObject = useCallback(() => {
    previewRef.current?.deselectObject();
    setSelectedObjectId(null);
  }, []);

  const handleRestoreObject = useCallback((id) => {
    previewRef.current?.restoreObject(id);
  }, []);

  // Keyboard shortcuts for transform modes
  useEffect(() => {
    const handleKey = (e) => {
      if (isEditing) return;
      switch (e.key.toLowerCase()) {
        case 'w': handleTransformMode('translate'); break;
        case 'e': handleTransformMode('rotate'); break;
        case 'r': handleTransformMode('scale'); break;
        case 'escape': handleDeselectObject(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isEditing, handleTransformMode, handleDeselectObject]);

  const handleSaveScene = useCallback(async () => {
    setSavingScene(true);
    setSaveSuccess(false);
    try {
      // Deselect to hide gizmo from screenshot
      previewRef.current?.deselectObject();
      setSelectedObjectId(null);

      // Capture transforms and screenshot
      const transforms = previewRef.current?.getObjectTransforms() || {};
      const screenshot = previewRef.current?.captureScreenshot() || null;

      const payload = {
        title,
        modelPath,
        hdri: activeHdriInfo,
        transforms,
        screenshot,
        importedModels: importedModels.map((m) => ({
          id: m.id,
          uid: m.uid,
          name: m.name,
          author: m.author,
          thumbnailUrl: m.thumbnailUrl,
          source: m.source,
        })),
      };

      const url = sceneId
        ? `http://localhost:5174/api/scenes/${sceneId}`
        : 'http://localhost:5174/api/scenes';
      const method = sceneId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const scene = await res.json();
        setSceneId(scene.id);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch {
      alert('Could not save scene. Make sure the API server is running.');
    }
    setSavingScene(false);
  }, [title, modelPath, activeHdriInfo, importedModels, sceneId]);

  return (
    <AppLayout collapsibleSidebar>
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
              onClick={handleSaveScene}
              disabled={savingScene}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
                saveSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-on-primary shadow-lg hover:shadow-primary/20'
              } disabled:opacity-50`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {savingScene ? 'progress_activity' : saveSuccess ? 'check_circle' : 'save'}
              </span>
              {savingScene ? 'Saving...' : saveSuccess ? 'Saved!' : sceneId ? 'Update Scene' : 'Save Scene'}
            </button>
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
        
        {/* Main content area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* 3D Viewport */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 group">
            {/* Floating Tools */}
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
              <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl">
                <button
                  onClick={() => handleTransformMode('translate')}
                  className={`p-2 hover:bg-white/40 rounded-xl transition-colors ${transformMode === 'translate' && selectedObjectId ? 'text-primary bg-white/20' : 'text-outline'}`}
                  title="Move (W)"
                >
                  <span className="material-symbols-outlined">open_with</span>
                </button>
                <button
                  onClick={() => handleTransformMode('rotate')}
                  className={`p-2 hover:bg-white/40 rounded-xl transition-colors ${transformMode === 'rotate' && selectedObjectId ? 'text-primary bg-white/20' : 'text-outline'}`}
                  title="Rotate (E)"
                >
                  <span className="material-symbols-outlined">360</span>
                </button>
                <button
                  onClick={() => handleTransformMode('scale')}
                  className={`p-2 hover:bg-white/40 rounded-xl transition-colors ${transformMode === 'scale' && selectedObjectId ? 'text-primary bg-white/20' : 'text-outline'}`}
                  title="Scale (R)"
                >
                  <span className="material-symbols-outlined">zoom_out_map</span>
                </button>
                <div className="border-t border-outline-variant/30 my-1"></div>
                <button
                  onClick={handleDeselectObject}
                  className={`p-2 hover:bg-white/40 rounded-xl transition-colors ${!selectedObjectId ? 'text-primary bg-white/20' : 'text-outline'}`}
                  title="Deselect (Esc)"
                >
                  <span className="material-symbols-outlined">near_me</span>
                </button>
              </div>
              {selectedObjectId && (
                <div className="glass-panel px-3 py-1.5 rounded-xl shadow-lg">
                  <p className="text-[10px] font-bold text-white/80 truncate max-w-[120px]">
                    {selectedObjectId === 'main' ? 'Main Model' : importedModels.find((m) => m.id === selectedObjectId)?.name || selectedObjectId}
                  </p>
                </div>
              )}
            </div>
            
            {/* 3D Viewer */}
            {modelPath ? (
              <ModelPreview ref={previewRef} modelPath={modelPath} enableZoom enablePan autoRotate={false} onObjectSelected={handleObjectSelected} />
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
                <button
                  onClick={() => setSketchfabOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-colors"
                  title="Add Sketchfab model"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Sketchfab
                </button>
                <button
                  onClick={() => setShowHdriPanel(!showHdriPanel)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    showHdriPanel || activeHdriId
                      ? 'bg-amber-500/20 text-amber-600'
                      : 'bg-amber-100/80 text-amber-700 hover:bg-amber-200/80'
                  }`}
                  title="HDRI Environment"
                >
                  <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                  HDRI
                </button>
              </div>
              <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-8">
                <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">fullscreen</button>
              </div>
            </div>
          </div>

          {/* Right Side Panel: HDRI + Scene Objects */}
          {(showHdriPanel || modelPath || importedModels.length > 0) && (
            <div className="w-72 xl:w-80 flex flex-col gap-4 overflow-y-auto no-scrollbar">
              {/* HDRI Panel */}
              {showHdriPanel && (
                <PolyHavenPanel
                  activeHdriId={activeHdriId}
                  onApplyHdri={handleApplyHdri}
                  onResetHdri={handleResetHdri}
                />
              )}

              {/* Scene Objects List */}
              {(modelPath || importedModels.length > 0) && (
                <div className="glass-panel rounded-lg p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-container">view_in_ar</span>
                    <h3 className="font-headline font-bold text-on-surface text-sm">Scene Objects</h3>
                    <span className="ml-auto text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {importedModels.length + (modelPath ? 1 : 0)}
                    </span>
                  </div>

                  {/* Main Model */}
                  {modelPath && (
                    <div
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                        selectedObjectId === 'main'
                          ? 'bg-primary/10 ring-1 ring-primary-container'
                          : 'bg-surface-container hover:bg-surface-container-highest'
                      }`}
                      onClick={() => previewRef.current?.selectObject('main')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">deployed_code</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{title}</p>
                        <p className="text-[10px] text-on-surface-variant">Main model</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRestoreObject('main'); }}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-on-surface-variant hover:text-amber-600 transition-colors shrink-0"
                        title="Restore to initial position"
                      >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                      </button>
                    </div>
                  )}

                  {/* Imported Models */}
                  {importedModels.map((model) => (
                    <div
                      key={model.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                        selectedObjectId === model.id
                          ? 'bg-primary/10 ring-1 ring-primary-container'
                          : 'bg-surface-container hover:bg-surface-container-highest'
                      }`}
                      onClick={() => previewRef.current?.selectObject(model.id)}
                    >
                      {model.thumbnailUrl ? (
                        <img
                          src={model.thumbnailUrl}
                          alt={model.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-lg">view_in_ar</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{model.name}</p>
                        {model.author && (
                          <p className="text-[10px] text-on-surface-variant truncate">{model.author}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRestoreObject(model.id); }}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-on-surface-variant hover:text-amber-600 transition-colors shrink-0"
                        title="Restore to initial position"
                      >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveImport(model.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-colors shrink-0"
                        title="Remove from scene"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Sketchfab Modal */}
      <SketchfabModal
        isOpen={sketchfabOpen}
        onClose={() => setSketchfabOpen(false)}
        onImportModel={handleImportModel}
      />
    </AppLayout>
  );
}
