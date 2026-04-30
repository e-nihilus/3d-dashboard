import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const API_BASE = 'http://localhost:5174/api';

function Spinner({ size = 'text-xl' }) {
  return (
    <span className={`material-symbols-outlined ${size} animate-spin`}>
      progress_activity
    </span>
  );
}

export default function LocalAssetsModal({ isOpen, onClose, onImportModel }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [importingId, setImportingId] = useState(null);

  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/models`);
      if (!res.ok) throw new Error('Failed to load assets');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setAssets([]);
      setSearch('');
      setError(null);
    }
  }, [isOpen, fetchAssets]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter((a) => a.title.toLowerCase().includes(q) || a.fileName.toLowerCase().includes(q));
  }, [assets, search]);

  const handleImport = async (model) => {
    setImportingId(model.id);
    try {
      const ext = model.fileName.split('.').pop()?.toLowerCase() || 'glb';
      onImportModel({
        uid: model.id,
        name: model.title,
        downloadUrl: `http://localhost:5174${model.modelPath}`,
        format: ext,
        author: '',
        thumbnailUrl: '',
      });
      onClose();
    } finally {
      setImportingId(null);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="glass-panel w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">inventory_2</span>
            <h2 className="font-headline font-extrabold text-lg text-on-surface">My Assets</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2.5 gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search local assets..."
              className="bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 flex-1"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-base">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <Spinner size="text-3xl" />
              <p className="text-sm font-medium">Loading assets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-40">search_off</span>
              <p className="text-sm font-medium">{search ? 'No assets match your search' : 'No assets found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((model) => {
                const isImporting = importingId === model.id;
                const ext = model.tags?.[0] || 'GLB';

                return (
                  <div
                    key={model.id}
                    className="glass-card rounded-lg overflow-hidden group hover:translate-y-[-4px] transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-surface-container overflow-hidden relative flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/25">
                        deployed_code
                      </span>
                      <span className="absolute top-2 right-2 bg-primary/15 text-primary text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {ext}
                      </span>
                    </div>

                    <div className="p-3 flex flex-col gap-1.5">
                      <h3 className="text-xs font-bold text-on-surface truncate" title={model.title}>
                        {model.title}
                      </h3>
                      <p className="text-[10px] text-on-surface-variant truncate">{model.fileName}</p>
                      <button
                        onClick={() => handleImport(model)}
                        disabled={isImporting}
                        className="mt-1 flex items-center justify-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                      >
                        {isImporting ? (
                          <Spinner size="text-sm" />
                        ) : (
                          <span className="material-symbols-outlined text-sm">add</span>
                        )}
                        {isImporting ? 'Adding...' : 'Add to Scene'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
