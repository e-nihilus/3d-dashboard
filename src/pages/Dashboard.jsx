import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const sidebarItems = [
    { label: 'Materials', icon: 'palette', active: true, href: '#' },
    { label: 'Hierarchy', icon: 'layers', href: '#' },
    { label: 'Lighting', icon: 'light_mode', href: '#' },
    { label: 'Camera', icon: 'videocam', href: '#' },
    { label: 'Render', icon: 'shutter_speed', href: '#' }
  ];

  const models = [
    {
      id: 1,
      title: 'Skyline Penthouse',
      status: 'Ready',
      edited: 'Edited 2h ago',
      tags: ['ArchViz', '4K RT'],
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaifKZzpiyjAdFD-tIYZ3t0vsPBw11DRFjHTXgaj9jEjTRplWJCb9hixB271YrnovnGtabhedbfgSX-lvblfmywRt-hvFa1vNNeOmWazVaWPftE19ciCvq-ayYhZC0rQEFl-fGDXPt4E6n3erIBLIpDbCU1TyKDp0aePZjrKATZocF-ukqEhOsT8vRCcl-zH5u1X3FJy9CxN8qLO-XRdZnufcbESJ5HAezx8uGwXS9QrwWR8_ENiCh78DrtNluNeW7caljb8GHZ4Y'
    },
    {
      id: 2,
      title: 'Cyberpunk District',
      status: 'Processing',
      edited: 'Started 15m ago',
      progress: 74,
      tags: ['Environment']
    },
    {
      id: 3,
      title: 'Industrial Turbine',
      status: 'Error',
      error: 'Failed to verify geometry',
      tags: [],
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhz8RGR1rBT4J4RTzcSVth-IS-SQyuKBKiUViGuF9bEwNhbU5RF5FLSdx31_eYxtxh9bgaI9pNZaQJONREH7rjn2pDDGjRY22kil73kbodkIjFKLDBaLwWXdJQuVacIcGbG_g3I1aep4z-18MQbVeZUzBRfOPwxP8TZXLWiQ1g08QDygqA_cXJSr1BaI7Dh3gI2lPHGS5Mq0pd7GkwQ_UNVIplVNlh0wZz-arC3-P-tFGiHL8YyrWtPgOqmYpuB8FqMUUv27WWTQc'
    },
    {
      id: 4,
      title: 'Proto-E Roadster',
      status: 'Ready',
      edited: 'Last active yesterday',
      tags: ['Product'],
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXUhN5IHBr18gjXPurGiugmPLpdOepTZHo48T6QTGpyf6UAwJNQJ7RWs8iE47XE-L0TmuUDEKQgn29fC-E8M0dYQsVfUb4KHlOm649GhmO3ambvG5kWaDxAMfCgNPvIL74yiLQZf_Rin4A2ORn5UJqfreZz3RN2mKwrExWTCuWMmLzeCP68QwP9SrTcwKtECsbrcFwoZmLMmULN0a0JZLydtiOhTtL6-eHtl_dhRpgaS1YiUNyyzyja7a7yPXNp7mxB7g8SOWfOOk'
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-8 max-w-7xl mx-auto w-full">
        <Sidebar items={sidebarItems} title="Materials" version="v2.4 Liquid Engine" />
        
        <section className="flex-1 space-y-12 pb-20">
          {/* Header */}
          <header className="space-y-4">
            <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter mb-2">Tus modelos</h1>
            <p className="text-on-surface-variant font-medium max-w-lg leading-relaxed">
              Gestiona tus creaciones arquitectónicas en alta fidelidad. Renderiza, edita y exporta tus escenas líquidas.
            </p>
          </header>
          
          <button className="bg-primary-container text-on-primary-container flex items-center gap-3 px-8 py-4 rounded-full font-bold shadow-[0_20px_40px_-10px_rgba(48,173,169,0.3)] hover:brightness-105 transition-all active:scale-95 group">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
            Upload New
          </button>

          {/* Grid of Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.map((model) => (
              <div key={model.id} className="glass-card rounded-lg p-4 group cursor-pointer hover:translate-y-[-4px] transition-all duration-300">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-surface-container-high flex items-center justify-center">
                  {model.status === 'Processing' ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Processing Assets</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-surface-container-highest/90 backdrop-blur-md text-on-surface-variant text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {model.progress}%
                      </div>
                    </>
                  ) : model.status === 'Error' ? (
                    <>
                      <img alt="Error" className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 blur-sm" src={model.img} />
                      <div className="flex flex-col items-center gap-2 relative z-10 text-error">
                        <span className="material-symbols-outlined text-4xl">warning</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Mesh Conflict</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-error text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        Error
                      </div>
                    </>
                  ) : (
                    <>
                      <img 
                        alt={model.title} 
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" 
                        src={model.img}
                      />
                      <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {model.status}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="px-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-bold text-lg">{model.title}</h3>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">more_vert</span>
                  </div>
                  
                  <p className="text-xs text-on-surface-variant font-medium mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">
                      {model.status === 'Processing' ? 'schedule' : 'update'}
                    </span>
                    {model.edited}
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
            <div className="rounded-lg p-8 border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-primary/10 transition-all">
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
      
      <Footer />
    </div>
  );
}
