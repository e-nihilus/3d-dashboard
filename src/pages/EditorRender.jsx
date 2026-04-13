import React from 'react';
import AppLayout from '../components/AppLayout';

export default function EditorRender() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Advanced Outputs</h1>
            <p className="text-on-surface-variant font-body max-w-2xl text-sm md:text-base">Your high-fidelity renders and interactive experiences are ready. Review your promotional assets or distribute them globally.</p>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start">

            {/* CGI Scenes (Hero Landscape) — shown first on mobile */}
            <section className="xl:col-span-12 order-1 xl:order-3">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">landscape</span> CGI Scenes
                </h2>
                <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  View All Renders <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="relative h-[420px] md:h-[500px] w-full rounded-lg overflow-hidden glass-panel group">
                <img
                  alt="Beautiful Landscape Render"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuArsl8M9GDJyDcDB2Pu-PZhc9jJhKhyy3ZWwr_UY3LDsS-onxX9keVRXVi06ti-0mkjMvCObhmKhBwUN5JgC1uGkAa8q5VoemIMsBmPOD0lFkK_gKVE-cv1MGHs24mWoILG0RK6g6WxWPJ-1u2C9rZMOWoWmJqNRAzxkZO-zENFUzxACv-iCsPyYcwkKCJVwOjtJrqP55yrAwwf0BepI6yFdQvCDcaWBiBifHTJqfg2vcGBH1OsLMPWfvNipto98_ovHUdapjbfb3U"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                  <div className="max-w-xl">
                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">Scene Hero 01</span>
                    <h3 className="text-2xl md:text-4xl font-extrabold font-headline text-white mb-2">Alpine Morning Mist</h3>
                    <p className="text-white/70 font-body text-sm md:text-base">Generated using Path Tracing with 2048 samples. Physical light simulation with atmospheric fog and high-density vegetation.</p>
                  </div>
                  {/* Desktop: zoom + download buttons */}
                  <div className="hidden md:flex gap-4">
                    <button className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white border border-white/20 hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">zoom_in</span>
                    </button>
                    <button className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-2xl shadow-primary-container/40">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                  {/* Mobile: single CTA button */}
                  <button className="md:hidden w-full py-3 bg-white text-primary rounded-full font-bold text-sm text-center">
                    View Full Detail
                  </button>
                </div>
              </div>
            </section>

            {/* Promotional Videos Section */}
            <section className="xl:col-span-8 flex flex-col gap-4 md:gap-6 order-2 xl:order-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">movie</span> Promotional Videos
                </h2>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-container px-3 py-1 bg-primary-container/10 rounded-full">4K Resolution</span>
              </div>
              {/* Desktop: grid | Mobile: horizontal scroll */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {[
                  { title: 'Turntable', subtitle: '360° Loop', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkYMr9o0sP3imQMR48l67Z0UQAODYviP8lcXLDCsNbVovunxFLSemqSmEF4aH33ru_6l4a2IF7Om6v-mfZgCGJwelvLcQZonCMO-wTwB5PkNw-7Pj5qCni4XgszeWpMKNMfo1i3AFJK7NCddpAhW4_1MRIOKmkqPfYZziTBke9jo-SS9g6zEqfA35v2pkO-GKpGqyZesBtXlqQDG113uQtRkeKgzP_P46EGrI0U_Sd-rXVBldZeu_7mHdaF_Qb4eHm_bLynJzQq8Q' },
                  { title: 'Lifestyle', subtitle: 'Environment Plate', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtIssayOf6lDHQz4OJ7U14sOkTrT5j4u1KZWA2itwZIpTOoLrgxlwknM29v9QeokE16GomHnHsveiqnijCGQwLB9srYmT3S3_KTFbLcGlV_T7h6NzgDIQaxaqNW2J3xTEyjKdMazuJ9pkyH5drT6IrtZwgGcfZeJCTqP-m0s_s1pB4j6LINWVh9R1jsdYBviaXNvzvMWmIfyCIBQ6P_gJjh5dRxl4ZDXcyPBZlJqUiMTnUydshx2JPOayk74uNLesdkAsR8WszEIU' },
                  { title: 'Cinematic', subtitle: 'Product Hero', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTeFD4Lbz0G5siIzgS11KkUiABGZhyagLsN0Z5GwacFP22BYMWBHzElu2hHNaRyDgo_PCq6rXLQplZSRf55diabGNDgtxNcmd2uQOap6CgdU7fjixtOBnHp-isWWnlKmaJ1_rs_56tWD8AIrBmH0s09s2GBv8YDGBb041oExEipiSHWhF2jf0-ZPr8-f9CHfxGonujMx8FbSrAU-z7E0ZEAB3mf3SyGXmGPYGhqkB8qAF0LHmQc-_9KaUKsXYsNcBbYVZC7EEUxw0' },
                ].map((video) => (
                  <div key={video.title} className="group relative aspect-[9/16] rounded-lg overflow-hidden glass-panel">
                    <img
                      alt={`${video.title} Render`}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      src={video.src}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6">
                      <p className="text-white font-headline font-bold">{video.title}</p>
                      <p className="text-white/60 text-xs font-body">{video.subtitle}</p>
                    </div>
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </button>
                  </div>
                ))}
              </div>
              {/* Mobile: horizontal scroll */}
              <div className="flex md:hidden overflow-x-auto gap-4 no-scrollbar pb-4 -mx-4 px-4">
                {[
                  { title: 'Turntable', subtitle: '360° Loop', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkYMr9o0sP3imQMR48l67Z0UQAODYviP8lcXLDCsNbVovunxFLSemqSmEF4aH33ru_6l4a2IF7Om6v-mfZgCGJwelvLcQZonCMO-wTwB5PkNw-7Pj5qCni4XgszeWpMKNMfo1i3AFJK7NCddpAhW4_1MRIOKmkqPfYZziTBke9jo-SS9g6zEqfA35v2pkO-GKpGqyZesBtXlqQDG113uQtRkeKgzP_P46EGrI0U_Sd-rXVBldZeu_7mHdaF_Qb4eHm_bLynJzQq8Q' },
                  { title: 'Lifestyle', subtitle: 'Environment Plate', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtIssayOf6lDHQz4OJ7U14sOkTrT5j4u1KZWA2itwZIpTOoLrgxlwknM29v9QeokE16GomHnHsveiqnijCGQwLB9srYmT3S3_KTFbLcGlV_T7h6NzgDIQaxaqNW2J3xTEyjKdMazuJ9pkyH5drT6IrtZwgGcfZeJCTqP-m0s_s1pB4j6LINWVh9R1jsdYBviaXNvzvMWmIfyCIBQ6P_gJjh5dRxl4ZDXcyPBZlJqUiMTnUydshx2JPOayk74uNLesdkAsR8WszEIU' },
                  { title: 'Cinematic', subtitle: 'Product Hero', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTeFD4Lbz0G5siIzgS11KkUiABGZhyagLsN0Z5GwacFP22BYMWBHzElu2hHNaRyDgo_PCq6rXLQplZSRf55diabGNDgtxNcmd2uQOap6CgdU7fjixtOBnHp-isWWnlKmaJ1_rs_56tWD8AIrBmH0s09s2GBv8YDGBb041oExEipiSHWhF2jf0-ZPr8-f9CHfxGonujMx8FbSrAU-z7E0ZEAB3mf3SyGXmGPYGhqkB8qAF0LHmQc-_9KaUKsXYsNcBbYVZC7EEUxw0' },
                ].map((video) => (
                  <div key={video.title} className="flex-none w-64 group relative aspect-[9/16] rounded-lg overflow-hidden glass-card">
                    <img
                      alt={`${video.title} Render`}
                      className="w-full h-full object-cover"
                      src={video.src}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white font-headline font-bold text-sm">{video.title}</p>
                      <p className="text-white/60 text-[11px] font-body">{video.subtitle}</p>
                    </div>
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* AR Experience & Assets Sidebar */}
            <section className="xl:col-span-4 flex flex-col gap-6 md:gap-8 order-3 xl:order-2">
              {/* AR Experience */}
              <div className="glass-panel p-6 md:p-8 rounded-lg shadow-2xl shadow-black/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container mb-4 md:mb-6">
                  <span className="material-symbols-outlined text-4xl">view_in_ar</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-headline mb-2">AR Experience</h2>
                <p className="text-on-surface-variant text-sm mb-6 md:mb-8">Deploy your 3D model into the physical world instantly.</p>
                <div className="bg-white p-6 rounded-2xl shadow-inner border-8 border-surface-container mb-4 md:mb-6">
                  <img
                    alt="AR QR Code"
                    className="w-32 h-32 md:w-40 md:h-40 opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvjjk1nBK51lNkrUxP4bmZ3GXw_iTw-4r5Jik309x5mHNZLw_JDZ17Rkw51xnzKG4M7f-MDDJFwsmW5TjIE1lqVKmZalLd3xuWZgZl-wuAG3mRc6V2pLdMC4AKcImdRCyNcU2a-i9Mofdik5yZDvcYIfp4atUVIER5OGZMvzyyhSFARx429Ej0EM11vogIPypueuNZXvwRIlFnCjDxzpUEGr6R-gHf9YGakJfu7ob4EZaPEoV6H4YGocxCEWpPSfeAHHPGvJM7Fls"
                  />
                </div>
                <p className="text-primary font-bold tracking-widest uppercase text-[10px] mb-4">Scan to View</p>
                {/* Mobile: single full-width CTA */}
                <button className="md:hidden w-full py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20">
                  Open AR Viewer
                </button>
                {/* Desktop: dual buttons */}
                <div className="hidden md:flex gap-2 w-full">
                  <button className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20">iOS App Clip</button>
                  <button className="flex-1 py-3 bg-surface-container-highest text-on-surface rounded-full font-bold text-sm">WebAR</button>
                </div>
              </div>

              {/* Assets Download */}
              <div className="glass-panel p-6 md:p-8 rounded-lg">
                <h3 className="font-headline font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">download</span> Assets
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-2xl md:rounded-2xl rounded-lg bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center md:w-auto md:h-auto md:rounded-none md:bg-transparent">
                        <span className="material-symbols-outlined text-on-surface-variant">deployed_code</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Download GLB</p>
                        <p className="text-[10px] text-on-surface-variant">Universal 3D Format • 14.2 MB</p>
                      </div>
                    </div>
                    <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined hidden md:block">chevron_right</span>
                      <span className="material-symbols-outlined md:hidden w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">download</span>
                    </div>
                  </button>
                  <button className="w-full p-4 rounded-2xl md:rounded-2xl rounded-lg bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center md:w-auto md:h-auto md:rounded-none md:bg-transparent">
                        <span className="material-symbols-outlined text-on-surface-variant">ios</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Download USDZ</p>
                        <p className="text-[10px] text-on-surface-variant">Apple ARKit Optimized • 12.8 MB</p>
                      </div>
                    </div>
                    <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined hidden md:block">chevron_right</span>
                      <span className="material-symbols-outlined md:hidden w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">download</span>
                    </div>
                  </button>
                </div>
              </div>
            </section>

            {/* Embed & Share Section */}
            <section className="xl:col-span-12 glass-panel p-6 md:p-8 rounded-lg mt-2 md:mt-4 order-4">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
                <div className="md:w-1/3 w-full">
                  <h2 className="text-xl md:text-2xl font-bold font-headline mb-3 md:mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">share</span> Embed &amp; Share
                  </h2>
                  <p className="text-on-surface-variant text-sm mb-4 md:mb-6">Integrate your 3D assets directly into your website or e-commerce platform with our high-performance viewer.</p>
                  {/* Desktop: inline buttons */}
                  <div className="hidden md:flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-bold hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-lg">content_copy</span> Copy Link
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-bold hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-lg">mail</span> Send to Email
                    </button>
                  </div>
                </div>
                <div className="md:w-2/3 w-full">
                  <div className="bg-on-surface p-4 md:p-6 rounded-2xl relative">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                      <span className="text-white/40 text-[10px] font-mono ml-4 uppercase tracking-tighter">Embed Snippet (iFrame)</span>
                    </div>
                    <code className="text-primary-fixed-dim font-mono text-xs md:text-sm leading-relaxed block overflow-x-auto whitespace-nowrap pb-2">
                      {'<iframe src="https://viewer.aurea3d.com/v/a7k2-9x1p" width="100%" height="600" frameborder="0" allowfullscreen></iframe>'}
                    </code>
                    <button className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                </div>
                {/* Mobile: 2-column button grid */}
                <div className="grid grid-cols-2 gap-3 w-full md:hidden">
                  <button className="flex items-center justify-center gap-2 py-3 bg-surface-container-high rounded-full text-sm font-bold">
                    <span className="material-symbols-outlined text-lg">content_copy</span> Copy Link
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-surface-container-high rounded-full text-sm font-bold">
                    <span className="material-symbols-outlined text-lg">mail</span> Send Email
                  </button>
                </div>
              </div>
            </section>
          </div>
      </main>
    </AppLayout>
  );
}
