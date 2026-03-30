import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white/70 backdrop-blur-2xl font-manrope tracking-tight font-bold rounded-full mt-4 mx-4 md:mx-8 sticky top-4 z-50 border border-white/15 shadow-[0_40px_60px_-5px_rgba(22,29,31,0.05)] flex justify-between items-center px-6 py-3">
      <Link to="/" className="text-xl font-black text-primary tracking-tighter leading-tight">
        Aurea<br/>3D
      </Link>
      
      <div className="hidden md:flex gap-6 items-center">
        <Link to="/editor" className="text-slate-600 hover:text-primary transition-all duration-300 ease-out">Editor</Link>
        <Link to="/dashboard" className="text-primary font-bold transition-all duration-300 ease-out">Assets</Link>
        <button className="text-slate-600 hover:text-primary transition-all duration-300 ease-out bg-none border-none cursor-pointer">Community</button>
        <button className="text-slate-600 hover:text-primary transition-all duration-300 ease-out bg-none border-none cursor-pointer">Pricing</button>
      </div>

      <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
        <input type="text" placeholder="Search models..." className="bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 w-36" />
      </div>
      
      <div className="flex items-center gap-3">
        <button className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-white/40 p-2 rounded-full transition-all">
          notifications
        </button>
        <button className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-white/40 p-2 rounded-full transition-all">
          settings
        </button>
        <Link to="/" className="bg-primary text-white px-5 py-2 rounded-full font-bold scale-95 active:scale-90 transition-transform shadow-lg shadow-primary/20 text-sm">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
