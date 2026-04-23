import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_VERSION = 2;
const STORAGE_KEY_PREFIX = `aurea-3d:viewer-custom-lights:v${STORAGE_VERSION}`;

function createStorageKey(creationId) {
  return `${STORAGE_KEY_PREFIX}:${creationId}`;
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function isViewerCustomLightSource(value) {
  if (typeof value !== 'object' || value === null) return false;
  const pos = value.position;
  return (
    typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.name === 'string' && value.name.trim().length > 0 &&
    isHexColor(value.color) &&
    isFiniteNumber(value.intensity) &&
    isFiniteNumber(value.size) &&
    typeof pos === 'object' && pos !== null &&
    isFiniteNumber(pos.x) && isFiniteNumber(pos.y) && isFiniteNumber(pos.z)
  );
}

function isViewerCustomLightPreset(value) {
  if (typeof value !== 'object' || value === null) return false;
  return (
    typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.name === 'string' && value.name.trim().length > 0 &&
    typeof value.sourceStockLightId === 'string' && value.sourceStockLightId.length > 0 &&
    Array.isArray(value.sources) && value.sources.length > 0 &&
    value.sources.every(isViewerCustomLightSource) &&
    isFiniteNumber(value.rotationY) && isFiniteNumber(value.exposure) &&
    isFiniteNumber(value.envIntensity) && isFiniteNumber(value.bgIntensity) &&
    isFiniteNumber(value.bgBlur) && isFiniteNumber(value.createdAt) && isFiniteNumber(value.updatedAt)
  );
}

function readStoredPresets(storageKey) {
  if (typeof window === 'undefined') return [];
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    if (typeof parsedValue !== 'object' || parsedValue === null || parsedValue.version !== STORAGE_VERSION || !Array.isArray(parsedValue.presets)) return [];
    return parsedValue.presets.filter(isViewerCustomLightPreset);
  } catch { return []; }
}

function persistPresets(storageKey, presets) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ version: STORAGE_VERSION, presets }));
  } catch { /* ignore */ }
}

function createPresetId() {
  return `custom-light-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useViewerCustomLights(creationId) {
  const storageKey = useMemo(() => createStorageKey(creationId), [creationId]);
  const [presets, setPresets] = useState(() => readStoredPresets(storageKey));

  useEffect(() => { setPresets(readStoredPresets(storageKey)); }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (event) => { if (event.key === storageKey) setPresets(readStoredPresets(storageKey)); };
    window.addEventListener('storage', handleStorage);
    return () => { window.removeEventListener('storage', handleStorage); };
  }, [storageKey]);

  const createPreset = useCallback((draft, fallbackName) => {
    const now = Date.now();
    const trimmedName = draft.name.trim();
    const nextPreset = {
      id: createPresetId(),
      name: trimmedName.length > 0 ? trimmedName : fallbackName,
      sourceStockLightId: draft.sourceStockLightId,
      sources: draft.sources.map((source) => ({ ...source, position: { ...source.position } })),
      rotationY: draft.rotationY, exposure: draft.exposure,
      envIntensity: draft.envIntensity, bgIntensity: draft.bgIntensity, bgBlur: draft.bgBlur,
      createdAt: now, updatedAt: now,
    };
    setPresets((currentPresets) => {
      const nextPresets = [nextPreset, ...currentPresets];
      persistPresets(storageKey, nextPresets);
      return nextPresets;
    });
    return nextPreset;
  }, [storageKey]);

  const findPresetById = useCallback((presetId) => presets.find((preset) => preset.id === presetId) ?? null, [presets]);

  return { presets, createPreset, findPresetById };
}
