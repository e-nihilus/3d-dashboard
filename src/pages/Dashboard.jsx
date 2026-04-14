import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ModelPreview from '../components/ModelPreview';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const nextIdRef = useRef(3);
  const dragAreaRef = useRef(null);
  const API_URL = 'http://localhost:3001/api';

  const formatDate = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `Edited ${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Edited ${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Last active yesterday';
    return `Edited ${days}d ago`;
  };
  const MAX_FILE_SIZE = 500 * 1024 * 1024;
  const ALLOWED_FORMATS = ['obj', 'fbx', 'glb'];

  const addModelFromFile = async (file) => {
    if (!file) return;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      alert('Please select an OBJ, FBX, or GLB file');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 500MB limit');
      return;
    }
    const formData = new FormData();
    formData.append('model', file);
    try {
      const res = await fetch(`${API_URL}/models/upload`, { method: 'POST', body: formData });
      const newModel = await res.json();
      if (res.ok) {
        newModel.modelPath = `http://localhost:3001${newModel.modelPath}`;
        setModels((prev) => [...prev, newModel]);
      } else {
        alert(newModel.error || 'Upload failed');
      }
    } catch {
      alert('Could not connect to server. Make sure the API server is running.');
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.obj,.fbx,.glb';
    input.onchange = (e) => addModelFromFile(e.target.files?.[0]);
    input.click();
  };

  const handleInputChange = (e) => {
    addModelFromFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragAreaRef.current?.classList.add('border-primary/80', 'bg-primary/20');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragAreaRef.current?.classList.remove('border-primary/80', 'bg-primary/20');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragAreaRef.current?.classList.remove('border-primary/80', 'bg-primary/20');
    addModelFromFile(e.dataTransfer.files?.[0]);
  };

  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/models`)
      .then((res) => res.json())
      .then((data) => {
        const withFullPath = data.map((m) => ({
          ...m,
          modelPath: `http://localhost:3001${m.modelPath}`,
        }));
        setModels(withFullPath);
      })
      .catch(() => console.error('Could not fetch models from API'));
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    setOpenMenuId(null);
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    const model = models.find((m) => m.id === deleteConfirm);
    if (model?.fileName) {
      try {
        await fetch(`${API_URL}/models/${encodeURIComponent(model.fileName)}`, { method: 'DELETE' });
      } catch {
        alert('Could not connect to server.');
      }
    }
    setModels((prev) => prev.filter((m) => m.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const handleEdit = (model) => {
    setOpenMenuId(null);
    navigate(`/editor?model=${encodeURIComponent(model.modelPath)}&title=${encodeURIComponent(model.title)}`);
  };

  const handleDownload = (model) => {
    setOpenMenuId(null);
    const link = document.createElement('a');
    link.href = model.modelPath;
    link.download = model.modelPath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredModels = models.filter((model) =>
    model.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <section className="space-y-8 pb-20">
            {/* Header with search + upload */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="font-headline text-2xl md:text-4xl font-extrabold text-on-surface tracking-tighter mb-1">Your Models</h1>
                <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
                  Manage your architectural creations in high fidelity.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                {/* Search Bar */}
                <div className="flex items-center bg-slate-100/80 rounded-full px-4 py-2.5 gap-2 border border-slate-200/60 focus-within:border-primary/40 focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-slate-400 w-44"
                  />
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUploadClick}
                  className="bg-primary-container text-on-primary-container flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-[0_10px_30px_-8px_rgba(48,173,169,0.3)] hover:brightness-105 transition-all active:scale-95 text-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Upload New
                </button>
              </div>
            </header>

            {/* Mobile Search Bar */}
            <div className="md:hidden">
              <div className="flex items-center bg-surface-container-high rounded-full px-5 py-3.5 focus-within:ring-2 focus-within:ring-primary shadow-sm">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search models, scenes or assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant mx-3"
                />
                <span className="material-symbols-outlined text-on-surface-variant text-xl">tune</span>
              </div>
            </div>

            {/* Mobile Quick Actions */}
            <div className="grid grid-cols-2 gap-4 md:hidden">
              <div
                onClick={handleUploadClick}
                className="glass-card p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container text-2xl">cloud_upload</span>
                </div>
                <span className="text-sm font-bold text-on-surface">Upload Model</span>
              </div>
              <div className="glass-card p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-3 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container text-2xl">photo_camera</span>
                </div>
                <span className="text-sm font-bold text-on-surface">Camera Scan</span>
              </div>
            </div>

            {/* Grid of Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredModels.map((model) => (
                <div key={model.id} className={`glass-card rounded-lg p-4 group cursor-pointer hover:translate-y-[-4px] transition-all duration-300 relative ${openMenuId === model.id ? 'z-50' : ''}`}>
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    {model.modelPath ? (
                      <>
                        <ModelPreview modelPath={model.modelPath} />
                        <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 z-10">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {model.status}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading Model</span>
                      </div>
                    )}
                  </div>

                  <div className="px-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-headline font-bold text-lg">{model.title}</h3>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === model.id ? null : model.id); }}
                          className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">more_vert</span>
                        </button>
                        {openMenuId === model.id && (
                            <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 animate-[fadeIn_0.15s_ease-out]">
                              <button
                                onClick={() => handleEdit(model)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-on-surface hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDownload(model)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-on-surface hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download
                              </button>
                              <div className="my-1 border-t border-slate-100"></div>
                              <button
                                onClick={() => handleDelete(model.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                Delete
                              </button>
                            </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant font-medium mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">update</span>
                      {formatDate(model.edited)}
                    </p>

                    <div className="flex items-center gap-2">
                      {model.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-surface-container-high px-2 py-1 rounded-full font-semibold uppercase tracking-tighter text-on-surface-variant">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Upload Placeholder */}
              <div
                ref={dragAreaRef}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="rounded-lg p-8 border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-primary/10 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".obj,.fbx,.glb"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg">Drag & Drop</h4>
                  <p className="text-xs text-on-surface-variant mt-1">OBJ, FBX, or GLB files up to 500MB</p>
                </div>
              </div>
            </div>
          </section>
        </main>

      {/* Mobile FAB */}
      <button
        onClick={handleUploadClick}
        className="md:hidden fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">delete</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Delete Model</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              Are you sure you want to delete this model? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-on-surface hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
