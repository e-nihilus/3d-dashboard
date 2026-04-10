import React from 'react';
import AppLayout from '../components/AppLayout';

export default function ResultsEditor() {
  return (
    <AppLayout>
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-headline font-bold">Results Editor</h1>
          <p className="text-on-surface-variant text-lg">Edit and refine your generated 3D models</p>
          <div className="grid md:grid-cols-3 gap-6">
            {['palette', 'light_mode', 'videocam'].map((icon, idx) => (
              <div key={idx} className="glass-card p-8 rounded-lg text-center">
                <span className="material-symbols-outlined text-4xl text-primary mx-auto block mb-4">{icon}</span>
                <p className="font-bold">Tool {idx + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
