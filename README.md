# Aurea 3D - React Project

Migración completa del diseño HTML a React con Tailwind CSS.

## 📋 Estructura del Proyecto

```
proyect-react/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Barra de navegación reutilizable
│   │   ├── Footer.jsx          # Pie de página reutilizable
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
npm start
```

## 📦 Dependencias

- React 19.2.4
- React Router DOM 7.13.2
- Tailwind CSS 4.2.2
- PostCSS 8.5.8
- Autoprefixer 10.4.27

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
# Iniciar servidor de desarrollo
npm start

# Build para producción
npm run build

# Tests
npm test
```

## 📄 Licencia

Aurea 3D - The Liquid Architect System © 2024
