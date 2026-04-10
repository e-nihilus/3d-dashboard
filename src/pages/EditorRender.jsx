import React from 'react';
import AppLayout from '../components/AppLayout';

export default function EditorRender() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <header className="mb-12">
            <h1 className="text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Advanced Outputs</h1>
            <p className="text-on-surface-variant font-body max-w-2xl">Your high-fidelity renders and interactive experiences are ready. Review your promotional assets or distribute them globally.</p>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Promotional Videos Section */}
            <section className="xl:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">movie</span> Promotional Videos
                </h2>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-container px-3 py-1 bg-primary-container/10 rounded-full">4K Resolution</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </section>

            {/* AR Experience & QR Sidebar */}
            <section className="xl:col-span-4 flex flex-col gap-8">
              <div className="glass-panel p-8 rounded-lg shadow-2xl shadow-black/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container mb-6">
                  <span className="material-symbols-outlined text-4xl">view_in_ar</span>
                </div>
                <h2 className="text-2xl font-bold font-headline mb-2">AR Experience</h2>
                <p className="text-on-surface-variant text-sm mb-8">Deploy your 3D model into the physical world instantly.</p>
                <div className="bg-white p-6 rounded-2xl shadow-inner border-8 border-surface-container mb-6">
                  <img
                    alt="AR QR Code"
                    className="w-40 h-40 opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvjjk1nBK51lNkrUxP4bmZ3GXw_iTw-4r5Jik309x5mHNZLw_JDZ17Rkw51xnzKG4M7f-MDDJFwsmW5TjIE1lqVKmZalLd3xuWZgZl-wuAG3mRc6V2pLdMC4AKcImdRCyNcU2a-i9Mofdik5yZDvcYIfp4atUVIER5OGZMvzyyhSFARx429Ej0EM11vogIPypueuNZXvwRIlFnCjDxzpUEGr6R-gHf9YGakJfu7ob4EZaPEoV6H4YGocxCEWpPSfeAHHPGvJM7Fls"
                  />
                </div>
                <p className="text-primary font-bold tracking-widest uppercase text-[10px] mb-4">Scan to View</p>
                <div className="flex gap-2 w-full">
                  <button className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20">iOS App Clip</button>
                  <button className="flex-1 py-3 bg-surface-container-highest text-on-surface rounded-full font-bold text-sm">WebAR</button>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-lg">
                <h3 className="font-headline font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">download</span> Assets
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-2xl bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <span className="material-symbols-outlined text-on-surface-variant">deployed_code</span>
                      <div>
                        <p className="font-bold text-sm">Download GLB</p>
                        <p className="text-[10px] text-on-surface-variant">Universal 3D Format • 14.2 MB</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                  </button>
                  <button className="w-full p-4 rounded-2xl bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <span className="material-symbols-outlined text-on-surface-variant">ios</span>
                      <div>
                        <p className="font-bold text-sm">Download USDZ</p>
                        <p className="text-[10px] text-on-surface-variant">Apple ARKit Optimized • 12.8 MB</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>

            {/* CGI Scenes (Hero Landscape) */}
            <section className="xl:col-span-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">landscape</span> CGI Scenes
                </h2>
                <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  View All Renders <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="relative h-[500px] w-full rounded-lg overflow-hidden glass-panel group">
                <img
                  alt="Beautiful Landscape Render"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuArsl8M9GDJyDcDB2Pu-PZhc9jJhKhyy3ZWwr_UY3LDsS-onxX9keVRXVi06ti-0mkjMvCObhmKhBwUN5JgC1uGkAa8q5VoemIMsBmPOD0lFkK_gKVE-cv1MGHs24mWoILG0RK6g6WxWPJ-1u2C9rZMOWoWmJqNRAzxkZO-zENFUzxACv-iCsPyYcwkKCJVwOjtJrqP55yrAwwf0BepI6yFdQvCDcaWBiBifHTJqfg2vcGBH1OsLMPWfvNipto98_ovHUdapjbfb3U"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                  <div className="max-w-xl">
                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">Scene Hero 01</span>
                    <h3 className="text-4xl font-extrabold font-headline text-white mb-2">Alpine Morning Mist</h3>
                    <p className="text-white/70 font-body">Generated using Path Tracing with 2048 samples. Physical light simulation with atmospheric fog and high-density vegetation.</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white border border-white/20 hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">zoom_in</span>
                    </button>
                    <button className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-2xl shadow-primary-container/40">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Embed & Share Section */}
            <section className="xl:col-span-12 glass-panel p-8 rounded-lg mt-4">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3">
                  <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">share</span> Embed &amp; Share
                  </h2>
                  <p className="text-on-surface-variant text-sm mb-6">Integrate your 3D assets directly into your website or e-commerce platform with our high-performance viewer.</p>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-bold hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-lg">content_copy</span> Copy Link
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-bold hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-lg">mail</span> Send to Email
                    </button>
                  </div>
                </div>
                <div className="md:w-2/3 w-full">
                  <div className="bg-on-surface p-6 rounded-2xl relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                      <span className="text-white/40 text-[10px] font-mono ml-4 uppercase tracking-tighter">Embed Snippet (iFrame)</span>
                    </div>
                    <code className="text-primary-fixed-dim font-mono text-sm leading-relaxed block overflow-x-auto whitespace-nowrap pb-2">
                      {'<iframe src="https://viewer.aurea3d.com/v/a7k2-9x1p" width="100%" height="600" frameborder="0" allowfullscreen></iframe>'}
                    </code>
                    <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
      </main>
    </AppLayout>
  );
}
