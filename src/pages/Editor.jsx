import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export default function Editor() {
  const sidebarItems = [
    { label: 'Hierarchy', icon: 'layers', href: '#' },
    { label: 'Materials', icon: 'palette', active: true, href: '#' },
    { label: 'Lighting', icon: 'light_mode', href: '#' },
    { label: 'Camera', icon: 'videocam', href: '#' },
    { label: 'Render', icon: 'shutter_speed', href: '#' }
  ];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 max-w-[1920px] mx-auto w-full h-[calc(100vh-120px)] overflow-hidden">
        <Sidebar items={sidebarItems} title="Scene Architect" version="v2.4 Liquid Engine" />
        
        {/* Main Viewport Area */}
        <section className="flex-1 flex flex-col gap-4">
          {/* Viewport Header */}
          <header className="flex justify-between items-center px-4">
            <div>
              <h1 className="font-headline text-xl font-bold text-on-surface">Aero_Concept_Final.obj</h1>
              <p className="text-on-surface-variant text-xs font-medium">8.4M Polygons • Last saved 2m ago</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-highest text-on-surface font-bold text-sm hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">ios_share</span>
                Exportar
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-bold text-sm shadow-lg hover:shadow-primary/10 transition-transform active:scale-95">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Descargar
              </button>
            </div>
          </header>
          
          {/* 3D Viewport */}
          <div className="flex-1 relative rounded-xl overflow-hidden viewport-bg group">
            {/* Floating Tools */}
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
              <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl">
                <button className="p-2 hover:bg-white/40 rounded-xl transition-colors text-primary" title="Orbit">
                  <span className="material-symbols-outlined">api</span>
                </button>
                <button className="p-2 hover:bg-white/40 rounded-xl transition-colors text-outline" title="Pan">
                  <span className="material-symbols-outlined">drag_pan</span>
                </button>
                <button className="p-2 hover:bg-white/40 rounded-xl transition-colors text-outline" title="Zoom">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
              </div>
            </div>
            
            {/* 3D Content Area */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[400px] h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 to-teal-100 rounded-[3rem] rotate-12 blur-2xl opacity-50"></div>
                <img 
                  alt="3D render" 
                  className="relative z-0 w-full h-full object-contain mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWNdCDT7bw9dD2KtLMRisqVG0MXbSUH0pnXGvwkmNBQPUYAWRF-gD7tPxlV2EzJpQJsPqTNEv5d5ZUvGpchEL_HRPY1NZ0sXpiEh0dfVuujQj3Ta0EepBm33H_1hGG43vM3DErp_JHuNwYJn8KxFYxM8jdOKvUkbZ_SVZre6ft3WPZZhA-Rj2wFK2LWPghgKn8lt6HbwAjbpIxp0sJXWlc7lWbW3pDmuXPizxAZCwR59aQiyWqz4oGPf6dGjCUHBRytX5ZKmghDA0"
                />
                
                {/* Detail Marker */}
                <div className="absolute top-1/4 left-1/4 z-10 flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse border-2 border-white"></div>
                  <div className="mt-2 glass-panel px-3 py-1 rounded-full text-[10px] font-bold text-on-primary-container shadow-sm">
                    REFRACTION: 1.45
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl">
              <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-8">
                <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">videocam</button>
                <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">grid_on</button>
                <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">measure</button>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[18px]">replay_10</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[18px]">forward_10</span>
                </button>
              </div>
              <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-8">
                <span className="text-xs font-bold text-on-surface-variant font-mono">00:04:12</span>
                <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">fullscreen</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
