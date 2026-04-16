import React, { useState, useEffect, useMemo, useCallback } from 'react';

const CATEGORIES = ['all', 'indoor', 'outdoor', 'studio', 'night'];

const API_BASE = 'http://localhost:5174/api/polyhaven';

export default function PolyHavenPanel({ activeHdriId, onApplyHdri, onResetHdri }) {
  const [hdris, setHdris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/hdris`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        // Server returns an array of { id, name, categories, previewUrl, downloadUrl }
        const list = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              name: item.name || item.id,
              categories: item.categories || [],
              previewUrl: item.previewUrl,
            }))
          : Object.entries(data).map(([id, info]) => ({
              id,
              name: info.name || id,
              categories: info.categories || [],
              previewUrl: info.previewUrl,
            }));
        setHdris(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return hdris.filter((h) => {
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === 'all' || h.categories.includes(category);
      return matchesSearch && matchesCategory;
    });
  }, [hdris, search, category]);

  const handleApply = useCallback(async (hdri) => {
    setApplyingId(hdri.id);
    try {
      const res = await fetch(`${API_BASE}/hdris/${hdri.id}/files`);
      const data = await res.json();
      const hdrUrl = data?.hdri?.['2k']?.hdr?.url;
      if (hdrUrl) {
        onApplyHdri({ id: hdri.id, name: hdri.name, categories: hdri.categories, hdrUrl });
      }
    } catch {
      // silently fail
    } finally {
      setApplyingId(null);
    }
  }, [onApplyHdri]);

  return (
    <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-container">wb_sunny</span>
        <h3 className="font-headline font-bold text-on-surface text-sm">Poly Haven HDRIs</h3>
      </div>

      {/* Reset to default */}
      <button
        onClick={onResetHdri}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
          !activeHdriId
            ? 'bg-primary/10 border-2 border-primary-container'
            : 'bg-surface-container hover:bg-surface-container-highest'
        }`}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
          <span className="material-symbols-outlined text-lg">wb_sunny</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-on-surface">Default Lighting</p>
          <p className="text-[10px] text-on-surface-variant">Reset to scene presets</p>
        </div>
        {!activeHdriId && (
          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
        )}
      </button>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
          search
        </span>
        <input
          type="text"
          placeholder="Search HDRIs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs placeholder:text-on-surface-variant/50 outline-none focus:ring-1 focus:ring-primary-container"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              category === cat
                ? 'bg-primary-container text-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined text-on-surface-variant animate-spin">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-xs text-on-surface-variant py-6">No HDRIs found.</p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((hdri) => {
            const isActive = activeHdriId === hdri.id;
            const isApplying = applyingId === hdri.id;
            return (
              <button
                key={hdri.id}
                onClick={() => handleApply(hdri)}
                disabled={isApplying}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-primary/10 border-2 border-primary-container'
                    : 'bg-surface-container hover:bg-surface-container-highest border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {isApplying ? 'progress_activity' : 'light_mode'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">{hdri.name}</p>
                  {hdri.categories.length > 0 && (
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {hdri.categories.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
                {isActive && (
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                )}
                {isApplying && (
                  <span className="material-symbols-outlined text-on-surface-variant text-lg animate-spin shrink-0">progress_activity</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
