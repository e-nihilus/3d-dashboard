import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:5174/api/sketchfab';

const FORMAT_PRIORITY = ['glb', 'gltf', 'usdz', 'source'];

function pickBestFormat(data) {
  // Sketchfab may wrap formats under a root key or return them flat
  const formats = data?.gltf || data?.glb ? data : (data?.formats || data);

  for (const key of FORMAT_PRIORITY) {
    const entry = formats[key];
    if (entry?.url) return { format: key, downloadUrl: entry.url };
  }

  // Fallback: find any entry with a url
  for (const [key, value] of Object.entries(formats)) {
    if (value && typeof value === 'object' && value.url) {
      return { format: key, downloadUrl: value.url };
    }
  }

  return null;
}

function Spinner({ size = 'text-xl' }) {
  return (
    <span className={`material-symbols-outlined ${size} animate-spin`}>
      progress_activity
    </span>
  );
}

export default function SketchfabModal({ isOpen, onClose, onImportModel }) {
  const [query, setQuery] = useState('furniture');
  const [results, setResults] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [importingUid, setImportingUid] = useState(null);
  const [error, setError] = useState(null);

  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  const search = useCallback(async (q, cursor = null) => {
    const isLoadMore = !!cursor;
    if (isLoadMore) setLoadingMore(true);
    else setSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q, count: 12 });
      if (cursor) params.set('cursor', cursor);
      const res = await fetch(`${API_BASE}/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      setResults((prev) => (isLoadMore ? [...prev, ...data.results] : data.results));
      // Extract cursor from the next URL if present
      let parsedCursor = null;
      if (data.next) {
        try {
          const nextUrl = new URL(data.next);
          parsedCursor = nextUrl.searchParams.get('cursor');
        } catch { /* ignore */ }
      }
      setNextCursor(parsedCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      search(query);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setResults([]);
      setNextCursor(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    search(query.trim());
  };

  const handleImport = async (model) => {
    setImportingUid(model.uid);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/models/${model.uid}/download`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Download failed');

      const best = pickBestFormat(data);
      if (!best) {
        console.error('Sketchfab download response:', data);
        throw new Error('No downloadable format found');
      }

      const thumbnail = model.thumbnails?.images?.[0]?.url ?? '';

      onImportModel({
        uid: model.uid,
        name: model.name,
        downloadUrl: best.downloadUrl,
        format: best.format,
        author: model.user?.displayName ?? model.user?.username ?? '',
        license: model.license?.label ?? '',
        thumbnailUrl: thumbnail,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setImportingUid(null);
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
            <span className="material-symbols-outlined text-primary text-2xl">view_in_ar</span>
            <h2 className="font-headline font-extrabold text-lg text-on-surface">Sketchfab Models</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="px-6 pb-4">
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2.5 gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 3D models..."
              className="bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 flex-1"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {searching ? <Spinner size="text-sm" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
          {searching && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <Spinner size="text-3xl" />
              <p className="text-sm font-medium">Searching models...</p>
            </div>
          ) : results.length === 0 && !searching ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-40">search_off</span>
              <p className="text-sm font-medium">No models found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((model) => {
                  const thumbnail = model.thumbnails?.images?.[0]?.url ?? '';
                  const author = model.user?.displayName ?? model.user?.username ?? '';
                  const license = model.license?.label ?? '';
                  const isImporting = importingUid === model.uid;

                  return (
                    <div
                      key={model.uid}
                      className="glass-card rounded-lg overflow-hidden group hover:translate-y-[-4px] transition-all duration-300"
                    >
                      <div className="aspect-[4/3] bg-surface-container overflow-hidden relative">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={model.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                              view_in_ar
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex flex-col gap-1.5">
                        <h3 className="text-xs font-bold text-on-surface truncate" title={model.name}>
                          {model.name}
                        </h3>
                        {author && (
                          <p className="text-[10px] text-on-surface-variant truncate">{author}</p>
                        )}
                        {license && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60 truncate">
                            {license}
                          </span>
                        )}
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
                          {isImporting ? 'Importing...' : 'Add to Scene'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {nextCursor && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => search(query, nextCursor)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 bg-primary-container text-primary px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <Spinner size="text-base" />
                    ) : (
                      <span className="material-symbols-outlined text-base">download</span>
                    )}
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
