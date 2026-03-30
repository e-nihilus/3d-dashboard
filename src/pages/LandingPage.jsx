import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-background font-body selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Aurea Engine v2.4
            </div>
            
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-on-surface leading-[1.1] tracking-tight">
              Un activo. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Resultados infinitos.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl font-medium leading-relaxed">
              Aurea 3D for Branding transforma simples fotografías en activos espaciales de alta fidelidad. Crea contenido visual ilimitado para eCommerce y AR en segundos.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/dashboard" className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all scale-100 active:scale-95">
                Empezar Ahora
              </Link>
              <button className="bg-white/50 backdrop-blur-md text-on-surface border border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/80 transition-all">
                Ver Demo
              </button>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-container/20 blur-[100px] rounded-full group-hover:bg-primary-container/30 transition-colors"></div>
            <div className="liquid-glass rounded-3xl aspect-[4/5] relative overflow-hidden flex items-center justify-center border border-white/40 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50"></div>
              <img 
                alt="High-end 3D Sneaker" 
                className="w-4/5 h-auto object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.15)] z-10 transition-all duration-700 group-hover:scale-105 group-hover:-rotate-3" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwtcM-TI4-zYpf78SKqX8c-Zlgij6qBbonRNW4zDbaNWTYgXuJwQU_9l6T66aPLimNlWlimRU976l4zav59TJ1Kudh-5UbhgPbtzXH3eiEMTx6epVcT3vdYo0g865SOm7ubxhGfU3w-MDGjFc0u_9KaXJdHZf8TwW-xpKupdt0QVKFvAhAUoOslrSty6RQUuoONwO91thEq2S8HxSgYzcCVCpAxKaHzmtQSOcTchAJyLV0rNR5t2VMQPkrNjai-s4cQ6xAmxiAqWg"
              />
              
              {/* Floating Output Icons */}
              <div className="absolute top-10 left-10 flex gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="liquid-glass p-3 rounded-2xl shadow-xl"><span className="material-symbols-outlined text-primary">view_in_ar</span></div>
                <div className="liquid-glass p-3 rounded-2xl shadow-xl mt-4"><span className="material-symbols-outlined text-primary">movie</span></div>
                <div className="liquid-glass p-3 rounded-2xl shadow-xl"><span className="material-symbols-outlined text-primary">photo_camera</span></div>
              </div>
              
              {/* Stats Overlay */}
              <div className="absolute bottom-10 right-10 z-20">
                <div className="liquid-glass px-6 py-4 rounded-2xl border border-white/40 shadow-xl space-y-1">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Live Rendering</div>
                  <div className="text-2xl font-black text-on-surface">4K Textures</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Drag & Drop Zone */}
        <section className="py-12">
          <div className="bg-white/30 backdrop-blur-md p-1 rounded-3xl border border-white/20">
            <div className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center bg-white/50 hover:border-primary/50 transition-colors group cursor-pointer">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-2">Comienza la magia</h3>
              <p className="text-on-surface-variant font-medium">Arrastra tus fotos o vídeos de productos aquí</p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight">Flujo de Trabajo Líquido</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto font-medium text-lg">De lo físico a lo digital en tres pasos visuales.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: '01',
                title: 'Subes contenido',
                desc: 'Usa tu smartphone para capturar un vídeo de 15 segundos o una serie de fotos de tu producto de lujo.',
                icon: 'cloud_upload',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5tnW-zGkGu-9aRNbfpTL31rlljiacw3rENquSIctMWL1WzymXGJSUKzT7zeqSzna7gYjCI_zM4w94MDTvsuxOSP9FHHuegw7y5Ws0e_nyrC8siV7YCkeGZGj0ao18Up-BlQOcORqiGFcx3B7LCjh0G74_YysI_Wla9Zr1bigI1-P8GcZLSHErehkm7j5hxq3hMsUdm-2ZUxhobe4kZlbdtkiLu4HJaqEBaIMeQ5mE_vyaDvm0PnzbGD__7wvyrR__73bG1Gnkx4Y'
              },
              {
                num: '02',
                title: 'IA genera el modelo',
                desc: 'Nuestra IA reconstructiva procesa los datos para crear una malla fotorrealista con texturas 8K automáticas.',
                icon: 'smart_toy',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX_Xwg61Z7AygefPV7VV63vJzO007thF44_cpeuOboMPG12ONYUQ3yBvdicdlfKhknRPc0GEojnGQU9NyI3DqCsTBclENZC4f_5CfoFkfnWdHzalM8GeCXoKEeCW8UvhbQJIiRIU4eKP_26XusQFPST0R1FAI87eGY6Ci2Lb3fDWdEti-zsXuhvXGUQestr_1_dXVJm-iCVIXEbWBrjsVnul1e00XbCrt59b2uIrSQCDOtxyu9umMOw2gC6RGIhxE16H7Ap6j-ekM'
              },
              {
                num: '03',
                title: 'Exportas',
                desc: 'Obtén archivos listos para Shopify, Instagram AR, o renders cinematográficos para campañas de marketing.',
                icon: 'download',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo_KMdhrpeo_vJFQgdM3-6rO9jWvPZBWhsWiLX7iHD4eNTz3rGcLdCZko1pF3DJs3mMPdlcCzOWah_dJxajV90hqWlWHFloRVEX82nWYmCWckrcJI1WZezX7XVHrFDuBTedYd4EHRD_oJpfChMWAnLa_uuomZo2P_SDzDI0cwXeTxki3Zg7jXMnXiYlSCBzrVNR_P9UioEDV-jCReEe6y1NAKO9KwZGrTSpGQqYwSIWqt0y96esE1FarLZIVQqZaS6o2GhVzELaTo'
              }
            ].map((step, idx) => (
              <div key={idx} className="space-y-6 group">
                <div className="relative rounded-3xl overflow-hidden aspect-square shadow-xl border border-white/20">
                  <img 
                    alt={step.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    src={step.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-4xl font-black opacity-50 block">{step.num}</span>
                    <h4 className="text-2xl font-bold font-headline">{step.title}</h4>
                  </div>
                </div>
                <p className="text-on-surface-variant leading-relaxed px-2 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 bg-white/40 backdrop-blur-xl -mx-6 px-6 rounded-[3rem] border border-white/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl space-y-4">
              <h2 className="text-4xl font-headline font-extrabold tracking-tight">Industrias que escalan con 3D</h2>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed">Aurea 3D for Branding es la herramienta definitiva para directores creativos y equipos de eCommerce.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['shopping_bag', 'checkroom', 'chair', 'watch', 'diamond'].map((icon, idx) => (
              <div key={idx} className="bg-white/60 p-8 rounded-2xl text-center space-y-4 hover:-translate-y-2 transition-all shadow-sm border border-white">
                <div className="text-primary"><span className="material-symbols-outlined text-4xl">{icon}</span></div>
                <span className="block font-bold font-headline uppercase text-xs tracking-widest">Industria {idx + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32">
          <div className="bg-on-background rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center text-surface flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-[160px] opacity-20"></div>
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold max-w-3xl mb-8 relative z-10 leading-tight">
              El futuro del branding es tridimensional. Únete hoy.
            </h2>
            <div className="flex flex-wrap gap-6 relative z-10">
              <Link to="/dashboard" className="bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-2xl shadow-primary/20">
                Prueba Aurea 3D Gratis
              </Link>
              <button className="border border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                Hablar con Ventas
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
