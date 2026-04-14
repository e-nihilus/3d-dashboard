# Aurea 3D - React Project

Migración completa del diseño HTML a React con Tailwind CSS.

## 📋 Estructura del Proyecto

```
proyect-react/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Barra de navegación reutilizable
│   │   ├── Footer.jsx          # Pie de página reutilizable
│   │   ├── ModelPreview.jsx    # Preview 3D de modelos
│   │   └── Sidebar.jsx         # Sidebar reutilizable
│   ├── pages/
│   │   ├── LandingPage.jsx     # Página de inicio
│   │   ├── Dashboard.jsx       # Dashboard de modelos
│   │   ├── Editor.jsx          # Editor 3D
│   │   ├── ExportPanel.jsx     # Panel de exportación
│   │   ├── UploadProcessing.jsx
│   │   ├── ResultsEditor.jsx
│   │   └── AdvancedOutputs.jsx
│   ├── App.js                  # Enrutamiento principal
│   ├── index.css               # Estilos globales
│   └── index.js                # Punto de entrada
├── public/
│   └── assets/                 # Modelos 3D subidos (.obj, .fbx, .glb)
├── server.js                   # API server (Express)
├── tailwind.config.js          # Configuración de Tailwind
├── postcss.config.js           # Configuración de PostCSS
└── package.json
```

## 🎨 Design System - "Liquid Architect"

### Colores Principales
- **Primary**: `#006a67` (Teal profundo)
- **Primary Container**: `#30ada9` (Teal digital)
- **Surface**: `#f3fafd` (Azul atmosférico)
- **Error**: `#ba1a1a`

### Tipografía
- **Manrope**: Headlines y displays (arquitectónico)
- **Inter**: Body, labels y texto (técnico)

### Componentes Clave
- **Liquid Glass**: Glassmorphism con blur de 24px
- **No-Line Rule**: Sin bordes 1px, solo cambios de color
- **Tonal Layering**: Profundidad mediante capas de color
- **Large Border Radius**: 24px standard, 9999px para botones

## 🚀 Instalación

```bash
cd proyect-react
npm install
```

### Iniciar el proyecto

Se necesitan **dos procesos** corriendo simultáneamente: el cliente React y el servidor API.

```bash
# Terminal 1 — Cliente React (puerto 3000)
npm start

# Terminal 2 — API Server (puerto 3001)
npm run server
```

## 🖥️ API Server

El servidor Express (`server.js`) corre en `http://localhost:3001` y gestiona los modelos 3D almacenados en `public/assets/`.

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/models` | Lista todos los modelos disponibles (.obj, .fbx, .glb) |
| `POST` | `/api/models/upload` | Sube un modelo 3D (campo `model`, máx 500 MB) |
| `PATCH` | `/api/models/:fileName` | Renombra un modelo (body: `{ "title": "..." }`) |
| `DELETE` | `/api/models/:fileName` | Elimina un modelo |

### Archivos estáticos

Los modelos subidos se sirven desde `/assets/` y sus metadatos (títulos personalizados) se guardan en `public/assets/models-meta.json`.

### Dependencias del servidor

- Express 5
- Multer (upload de archivos)
- CORS

## 📦 Dependencias

- React 19.2.4
- React Router DOM 7.13.2
- React Three Fiber + Drei (visualización 3D)
- Three.js 0.183
- Tailwind CSS 3.4
- PostCSS 8.5
- Autoprefixer 10.4

## 🔗 Rutas Disponibles

| Ruta | Página |
|------|--------|
| `/` | Landing Page |
| `/dashboard` | Dashboard de Modelos |
| `/editor` | Editor 3D |
| `/export` | Panel de Exportación |
| `/upload` | Upload & Processing |
| `/results` | Results Editor |
| `/advanced` | Advanced Outputs |

## 🎯 Características Implementadas

✅ Navbar reutilizable con navegación
✅ Landing page completa con hero section
✅ Dashboard con grid de modelos
✅ Editor 3D con viewport
✅ Panel de exportación con opciones
✅ Footer reutilizable
✅ Sidebar para controles
✅ Diseño responsive
✅ Estilos Tailwind CSS
✅ Enrutamiento con React Router

## 📝 Próximos Pasos

- [ ] Integrar componentes 3D (Three.js o Babylon.js)
- [ ] Implementar lógica de autenticación
- [ ] Conectar APIs backend
- [ ] Agregar formularios funcionales
- [ ] Implementar upload de archivos
- [ ] Agregar temas dark/light
- [ ] Optimizar imágenes
- [ ] Testing unitario

## 🛠️ Desarrollo

```bash
# Iniciar cliente React (puerto 3000)
npm start

# Iniciar API server (puerto 3001)
npm run server

# Build para producción
npm run build

# Tests
npm test
```

## 📄 Licencia

Aurea 3D - The Liquid Architect System © 2024
