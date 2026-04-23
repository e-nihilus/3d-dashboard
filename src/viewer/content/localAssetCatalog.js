const MANIFEST_URL = '/assets/mock-3d/manifest.json';
const SUPPORTED_FORMATS = ['gltf', 'glb', 'splat', 'ply', 'sog', 'hdr'];

function isSupportedFormat(value) {
  return SUPPORTED_FORMATS.includes(value);
}

function normalizeKind(value) {
  if (value === 'scenario' || value === 'object' || value === 'light') return value;
  return null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return undefined;
  const normalizedValues = value.filter((entry) => typeof entry === 'string' && entry.length > 0);
  return normalizedValues.length > 0 ? normalizedValues : undefined;
}

function normalizeManifestAsset(rawAsset) {
  const normalizedKind = normalizeKind(rawAsset.kind);
  if (!normalizedKind || !isSupportedFormat(rawAsset.format)) return null;
  if (!rawAsset.id || !rawAsset.url) return null;
  return {
    id: rawAsset.id,
    kind: normalizedKind,
    title: rawAsset.title || rawAsset.id,
    format: rawAsset.format,
    url: rawAsset.url,
    polyhavenId: typeof rawAsset.polyhavenId === 'string' ? rawAsset.polyhavenId : undefined,
    preview: typeof rawAsset.preview === 'string' ? rawAsset.preview : undefined,
    categories: normalizeStringArray(rawAsset.categories),
    authors: normalizeStringArray(rawAsset.authors),
    sourceUrl: typeof rawAsset.sourceUrl === 'string' ? rawAsset.sourceUrl : undefined,
  };
}

export async function fetchLocal3DAssets() {
  const response = await fetch(MANIFEST_URL, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to read local 3D manifest (${response.status}).`);
  const rawManifest = await response.json();
  if (!Array.isArray(rawManifest.items)) return [];
  return rawManifest.items.map(normalizeManifestAsset).filter((asset) => asset !== null);
}

export function resolveLocal3DAsset({ creationId, assets }) {
  if (assets.length === 0) return null;
  return assets.find((asset) => asset.id === creationId) ?? null;
}
