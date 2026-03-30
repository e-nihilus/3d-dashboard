import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl font-manrope tracking-tight font-bold rounded-full mt-4 mx-auto max-w-7xl sticky top-4 z-50 border border-white/15 dark:border-slate-700/15 shadow-[0_40px_60px_-5px_rgba(22,29,31,0.05)] flex justify-between items-center w-full px-8 py-3">
      <Link to="/" className="text-2xl font-black text-primary tracking-tighter">
        Aurea 3D
      </Link>
      
      <div className="hidden md:flex gap-8 items-center">
        <Link to="/editor" className="text-slate-600 hover:text-primary transition-all duration-300 ease-out">Editor</Link>
        <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-all duration-300 ease-out">Assets</Link>
        <button className="text-slate-600 hover:text-primary transition-all duration-300 ease-out bg-none border-none cursor-pointer">Community</button>
        <button className="text-slate-600 hover:text-primary transition-all duration-300 ease-out bg-none border-none cursor-pointer">Pricing</button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-white/40 p-2 rounded-full transition-all">
          notifications
        </button>
        <Link to="/" className="bg-primary text-white px-6 py-2 rounded-full font-bold scale-95 active:scale-90 transition-transform shadow-lg shadow-primary/20">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
