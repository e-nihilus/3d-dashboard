import React from 'react';
import PolyHavenPanel from '../../components/PolyHavenPanel';

export default function ViewerScenePanel({
  isEditMode,
  selectedObjectId,
  transformMode,
  onTransformModeChange,
  onDeselectObject,
  mainModelTitle,
  importedModels,
  onSelectObject,
  onRestoreObject,
  onRemoveImport,
  showHdriPanel,
  onToggleHdriPanel,
  activeHdriId,
  activeHdriName,
  onApplyHdri,
  onResetHdri,
  onOpenSketchfab,
}) {
  return (
    <aside className="viewer-scene-panel">
      {/* Transform Tools - only in edit mode */}
      {isEditMode && (
        <div className="glass-panel rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-lg">transform</span>
            <h3 className="font-headline font-bold text-on-surface text-sm">Transform</h3>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onTransformModeChange('translate')}
              className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
                transformMode === 'translate' && selectedObjectId ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              title="Move (W)"
            >
              <span className="material-symbols-outlined text-base">open_with</span>
              Move
            </button>
            <button
              onClick={() => onTransformModeChange('rotate')}
              className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
                transformMode === 'rotate' && selectedObjectId ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              title="Rotate (E)"
            >
              <span className="material-symbols-outlined text-base">360</span>
              Rotate
            </button>
            <button
              onClick={() => onTransformModeChange('scale')}
              className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
                transformMode === 'scale' && selectedObjectId ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              title="Scale (R)"
            >
              <span className="material-symbols-outlined text-base">zoom_out_map</span>
              Scale
            </button>
          </div>
          {selectedObjectId && (
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold text-on-surface-variant truncate">
                Selected: {selectedObjectId === 'main' ? mainModelTitle : importedModels.find(m => m.id === selectedObjectId)?.name || selectedObjectId}
              </p>
              <button onClick={onDeselectObject} className="text-[10px] font-bold text-primary hover:underline" title="Deselect (Esc)">
                Deselect
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scene Objects */}
      <div className="glass-panel rounded-lg p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-lg">view_in_ar</span>
          <h3 className="font-headline font-bold text-on-surface text-sm">Scene Objects</h3>
          <span className="ml-auto text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {importedModels.length + (mainModelTitle ? 1 : 0)}
          </span>
        </div>

        {/* Main Model */}
        {mainModelTitle && (
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              selectedObjectId === 'main'
                ? 'bg-primary/10 ring-1 ring-primary/30'
                : 'bg-surface-container hover:bg-surface-container-highest'
            }`}
            onClick={() => onSelectObject('main')}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-base">deployed_code</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{mainModelTitle}</p>
              <p className="text-[10px] text-on-surface-variant">Main model</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRestoreObject('main'); }}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-on-surface-variant hover:text-amber-600 transition-colors shrink-0"
              title="Restore to initial position"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
          </div>
        )}

        {/* Imported Models */}
        {importedModels.map((model) => (
          <div
            key={model.id}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
              selectedObjectId === model.id
                ? 'bg-primary/10 ring-1 ring-primary/30'
                : 'bg-surface-container hover:bg-surface-container-highest'
            }`}
            onClick={() => onSelectObject(model.id)}
          >
            {model.thumbnailUrl ? (
              <img src={model.thumbnailUrl} alt={model.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-base">view_in_ar</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{model.name}</p>
              {model.author && <p className="text-[10px] text-on-surface-variant truncate">{model.author}</p>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRestoreObject(model.id); }}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-on-surface-variant hover:text-amber-600 transition-colors shrink-0"
              title="Restore"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemoveImport(model.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-colors shrink-0"
              title="Remove"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}

        {/* Add from Sketchfab */}
        <button
          onClick={onOpenSketchfab}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary/8 text-primary text-xs font-bold hover:bg-primary/15 transition-colors border border-dashed border-primary/25"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add from Sketchfab
        </button>
      </div>

      {/* HDRI Section */}
      <div className="glass-panel rounded-lg p-4 flex flex-col gap-3 shadow-sm">
        <button
          onClick={onToggleHdriPanel}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
            showHdriPanel || activeHdriId
              ? 'bg-amber-500/10 text-amber-700'
              : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-lg">wb_sunny</span>
          <span className="text-xs font-bold flex-1">HDRI Environment</span>
          <span className="material-symbols-outlined text-base">{showHdriPanel ? 'expand_less' : 'expand_more'}</span>
        </button>
        {!showHdriPanel && activeHdriName && (
          <p className="text-xs text-on-surface-variant/70 font-medium truncate px-1" style={{ marginTop: '-0.25rem' }}>
            {activeHdriName}
          </p>
        )}
        {showHdriPanel && (
          <PolyHavenPanel
            activeHdriId={activeHdriId}
            onApplyHdri={onApplyHdri}
            onResetHdri={onResetHdri}
          />
        )}
      </div>

    </aside>
  );
}
