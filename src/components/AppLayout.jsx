import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

const sidebarIcons = [
  { icon: 'language', to: '/', tooltip: 'Aurea3D' },
  { icon: 'view_in_ar', to: '/dashboard', tooltip: 'Assets' },
  { icon: 'edit_square', to: '/editor', tooltip: 'Editor' },
  { icon: 'movie', to: '/editor/render', tooltip: 'Render' },
  { icon: 'ios_share', to: '/export', tooltip: 'Export' },
];

const tabs = [
  { label: 'Assets', icon: 'folder_open', to: '/dashboard' },
  { label: 'Editor', icon: 'edit', to: '/editor' },
];

const editorSubmenu = [
  { label: 'Hierarchy', icon: 'account_tree' },
  { label: 'Materials', icon: 'palette' },
  { label: 'Lighting', icon: 'lightbulb' },
  { label: 'Camera', icon: 'videocam' },
  { label: 'Render', icon: 'image' }
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const isEditorActive = location.pathname === '/editor' || location.pathname.startsWith('/editor/');

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex">
      {/* Left Sidebar - Icon only */}
      <aside className="w-20 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col items-center py-4 gap-1 sticky top-0 h-screen z-40 shrink-0">
        {/* Aurea3D Logo */}
        <Link to="/" className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 hover:bg-primary/20 transition-colors" title="Aurea3D">
          <span className="material-symbols-outlined text-primary text-xl">language</span>
        </Link>

        <div className="w-8 h-px bg-slate-200 mb-2"></div>

        {sidebarIcons.slice(1).map((item, idx) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          const isEditorIcon = item.tooltip === 'Editor';

          if (isEditorIcon) {
            return (
              <React.Fragment key={idx}>
                <Link
                  to={item.to}
                  title={item.tooltip}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </Link>

                {/* Editor Submenu - Inline dentro de la sidebar */}
                <div
                  className={`flex flex-col items-center gap-1 overflow-hidden transition-all duration-300 ease-in-out ml-3 ${
                    isEditorActive ? 'max-h-96 opacity-100 py-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  {editorSubmenu.map((submenuItem, subIdx) => (
                    <button
                      key={subIdx}
                      title={submenuItem.label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {submenuItem.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </React.Fragment>
            );
          }

          return (
            <Link
              key={idx}
              to={item.to}
              title={item.tooltip}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </Link>
          );
        })}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Tab Bar */}
        <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
          <div className="flex items-center gap-1 px-6 py-3">
            <Link
              to="/"
              className="text-sm font-bold text-primary tracking-tight mr-4 hover:opacity-80 transition-opacity"
            >
              Aurea3D
            </Link>

            <div className="flex items-center gap-1 bg-slate-100/80 rounded-full p-1">
              {tabs.map((tab) => {
                const active = location.pathname === tab.to || location.pathname.startsWith(tab.to + '/');
                const isEditorTab = tab.label === 'Editor';

                if (isEditorTab) {
                   return (
                     <Link
                       key={tab.to}
                       to={tab.to}
                       className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                         active
                           ? 'bg-white text-primary shadow-sm'
                           : 'text-slate-500 hover:text-slate-700'
                       }`}
                     >
                       <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                       {tab.label}
                     </Link>
                   );
                 }

                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                      active
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </div>
    </div>
  );
}
