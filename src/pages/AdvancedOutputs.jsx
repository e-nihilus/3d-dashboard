import React from 'react';
import AppLayout from '../components/AppLayout';

export default function AdvancedOutputs() {
  return (
    <AppLayout>
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-headline font-bold">Advanced Outputs</h1>
          <p className="text-on-surface-variant text-lg">Export to various advanced formats</p>
          <div className="grid md:grid-cols-4 gap-4">
            {['.GLB', '.USDZ', '.FBX', '.OBJ'].map((format, idx) => (
              <div key={idx} className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <p className="font-bold text-lg">{format}</p>
                <p className="text-xs text-on-surface-variant mt-2">Export format</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
