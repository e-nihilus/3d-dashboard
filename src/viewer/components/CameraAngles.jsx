import React from 'react';
import { Camera } from 'lucide-react';

const EDITOR_VIEW_SEQUENCE = ['isometric', 'front', 'right', 'back', 'left', 'top'];

export default function CameraAngles({ activeEditorView, setActiveEditorView, controlsCollapsed, controlsShortcutKeys, setControlsCollapsed, editorViewOptions, copy }) {
  const controlsToggleLabel = controlsCollapsed ? copy.controls.expand : copy.controls.collapse;
  const controlsToggleTitle = `${controlsToggleLabel} (${controlsShortcutKeys.join(' + ')})`;
  return (
    <>
      <section className="viewer-stage-controls-panel" aria-label={copy.editorMode.viewsAriaLabel} aria-hidden={controlsCollapsed} style={{ blockSize: 'var(--viewer-controls-shell-size)', minBlockSize: 'var(--viewer-controls-shell-size)', padding: '0 0.24rem' }}>
        <div className="viewer-editor-views">
          <div className="viewer-editor-views__list" role="group" aria-label={copy.editorMode.viewsAriaLabel} style={{ flexWrap: 'nowrap', alignItems: 'center', blockSize: '100%' }}>
            {EDITOR_VIEW_SEQUENCE.map((viewId) => {
              const option = editorViewOptions.find((c) => c.id === viewId);
              if (!option) return null;
              return (
                <button key={option.id} type="button" className={`viewer-editor-views__chip ${activeEditorView === option.id ? 'is-active' : ''}`} onClick={() => setActiveEditorView(option.id)} aria-pressed={activeEditorView === option.id} disabled={controlsCollapsed} style={{ blockSize: 'var(--viewer-control-size)', minBlockSize: 'var(--viewer-control-size)' }}>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <button type="button" className="viewer-stage-control viewer-stage-control--toggle viewer-stage-control--angles-toggle" aria-label={controlsToggleLabel} title={controlsToggleTitle} onClick={() => setControlsCollapsed((s) => !s)}>
        <Camera aria-hidden="true" size={15} />
      </button>
    </>
  );
}
