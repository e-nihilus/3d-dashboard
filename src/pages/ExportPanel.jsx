import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export default function ExportPanel() {
  const sidebarItems = [
    { label: 'Hierarchy', icon: 'layers', href: '#' },
    { label: 'Materials', icon: 'palette', href: '#' },
    { label: 'Lighting', icon: 'light_mode', href: '#' },
    { label: 'Camera', icon: 'videocam', href: '#' },
    { label: 'Render', icon: 'shutter_speed', active: true, href: '#' }
  ];

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12">
        <Sidebar items={sidebarItems} title="Scene Architect" version="v2.4 Liquid Engine" />
        
        {/* Main Content */}
        <div className="flex-1 space-y-12 pb-20">
          {/* Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
              <span className="w-8 h-[2px] bg-primary"></span>
              Output Engine
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-black text-on-background tracking-tighter leading-none">
              Export & <span className="text-primary-container">Share</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
              Finalize your scene for any destination. From high-fidelity raw formats to instant AR previews, choose the output that fits your workflow.
            </p>
          </header>
          
          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* 3D Formats */}
            <div className="md:col-span-4 bg-surface-container-lowest rounded-lg p-8 shadow-[0_40px_60px_-5px_rgba(22,29,31,0.05)] border-none relative overflow-hidden group">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-2xl font-headline font-bold mb-2">3D Asset Formats</h3>
                    <p className="text-on-surface-variant font-medium">Production-ready geometry & textures</p>
                  </div>
                  <span className="bg-primary/5 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">High Poly</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['GLB / GLTF 2.0', 'USDZ (Reality)'].map((format, idx) => (
                    <button key={idx} className="flex flex-col items-start p-6 rounded-lg bg-surface-container-low hover:bg-primary-container/10 transition-colors text-left group/btn">
                      <span className="bg-white p-2 rounded-lg mb-4 shadow-sm group-hover/btn:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary">{idx === 0 ? 'view_in_ar' : 'ios'}</span>
                      </span>
                      <span className="font-bold text-lg">{format}</span>
                      <span className="text-sm text-on-surface-variant opacity-70">
                        {idx === 0 ? 'Web & Universal Support' : 'iOS AR & Mac Ecosystem'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* AR Preview */}
            <div className="md:col-span-2 bg-primary-container text-on-primary-container rounded-lg p-8 flex flex-col items-center text-center justify-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
              <h3 className="text-xl font-headline font-extrabold uppercase tracking-tighter">Mobile Preview</h3>
              <div className="bg-white p-4 rounded-lg shadow-xl">
                <div className="w-32 h-32 bg-slate-900 flex items-center justify-center rounded-sm">
                  <span className="material-symbols-outlined text-white text-5xl">qr_code_2</span>
                </div>
              </div>
              <p className="text-sm font-semibold opacity-90 px-4">Scan to launch instant AR experience on your device</p>
              <button className="w-full py-3 bg-on-primary-container text-white rounded-full font-bold text-sm tracking-wide active:scale-95 transition-transform">Get Link</button>
            </div>
            
            {/* Media Output */}
            <div className="md:col-span-3 bg-surface-container-lowest rounded-lg p-8 shadow-[0_40px_60px_-5px_rgba(22,29,31,0.05)] border-none">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                <div>
                  <h3 className="text-xl font-headline font-bold">Visual Rendering</h3>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Static & Motion</p>
                </div>
              </div>
              <div className="space-y-3">
                {['PNG / JPEG High-Res', 'MP4 / Cinematic Fly-over'].map((format, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-high rounded-full group cursor-pointer hover:bg-surface-container-highest transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant opacity-60">
                        {idx === 0 ? 'image' : 'movie'}
                      </span>
                      <span className="font-bold">{format}</span>
                    </div>
                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Embed */}
            <div className="md:col-span-3 bg-surface-container-lowest rounded-lg p-8 shadow-[0_40px_60px_-5px_rgba(22,29,31,0.05)] border-none">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">code</span>
                <div>
                  <h3 className="text-xl font-headline font-bold">Embed Code</h3>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Seamless Integration</p>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-900 rounded-lg p-4 font-mono text-xs text-teal-400 overflow-hidden text-ellipsis whitespace-nowrap">
                  &lt;iframe src="https://3d-infinite.com/view/729-1a" width="100%" height="600px"&gt;&lt;/iframe&gt;
                </div>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 p-2 rounded-md transition-colors">
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
              <p className="mt-4 text-xs text-on-surface-variant font-medium">Supports React, Vue, and vanilla HTML5</p>
            </div>
          </div>
          
          {/* Live Preview */}
          <section className="space-y-6 pt-8">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-headline font-bold">Live Export Preview</h2>
              <span className="text-sm font-bold text-primary">Rendering at 4K Ultra...</span>
            </div>
            <div className="relative group aspect-video rounded-lg overflow-hidden bg-slate-200 shadow-inner">
              <img 
                alt="3D abstract render" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwCLmqgystsInuYYfONptOiyyquGGfTy7thebfe41YNVHRH5F0li7WXAjjghwwyEtIUYdnJc7yRf4lM4j7odxk-tDVRrGbbWpVoIB0LWAB5_YaNrbA1WxA4-8RqTeybBQCay2QjObdwtcf442tvRdhPr8rlKzD1xYD-9X_eLmvdOMje9cu2lJ7sUgL_VA7hfvBHSMUjf-0ZYfEZOF3_WUPJOFekyKzJhembEErs5Xji0MUIUa6do3cfXP808rXpYY-5GoUEJuT--A"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined text-white">play_arrow</span>
                </div>
                <div className="text-white">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">Project Name</p>
                  <p className="font-headline font-bold text-lg">Architectural Fluidity Vol. 1</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
