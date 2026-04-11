const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;
const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
const META_FILE = path.join(ASSETS_DIR, 'models-meta.json');

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
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
