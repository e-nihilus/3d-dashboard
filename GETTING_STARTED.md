# Aurea 3D - Guía Rápida de Inicio

## ⚡ 3 Pasos para Empezar

### 1️⃣ Terminal - Ir a la carpeta
```bash
cd proyect-react
```

### 2️⃣ Terminal - Iniciar servidor
```bash
npm start
```

### 3️⃣ Navegador
- Se abrirá automáticamente en http://localhost:3000
- ¡Listo! El proyecto está corriendo 🎉

---

## 📍 Dónde Está Todo

### 🎨 Si quieres editar colores
Archivo: `tailwind.config.js`

Busca la sección `colors:` y cambia los valores hex.

### 📄 Si quieres editar la Landing Page
Archivo: `src/pages/LandingPage.jsx`

Es el archivo más grande, contiene todo lo que ves en `/`.

### 🧩 Si quieres editar componentes compartidos
Carpeta: `src/components/`

- `Navbar.jsx` - Barra superior
- `Footer.jsx` - Pie de página
- `Sidebar.jsx` - Barra lateral

### 🎯 Si quieres editar otras páginas
Carpeta: `src/pages/`

- Dashboard
- Editor
- ExportPanel
- Etc.

### 🎨 Si quieres editar estilos globales
Archivo: `src/index.css`

Aquí están las clases personalizadas como `.liquid-glass`.

---

## 🔗 Rutas / URLs

Cuando el servidor esté corriendo, puedes visitar:

```
http://localhost:3000/                    ← Landing
http://localhost:3000/dashboard          ← Dashboard
http://localhost:3000/editor            ← Editor 3D
http://localhost:3000/export            ← Exportar
http://localhost:3000/upload            ← Upload
http://localhost:3000/results           ← Resultados
http://localhost:3000/advanced          ← Avanzado
```

---

## 🎓 Estructura de Carpetas Explicada

```
proyect-react/
│
├── src/                           ← Código fuente
│   ├── components/                ← Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── pages/                     ← Páginas (una por ruta)
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Editor.jsx
│   │   ├── ExportPanel.jsx
│   │   └── ...
│   │
│   ├── App.js                     ← Configuración de rutas
│   ├── index.js                   ← Punto de entrada
│   └── index.css                  ← Estilos globales
│
├── tailwind.config.js             ← Colores, fuentes, etc.
├── postcss.config.js              ← Procesador de CSS
├── package.json                   ← Dependencias
└── README.md                       ← Documentación
```

---

## 🎨 Color Cheat Sheet

Todos estos colores están disponibles como clases Tailwind:

| Color | Código | Clase Tailwind |
|-------|--------|---|
| Teal Primario | #006a67 | `bg-primary`, `text-primary` |
| Teal Contenedor | #30ada9 | `bg-primary-container` |
| Azul Superficie | #f3fafd | `bg-surface` |
| Gris Oscuro | #161d1f | `text-on-surface` |
| Error | #ba1a1a | `bg-error`, `text-error` |

Ejemplo de uso:
```jsx
<button className="bg-primary text-white">Botón primario</button>
<div className="bg-surface">Fondo de superficie</div>
<span className="text-primary-container">Texto teal</span>
```

---

## 🔥 Cambios Rápidos

### Cambiar color principal
En `tailwind.config.js`, busca:
```js
"primary": "#006a67",
```
Y cámbialo al color que quieras.

### Cambiar tipografía
En `tailwind.config.js`, busca:
```js
fontFamily: {
  "headline": ["Manrope"],
  "body": ["Inter"],
},
```

### Agregar nueva página
1. Crea un archivo en `src/pages/MiPagina.jsx`
2. Agrégalo a `src/App.js`:
```jsx
<Route path="/mi-ruta" element={<MiPagina />} />
```
3. ¡Listo! Ya está disponible en http://localhost:3000/mi-ruta

---

## ⚠️ Errores Comunes

### "Module not found"
Solución: Asegúrate de que la ruta del import es correcta
```jsx
// ❌ Malo
import Navbar from './Navbar'

// ✅ Bueno
import Navbar from '../components/Navbar'
```

### "Cannot GET /dashboard"
Solución: Usa `<Link>` de React Router, no `<a>` HTML
```jsx
// ❌ Malo
<a href="/dashboard">Ir</a>

// ✅ Bueno
<Link to="/dashboard">Ir</Link>
```

---

## 📚 Documentos de Referencia

En la carpeta raíz encontrarás:
- `DESIGN.md` - Especificación del design system
- `SETUP.md` - Configuración y próximos pasos
- `MIGRATION_SUMMARY.md` - Resumen de la migración

---

## 🚀 Siguiente Paso

Cuando entiendas la estructura, puedes:

1. **Agregar funcionalidad** - Formas, validación
2. **Integrar APIs** - Conectar con backend
3. **Agregar librerías** - Three.js para 3D, etc.
4. **Publicar** - Deploy a Vercel, Netlify, etc.

---

## 💡 Pro Tips

- **Hot Reload**: Los cambios se guardan automáticamente
- **Console**: Abre la consola del navegador (F12) para errores
- **Componentes**: Siempre reutiliza, no dupliques código
- **Estilos**: Usa solo Tailwind, evita CSS externo

---

## ✨ ¡Estás Listo!

El proyecto está **100% funcional** y listo para desarrollar.

¿Preguntas? Revisa los archivos de documentación o experimenta 🚀

Happy Coding! 🎉
