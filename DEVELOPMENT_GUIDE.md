# Guía de Desarrollo - Aurea 3D React

## 🎯 Objetivos de Este Documento

Ayudarte a entender cómo modificar, expandir y mantener el proyecto React.

---

## 📁 Estructura y Flujo

### 1. El Punto de Entrada
```
src/index.js
    ↓
src/App.js (Router con todas las rutas)
    ↓
src/pages/* (Una página por ruta)
    ↓
src/components/* (Componentes reutilizables)
```

### 2. Flujo de una Página

```jsx
// src/pages/MiPagina.jsx
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MiPagina() {
  return (
    <div className="bg-surface">
      <Navbar />
      
      <main className="max-w-7xl mx-auto">
        {/* Tu contenido aquí */}
      </main>
      
      <Footer />
    </div>
  );
}
```

---

## 🔧 Tareas Comunes de Desarrollo

### Agregar una Nueva Página

1. **Crear el archivo**
```bash
touch src/pages/MiPagina.jsx
```

2. **Escribir el componente**
```jsx
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MiPagina() {
  return (
    <div className="bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto">
        <h1>Mi Página</h1>
      </main>
      <Footer />
    </div>
  );
}
```

3. **Agregar ruta en App.js**
```jsx
import MiPagina from './pages/MiPagina';

// En <Routes>
<Route path="/mi-pagina" element={<MiPagina />} />
```

4. **Agregar link en Navbar**
```jsx
// En src/components/Navbar.jsx
<Link to="/mi-pagina">Mi Página</Link>
```

### Cambiar Colores

1. Abre `tailwind.config.js`
2. Busca la sección `colors:`
3. Cambia los valores hex

**Ejemplo:**
```js
"primary": "#006a67",  // ← Cambia esto
```

### Agregar una Clase CSS Personalizada

1. Abre `src/index.css`
2. Agrega tu clase

**Ejemplo:**
```css
.mi-clase {
  background: rgba(48, 173, 169, 0.1);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(48, 173, 169, 0.2);
}
```

3. Úsala en tus componentes
```jsx
<div className="mi-clase">Contenido</div>
```

### Agregar un Componente Reutilizable

1. Crea `src/components/MiComponente.jsx`
```jsx
export default function MiComponente({ titulo, contenido }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-6">
      <h2 className="font-headline font-bold">{titulo}</h2>
      <p>{contenido}</p>
    </div>
  );
}
```

2. Úsalo en tus páginas
```jsx
import MiComponente from '../components/MiComponente';

<MiComponente titulo="Hola" contenido="Mundo" />
```

---

## 🎨 Convenios de Código

### Estructura de Archivos
```
componente-nombre.jsx (camelCase)
PaginaNombre.jsx (PascalCase)
```

### Nomenclatura CSS
```jsx
// ✅ Bueno - Clases descriptivas
<div className="bg-primary text-white rounded-lg p-4">

// ❌ Malo - Abreviaciones confusas
<div className="bg-p txt-w rnd-lg p4">
```

### Importes
```jsx
// ✅ Bueno - Rutas relativas claras
import Navbar from '../components/Navbar';

// ❌ Malo - Rutas ambiguas
import Navbar from './Navbar';
```

---

## 🐛 Debugging

### Errores Comunes

**"Cannot find module"**
- Revisa que la ruta sea correcta
- Verifica que el nombre del archivo coincida

**"Cannot GET /ruta"**
- Asegúrate de usar `<Link>` no `<a>`
- Verifica que la ruta esté en App.js

**Estilos no aplican**
- Tailwind debe estar compilado (npm start lo hace)
- Revisa que la clase sea válida en tailwind.config.js

### Herramientas de Debugging

1. **Console del navegador** (F12)
   - Errores de JavaScript
   - Warnings de React

2. **React DevTools** (extensión del navegador)
   - Inspecciona el árbol de componentes
   - Mira el estado y props

3. **Terminal**
   - npm start muestra errores al compilar
   - npm test ejecuta tests

---

## 📦 Instalación de Librerías

### Para agregar una nueva librería

```bash
npm install nombre-libreria
```

**Ejemplo: Three.js para 3D**
```bash
npm install three
```

Luego úsala:
```jsx
import * as THREE from 'three';

export default function MiVisualizador3D() {
  return (
    <div ref={container} className="w-full h-96" />
  );
  // Aquí inicializarías Three.js
}
```

---

## 🔗 Enrutamiento

### Rutas Actuales
```
/              → LandingPage
/dashboard     → Dashboard
/editor        → Editor
/export        → ExportPanel
/upload        → UploadProcessing
/results       → ResultsEditor
/advanced      → AdvancedOutputs
```

### Agregar Ruta Dinámica

```jsx
// En App.js
<Route path="/proyecto/:id" element={<ProyectoDetalle />} />

// En el componente
import { useParams } from 'react-router-dom';

export default function ProyectoDetalle() {
  const { id } = useParams();
  return <div>Proyecto {id}</div>;
}
```

---

## 🎨 Customización de Estilos

### Sistema de Colores

**Escala de Grises:**
- `surface` - Fondo principal
- `surface-container-lowest` - Blanco puro
- `surface-container-low` - Gris muy claro
- `surface-container-high` - Gris claro
- `surface-variant` - Gris medio

**Colores Principales:**
- `primary` - Teal primario (#006a67)
- `primary-container` - Teal contenedor (#30ada9)

**Colores de Texto:**
- `on-surface` - Oscuro para superficies claras
- `on-surface-variant` - Gris oscuro para superficies
- `on-primary` - Blanco para elementos primarios

### Uso en Componentes

```jsx
// Fondo
<div className="bg-surface">           {/* Fondo principal */}
<div className="bg-primary">           {/* Teal primario */}
<div className="bg-surface-container-lowest">  {/* Blanco puro */}

// Texto
<p className="text-on-surface">        {/* Texto oscuro */}
<p className="text-primary">           {/* Texto teal */}
<p className="text-on-surface-variant">{/* Texto gris */}

// Bordes y Sombras
<div className="border border-primary">
<div className="shadow-lg">
<div className="rounded-lg">            {/* 1rem border-radius */}
```

---

## 📊 Performance

### Tips de Optimización

1. **Lazy Loading**
```jsx
import { lazy, Suspense } from 'react';

const Editor = lazy(() => import('./pages/Editor'));

<Suspense fallback={<div>Cargando...</div>}>
  <Editor />
</Suspense>
```

2. **Memoización**
```jsx
import { memo } from 'react';

export default memo(MiComponente);
```

3. **Code Splitting** (ya incluido con React Router)

---

## 🧪 Testing

### Estructura Básica

```jsx
// src/components/Navbar.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

test('renders Navbar', () => {
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
  expect(screen.getByText(/Aurea 3D/i)).toBeInTheDocument();
});
```

Ejecutar tests:
```bash
npm test
```

---

## 📱 Responsive Design

### Breakpoints de Tailwind

```
sm: 640px    (tablets pequeñas)
md: 768px    (tablets)
lg: 1024px   (laptops)
xl: 1280px   (desktops)
2xl: 1536px  (desktops grandes)
```

### Ejemplo

```jsx
<div className="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>
```

---

## 🚀 Build y Deploy

### Build Local
```bash
npm run build
```
Crea carpeta `build/` con archivos optimizados.

### Deploy a Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Deploy a Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

---

## 📚 Recursos

- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Material Symbols](https://fonts.google.com/icons)

---

## 💡 Checklist de Desarrollo

- [ ] Crear rama en Git para nuevas features
- [ ] Escribir tests para componentes
- [ ] Validar HTML semantic
- [ ] Optimizar imágenes
- [ ] Revisar accesibilidad (a11y)
- [ ] Documentar código complejo
- [ ] Hacer code review antes de mergear

---

## ❓ FAQs

**P: ¿Cómo agrego autenticación?**
R: Usa Context API o una librería como Auth0, Firebase, o implementa JWT con tu backend.

**P: ¿Cómo conecto una base de datos?**
R: Crea servicios en `src/services/` que llamen a tu backend API.

**P: ¿Cómo agrego dark mode?**
R: Usa el atributo `class="dark"` en HTML y los prefijos `dark:` de Tailwind.

**P: ¿Cómo optimizo el build?**
R: npm run build, revisa webpack bundle analyzer, usa code splitting.

---

## 🎯 Recuerda

- **DRY**: No repitas código, reutiliza componentes
- **KISS**: Mantén las cosas simples
- **Meaningful**: Nombres claros y descriptivos
- **Tested**: Escribe tests para features críticas

¡Happy Coding! 🚀
