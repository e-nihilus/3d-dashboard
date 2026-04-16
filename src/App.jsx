import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import EditorHierarchy from './pages/EditorHierarchy';
import EditorMaterials from './pages/EditorMaterials';
import EditorLighting from './pages/EditorLighting';
import EditorCamera from './pages/EditorCamera';
import EditorRender from './pages/EditorRender';
import ExportPanel from './pages/ExportPanel';
import UploadProcessing from './pages/UploadProcessing';
import ResultsEditor from './pages/ResultsEditor';
import AdvancedOutputs from './pages/AdvancedOutputs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/hierarchy" element={<EditorHierarchy />} />
        <Route path="/editor/materials" element={<EditorMaterials />} />
        <Route path="/editor/lighting" element={<EditorLighting />} />
        <Route path="/editor/camera" element={<EditorCamera />} />
        <Route path="/editor/render" element={<EditorRender />} />
        <Route path="/export" element={<ExportPanel />} />
        <Route path="/upload" element={<UploadProcessing />} />
        <Route path="/results" element={<ResultsEditor />} />
        <Route path="/advanced" element={<AdvancedOutputs />} />
      </Routes>
    </Router>
  );
}

export default App;
