import React from 'react';

export default function Sidebar({ items, title, version }) {
  return (
    <aside className="hidden lg:flex flex-col p-6 gap-4 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-3xl h-[calc(100vh-12rem)] w-64 rounded-[24px] sticky top-32 shadow-2xl shadow-teal-900/5 font-inter text-sm font-semibold tracking-wide">
      <div className="mb-6">
        <h3 className="text-primary font-headline font-extrabold text-lg">{title}</h3>
        <p className="text-on-surface-variant text-xs font-medium opacity-60">{version}</p>
      </div>
      
      <nav className="space-y-1">
        {items.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 transition-transform duration-200 rounded-full ${
              item.active ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-outline-variant/20">
        <button className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:translate-x-1 transition-all bg-none border-none cursor-pointer w-full text-left">
          <span className="material-symbols-outlined">help</span>
          Docs
        </button>
        <button className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:translate-x-1 transition-all bg-none border-none cursor-pointer w-full text-left">
          <span className="material-symbols-outlined">contact_support</span>
          Support
        </button>
      </div>
    </aside>
  );
}
