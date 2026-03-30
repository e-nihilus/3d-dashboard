import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UploadProcessing() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-headline font-bold">Upload & Processing</h1>
          <p className="text-on-surface-variant text-lg">Upload your 3D models and let Aurea process them</p>
          <div className="w-64 h-64 mx-auto border-2 border-dashed border-primary/30 rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-primary">cloud_upload</span>
              <p className="mt-4 text-on-surface-variant">Drag & drop or click to upload</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
