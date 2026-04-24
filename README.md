# Aurea 3D - React Project

Plataforma web para visualización y edición de modelos 3D. Construida con **React 19**, **Vite**, **Tailwind CSS** y **Three.js**.

---

## 🚀 Instalación y Arranque

```bash
cd landing-3d
npm install
```

### Iniciar el proyecto

Un solo comando levanta **cliente Vite + API server** simultáneamente:

```bash
npm run dev
```

| Servicio           | Puerto | URL                    |
|--------------------|--------|------------------------|
| Cliente (Vite)     | 5173   | http://localhost:5173   |
| API Server (Express) | 5174 | http://localhost:5174   |

También se pueden iniciar por separado:

```bash
npm run client   # Solo el cliente Vite
npm run server   # Solo el API server
```

### Build para producción

```bash
npm run build    # Genera carpeta build/
npm run preview  # Preview del build
```

---

## 📋 Estructura del Proyecto

```
landing-3d/
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx        # Layout principal con sidebar y navegación
│   │   ├── Footer.jsx           # Pie de página
│   │   ├── ModelPreview.jsx     # Preview 3D de modelos
│   │   ├── Navbar.jsx           # Barra de navegación
│   │   ├── PolyHavenPanel.jsx   # Panel de Poly Haven
│   │   ├── Sidebar.jsx          # Sidebar reutilizable
│   │   └── SketchfabModal.jsx   # Modal de Sketchfab
│   ├── pages/
│   │   ├── LandingPage.jsx      # Página de inicio
│   │   ├── Dashboard.jsx        # Dashboard de modelos
│   │   ├── EditorRender.jsx     # Render de escenas
│   │   ├── ExportPanel.jsx      # Panel de exportación
│   │   ├── UploadProcessing.jsx # Subida y procesamiento
│   │   ├── ResultsEditor.jsx    # Editor de resultados
│   │   └── AdvancedOutputs.jsx  # Outputs avanzados
│   ├── viewer/                  # Visor 3D (componentes, hooks, utils)
│   ├── App.jsx                  # Enrutamiento principal
│   ├── index.css                # Estilos globales
│   └── index.jsx                # Punto de entrada
├── public/
│   └── assets/                  # Modelos 3D subidos (.obj, .fbx, .glb)
├── server.js                    # API server (Express, puerto 5174)
├── vite.config.js               # Configuración de Vite
├── tailwind.config.js           # Configuración de Tailwind
├── postcss.config.js            # Configuración de PostCSS
└── package.json
```

---

## 🔗 Rutas

| Ruta              | Página              |
|-------------------|---------------------|
| `/`               | Landing Page        |
| `/dashboard`      | Dashboard de Modelos|
| `/editor`         | Visor/Editor 3D     |
| `/editor/render`  | Render              |
| `/export`         | Panel de Exportación|
| `/upload`         | Upload & Processing |
| `/results`        | Results Editor      |
| `/advanced`       | Advanced Outputs    |

---

## 🖥️ API Server

El servidor Express (`server.js`) corre en `http://localhost:5174` y gestiona los modelos 3D almacenados en `public/assets/`.

### Endpoints

| Método   | Ruta                     | Descripción                                      |
|----------|--------------------------|--------------------------------------------------|
| `GET`    | `/api/models`            | Lista todos los modelos (.obj, .fbx, .glb)       |
| `POST`   | `/api/models/upload`     | Sube un modelo 3D (campo `model`, máx 500 MB)    |
| `PATCH`  | `/api/models/:fileName`  | Renombra un modelo (body: `{ "title": "..." }`)  |
| `DELETE` | `/api/models/:fileName`  | Elimina un modelo                                |

Los metadatos (títulos) se guardan en `public/assets/models-meta.json`. Los modelos se sirven como estáticos desde `/assets/`.

---

## 🎨 Design System — "Liquid Architect"

### Colores Principales

| Color             | Código    | Clase Tailwind          |
|-------------------|-----------|-------------------------|
| Teal Primario     | `#006a67` | `bg-primary`, `text-primary` |
| Teal Contenedor   | `#30ada9` | `bg-primary-container`  |
| Superficie        | `#f3fafd` | `bg-surface`            |
| Texto oscuro      | `#161d1f` | `text-on-surface`       |
| Error             | `#ba1a1a` | `bg-error`, `text-error` |

### Tipografía

- **Manrope** — Headlines y displays (`font-headline`)
- **Inter** — Body y labels (`font-body`, `font-label`)

### Principios de Diseño

- **Liquid Glass**: Glassmorphism con blur de 24px
- **No-Line Rule**: Sin bordes 1px, solo cambios de color
- **Tonal Layering**: Profundidad mediante capas de color
- **Large Border Radius**: 1rem standard, 2rem/3rem para cards, 9999px para botones

---

## 📦 Dependencias

### Producción

- React 19, React DOM 19
- React Router DOM 7
- React Three Fiber + Drei (visualización 3D)
- Three.js
- Lucide React (iconos)
- Express 5 (API server)
- Multer (upload de archivos)
- CORS

### Desarrollo

- Vite 8
- @vitejs/plugin-react
- Tailwind CSS 3
- PostCSS + Autoprefixer
- Concurrently

---

## 🔧 Guía de Desarrollo

### Agregar una nueva página

1. Crear `src/pages/MiPagina.jsx`
2. Agregar la ruta en `src/App.jsx`:
   ```jsx
   import MiPagina from './pages/MiPagina';
   <Route path="/mi-pagina" element={<MiPagina />} />
   ```

### Agregar un componente reutilizable

Crear en `src/components/` y seguir el patrón existente con export default.

### Cambiar colores

Editar los valores hex en `tailwind.config.js` dentro de `theme.extend.colors`.

### Agregar estilos CSS personalizados

Agregar clases en `src/index.css` y usarlas con `className`.

### Convenciones

- Páginas: **PascalCase** (`MiPagina.jsx`)
- Componentes: **PascalCase** (`MiComponente.jsx`)
- Usar siempre clases Tailwind, evitar CSS externo
- Imports con rutas relativas claras (`../components/Navbar`)
- Usar `<Link>` de React Router, nunca `<a>` para navegación interna

---

## 📱 Breakpoints Responsive

```
sm:  640px   md:  768px   lg:  1024px   xl:  1280px   2xl: 1536px
```

---

## 📄 Licencia

Aurea 3D — The Liquid Architect System © 2024
