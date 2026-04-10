import React from 'react';
import AppLayout from '../components/AppLayout';

const assetImages = [
  { label: 'Front View', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpJOG3GSOjsKlanJhCI-hJ5PD9QVY6l5LEjxlXgy6F5qm9aQyP_HfKwrN4P6hcYjsKiIWsZZBzSCY3_mhcbR4eQy7YKx_dRoL3hehNqp99DnBkXIt5nKyN9Zze5bi3g6QmUjEuqhh5IdhThTKbNiXzCR1WyIDfvTqsjXWqg5N5z20XrgMCZmSpQxAo-8ufqeAIId8I9x8eeGqiOIea1KLqJgpDul8Vzb0Bj5xD6EOWIAKjpkHZeW-emSXHEA0OToObbEum9ZozX_A' },
  { label: 'Side View', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5ZPT6_AJcUTKptt5Nmb75bBsT0Sv_rSHKSmHpTEvHuf8K6hPd2VmgodTOtQMySS7nCFmxqe8gZco7zqZiUuyZECAkQfIVlOxrrHTuiQTS_ka32mPOSUCHqVqaqGYZXnek6DXYy_rMJKLhIeINiucxG082M9XuSGvk_GG0YRk_TUXD8QQSh6DQAOGUE5n54sMSc55hh9fR5gmbLHBsd-oNHjhAgVjEAwDzuD1SVLxpetQnujpCEI3xMqJ_o03hdK9kbHqJUQ7f4zw' },
  { label: 'Top View', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrZUsY1JfeJCsUoaOSfIO-yihnbYUjpVZ1-o0ozoWg9y8ADzUpnw3Tn2WJjkYti7GMVoOJvD9EomB9FATdQgx3sv9DR3eZc8cB3UEnFBPM-QZSWokvVSLi4lpj7PW-70xA90JtR5P47RzzKparhxYvjsMjp9rbTqx7C3EpPg1384A2GaZmfhy7kvo-8bmWpD2K7p6SI36UhZQAYOSQ_wYKfbRGmgH3GufL9TDSiYuduzsL9gJDeB5nzvkQU6w7WEbQMhWLy2cLP_g' },
  { label: 'Isometric', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxzxi5HAn0uKdc2vt7MpF8XrfEHEncxybD3pPsH7T6lS3S70Mr3oewDLEBKf7HvvrJUagYHp7QnndEJl_EVMQvpDreffROasxvqL55GATi4lJ0NMQNhW7Mm22vOX0U52cumgNjRINLcgXag_4oouqZvZYvhfX8WDMk_VzfnpojNDj9BFOW3TJzNU9NiY5z46neDf9hqw5DgzGDuMq8Qc9Q9h9QZl3CJNDkuw-5HcjrY1o_tnz8Dc3WH8ISytlHo7UCeoOJnRG-4Sg' },
  { label: 'Texture Detail', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvbw8phPIov7SQGj3oTyydJzBNrwBGkUtl_IyLr8rnNyWfWq6fd6Xs3f0df5K-cqr4LOZDEcjvArdu0H9dFAV2WmnAnyzC6eE0BRPFau12hKozXKinkzZCkl61nQ3uOBKTmTCGDOMyS5Z22mfJeZt85EVH4mUvC6y7IRy_mEb8aYO3qTEAKhBM_bp1VMyueEGAQSIXs1Zo-BCKORA9fguWP2Y2u_pXbg2etACrY3ogFByB4wRWSELVlXy24TFgftuJKXV2cbgh5_A' },
  { label: 'Dynamic Shot', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMYKWb5TbVBXyaYRqxFrbBKNTE8mSFHD8ELIjcTIFeefHr43UxQ-kJ8YqaeiAjWhyYGYdxTLhVXDDAJ0KGlw0nNr6vKH815nos5MLO7U0cTpVbS2QFgzORgvhsmHfeM8NxuO1bF6xh7xCS05kN4P_8A4S97EKShyfd7h7tnknuG9oNB6ti3tYkwtVlbfEytpzRb5W9tCrUt1kUvUglDMrtzzwhhFzYzzlYzrg0HGbnAmTkRyzDaeMWYNMsqZc94oYwuVLwIhPEIMY' },
];

export default function EditorHierarchy() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 lg:p-8 flex flex-col gap-8">
        <div className="grid grid-cols-12 gap-8 flex-1">
            {/* Left Controls Panel */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
              {/* Lighting Control Card */}
              <div className="glass-panel rounded-lg p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">fluorescent</span>
                  <h3 className="font-headline font-bold text-on-surface">Lighting Intensity</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'Ambient', value: 74 },
                    { label: 'Direct Light', value: 42 },
                    { label: 'Shadow Softness', value: 88 },
                  ].map((slider) => (
                    <div key={slider.label} className="space-y-3">
                      <div className="flex justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        <span>{slider.label}</span>
                        <span className="text-primary">{slider.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full" style={{ width: `${slider.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Presets */}
              <div className="glass-panel rounded-lg p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">wb_sunny</span>
                  <h3 className="font-headline font-bold text-on-surface">Environment</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/5 border-2 border-primary-container text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>portrait_lighting</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Studio Pro</span>
                  </button>
                  {[
                    { icon: 'wb_twilight', label: 'Golden Hour' },
                    { icon: 'cloud', label: 'Overcast' },
                    { icon: 'nightlight', label: 'Neon Night' },
                  ].map((preset) => (
                    <button key={preset.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined">{preset.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Central 3D Viewer */}
            <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
              <div className="relative group aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-surface-container-high to-surface-container shadow-2xl">
                <img
                  alt="3D Shoe Model"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL87OzO1CgbPP4hEahvuaTVoa4iCHO1Y5o-Y7uqPX1gMk6zaJPTO7oOW9H4QlvlQAgmr-YmopUE2r_u7l7i8EgJrxk327xPuUOHyRMSfULcBAfayGRz2X8aBAp9TTAUnUlr4fG_MZu1h_7klneh-rlLvPQXbkAXgz-ebaWOV4nqpWHLQ754BNj0yq_o3X8oh_LArwDanVrq4APDvgQ2YnvTCXuOHK95geQBHuVfhKtHZewxXEwYHtSY1SNm0L0v5oD4DH1hL8LTJI"
                />
                {/* Viewport HUD Overlay */}
                <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between items-start pointer-events-auto">
                    <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3">
                      <span className="flex h-2 w-2 rounded-full bg-primary-container animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Rendering</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="glass-panel p-2 rounded-full hover:bg-white transition-colors">
                        <span className="material-symbols-outlined">grid_4x4</span>
                      </button>
                      <button className="glass-panel p-2 rounded-full hover:bg-white transition-colors">
                        <span className="material-symbols-outlined">fullscreen</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center pointer-events-auto">
                    <div className="glass-panel p-2 rounded-full flex gap-1">
                      <button className="bg-primary text-white p-3 rounded-full shadow-lg">
                        <span className="material-symbols-outlined">orbit</span>
                      </button>
                      <button className="p-3 rounded-full hover:bg-primary/10 transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">pan_tool</span>
                      </button>
                      <button className="p-3 rounded-full hover:bg-primary/10 transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">zoom_in</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Assets Grid */}
              <section className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Studio Assets</h2>
                    <p className="text-on-surface-variant font-medium">Auto-generated high-fidelity angles</p>
                  </div>
                  <button className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    View All Assets <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {assetImages.map((asset) => (
                    <div key={asset.label} className="group relative aspect-square rounded-lg overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300">
                      <img
                        alt={asset.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={asset.src}
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="bg-white text-primary p-2 rounded-full shadow-lg">
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 glass-panel py-1 px-3 rounded-full text-[10px] font-bold text-center uppercase tracking-tighter">
                        {asset.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
      </main>
    </AppLayout>
  );
}
