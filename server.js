const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load .env file manually (no dotenv dependency needed)
try {
  const envPath = resolve(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch { /* .env not found, rely on system env */ }

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5174;
const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
const META_FILE = path.join(ASSETS_DIR, 'models-meta.json');
const SCENES_DIR = path.join(__dirname, 'public', 'scenes');

// Ensure scenes directory exists
if (!fs.existsSync(SCENES_DIR)) {
  fs.mkdirSync(SCENES_DIR, { recursive: true });
}

function loadMeta() {
  if (fs.existsSync(META_FILE)) {
    return JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
  }
  return {};
}

function saveMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve static assets
app.use('/assets', express.static(ASSETS_DIR));

// List all models
app.get('/api/models', (req, res) => {
  const allowed = ['.obj', '.fbx', '.glb'];
  const files = fs.readdirSync(ASSETS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return allowed.includes(ext);
  });

  const meta = loadMeta();
  const models = files.map((file, index) => {
    const ext = path.extname(file).toLowerCase().replace('.', '').toUpperCase();
    const defaultTitle = path.basename(file, path.extname(file)).replace(/[_-]/g, ' ');
    const title = meta[file]?.title || defaultTitle;
    const stat = fs.statSync(path.join(ASSETS_DIR, file));
    return {
      id: file,
      title,
      status: 'Ready',
      edited: stat.mtime.toISOString(),
      tags: [ext],
      modelPath: `/assets/${file}`,
      fileName: file,
    };
  });

  res.json(models);
});

// Upload a model
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ASSETS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.obj', '.fbx', '.glb'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only OBJ, FBX, or GLB files are allowed'));
    }
  },
});

app.post('/api/models/upload', upload.single('model'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = req.file;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '').toUpperCase();
  const title = path.basename(file.originalname, path.extname(file.originalname)).replace(/[_-]/g, ' ');

  res.json({
    id: file.originalname,
    title,
    status: 'Ready',
    edited: new Date().toISOString(),
    tags: [ext],
    modelPath: `/assets/${file.originalname}`,
    fileName: file.originalname,
  });
});

// Rename a model
app.patch('/api/models/:fileName', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const filePath = path.join(ASSETS_DIR, req.params.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const meta = loadMeta();
  meta[req.params.fileName] = { ...meta[req.params.fileName], title };
  saveMeta(meta);

  res.json({ success: true, title });
});

// Delete a model
app.delete('/api/models/:fileName', (req, res) => {
  const filePath = path.join(ASSETS_DIR, req.params.fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlinkSync(filePath);
  res.json({ success: true });
});

// --- Sketchfab proxy endpoints ---

app.get('/api/sketchfab/search', async (req, res) => {
  const token = process.env.SKETCHFAB_API_KEY;
  if (!token) return res.status(500).json({ error: 'SKETCHFAB_API_KEY not configured' });

  const { q, cursor, count } = req.query;
  const params = new URLSearchParams({ type: 'models', downloadable: 'true' });
  if (q) params.set('q', q);
  if (cursor) params.set('cursor', cursor);
  if (count) params.set('count', count);

  try {
    const url = `https://api.sketchfab.com/v3/search?${params}`;
    const response = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('Sketchfab API error:', response.status, data);
      return res.status(response.status).json({ error: data.detail || 'Sketchfab API error' });
    }

    const results = (data.results || []).map((m) => ({
      uid: m.uid,
      name: m.name,
      thumbnails: m.thumbnails,
      isDownloadable: m.isDownloadable,
      user: m.user,
      license: m.license,
      viewerUrl: m.viewerUrl,
      archives: m.archives,
    }));

    res.json({ results, next: data.next || null, previous: data.previous || null });
  } catch (err) {
    console.error('Sketchfab search error:', err.message);
    res.status(502).json({ error: 'Failed to fetch from Sketchfab' });
  }
});

app.get('/api/sketchfab/models/:uid/download', async (req, res) => {
  const token = process.env.SKETCHFAB_API_KEY;
  if (!token) return res.status(500).json({ error: 'SKETCHFAB_API_KEY not configured' });

  try {
    const response = await fetch(`https://api.sketchfab.com/v3/models/${req.params.uid}/download`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('Sketchfab download error:', response.status, data);
      return res.status(response.status).json({ error: data.detail || 'Download not available' });
    }

    console.log('Sketchfab download formats:', Object.keys(data));
    res.json(data);
  } catch (err) {
    console.error('Sketchfab download error:', err.message);
    res.status(502).json({ error: 'Failed to fetch download links from Sketchfab' });
  }
});

// --- Poly Haven proxy endpoints ---

const POLYHAVEN_UA = 'Aurea3D-Viewer/1.0';

app.get('/api/polyhaven/hdris', async (req, res) => {
  try {
    const response = await fetch('https://api.polyhaven.com/assets?t=hdris', {
      headers: { 'User-Agent': POLYHAVEN_UA },
    });
    const data = await response.json();

    const hdris = Object.entries(data).map(([id, asset]) => ({
      id,
      name: asset.name,
      categories: asset.categories || [],
      previewUrl: asset.thumbnail_url || `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?width=256&height=256`,
      downloadUrl: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/${id}_2k.hdr`,
    }));

    res.json(hdris);
  } catch (err) {
    console.error('Poly Haven HDRI list error:', err.message);
    res.status(502).json({ error: 'Failed to fetch HDRIs from Poly Haven' });
  }
});

// Proxy thumbnails to avoid browser blocking external CDN images
app.get('/api/polyhaven/thumb/:id', async (req, res) => {
  try {
    const url = `https://cdn.polyhaven.com/asset_img/thumbs/${req.params.id}.png?width=256&height=256`;
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).end();
    res.set('Content-Type', response.headers.get('content-type') || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch {
    res.status(502).end();
  }
});

app.get('/api/polyhaven/hdris/:id/files', async (req, res) => {
  try {
    const response = await fetch(`https://api.polyhaven.com/files/${req.params.id}`, {
      headers: { 'User-Agent': POLYHAVEN_UA },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Poly Haven HDRI files error:', err.message);
    res.status(502).json({ error: 'Failed to fetch HDRI file info from Poly Haven' });
  }
});

// --- Scenes endpoints ---

app.get('/api/scenes', (req, res) => {
  if (!fs.existsSync(SCENES_DIR)) return res.json([]);
  const files = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith('.json'));
  const scenes = files.map((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(SCENES_DIR, f), 'utf-8'));
    return data;
  });
  scenes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(scenes);
});

// Serve scene screenshots
app.use('/scenes', express.static(SCENES_DIR));

app.post('/api/scenes', (req, res) => {
  const { title, modelPath, hdri, importedModels, transforms, screenshot } = req.body;
  if (!title || !modelPath) {
    return res.status(400).json({ error: 'title and modelPath are required' });
  }
  const id = `scene-${Date.now()}`;

  // Save screenshot if provided
  let thumbnailUrl = null;
  if (screenshot) {
    const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
    const imgPath = path.join(SCENES_DIR, `${id}.png`);
    fs.writeFileSync(imgPath, base64Data, 'base64');
    thumbnailUrl = `/scenes/${id}.png`;
  }

  const scene = {
    id,
    title,
    modelPath,
    hdri: hdri || null,
    importedModels: importedModels || [],
    transforms: transforms || {},
    thumbnailUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(SCENES_DIR, `${id}.json`), JSON.stringify(scene, null, 2));
  res.json(scene);
});

app.get('/api/scenes/:id', (req, res) => {
  const filePath = path.join(SCENES_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Scene not found' });
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
});

app.put('/api/scenes/:id', (req, res) => {
  const filePath = path.join(SCENES_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Scene not found' });
  }
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const { screenshot, ...rest } = req.body;

  // Update screenshot if provided
  let thumbnailUrl = existing.thumbnailUrl;
  if (screenshot) {
    const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
    const imgPath = path.join(SCENES_DIR, `${req.params.id}.png`);
    fs.writeFileSync(imgPath, base64Data, 'base64');
    thumbnailUrl = `/scenes/${req.params.id}.png`;
  }

  const updated = {
    ...existing,
    ...rest,
    id: existing.id,
    createdAt: existing.createdAt,
    thumbnailUrl,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  res.json(updated);
});

app.delete('/api/scenes/:id', (req, res) => {
  const filePath = path.join(SCENES_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Scene not found' });
  }
  fs.unlinkSync(filePath);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
