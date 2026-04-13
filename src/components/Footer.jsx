import React from 'react';

export default function Footer() {
  return (
    <footer className="hidden md:block bg-transparent w-full py-12 px-8 font-inter text-xs font-medium uppercase tracking-[0.02em] space-y-6 border-t border-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="font-manrope font-bold text-slate-900 text-xl">Aurea 3D for Branding</div>
          <p className="text-slate-500 normal-case max-w-xs font-normal">Building the spatial computing pipeline for the next generation of creative architects.</p>
        </div>
        
        <div className="flex flex-wrap gap-8">
          <button className="text-slate-500 hover:text-primary transition-opacity bg-none border-none cursor-pointer">Terms</button>
          <button className="text-slate-500 hover:text-primary transition-opacity bg-none border-none cursor-pointer">Privacy</button>
          <button className="text-slate-500 hover:text-primary transition-opacity bg-none border-none cursor-pointer">API</button>
          <button className="text-slate-500 hover:text-primary transition-opacity bg-none border-none cursor-pointer">Careers</button>
        </div>
        
        <div className="text-slate-400 text-center md:text-right">
          © 2024 Aurea 3D. The Liquid Architect System.
        </div>
      </div>
    </footer>
  );
}
