import React from 'react';
import { RotateCcw, RotateCw, ZoomOut, ZoomIn, RefreshCw, Cog } from 'lucide-react';

export default function CameraControls({ canInteractCamera, controlsCollapsed, controlsShortcutKeys, setControlsCollapsed, zoomControlProgress, setZoomProgress, rotateCamera, zoomCamera, resetCamera, copy }) {
  const ZOOM_IN_FACTOR = 0.86;
  const ZOOM_OUT_FACTOR = 1.14;
  const controlsToggleLabel = controlsCollapsed ? copy.controls.expand : copy.controls.collapse;
  const controlsToggleTitle = `${controlsToggleLabel} (${controlsShortcutKeys.join(' + ')})`;
  return (
    <>
      <div className="viewer-stage-controls-panel" aria-hidden={controlsCollapsed}>
        <button type="button" className="viewer-stage-control" aria-label={copy.controls.rotateLeft} title={copy.controls.rotateLeft} onClick={() => rotateCamera(-1)} disabled={!canInteractCamera || controlsCollapsed}>
          <RotateCcw aria-hidden="true" size={15} />
        </button>
        <button type="button" className="viewer-stage-control" aria-label={copy.controls.rotateRight} title={copy.controls.rotateRight} onClick={() => rotateCamera(1)} disabled={!canInteractCamera || controlsCollapsed}>
          <RotateCw aria-hidden="true" size={15} />
        </button>
        <div className="viewer-stage-zoom-control">
          <button type="button" className="viewer-stage-control" aria-label={copy.controls.zoomOut} title={copy.controls.zoomOut} onClick={() => zoomCamera(ZOOM_OUT_FACTOR)} disabled={!canInteractCamera || controlsCollapsed}>
            <ZoomOut aria-hidden="true" size={15} />
          </button>
          <input type="range" className="viewer-stage-zoom-slider" min={0} max={100} step={0.5} value={zoomControlProgress} aria-label={copy.controls.zoomTitle} title={copy.controls.zoomTitle} disabled={!canInteractCamera || controlsCollapsed} onChange={(e) => setZoomProgress(Number(e.target.value))} />
          <button type="button" className="viewer-stage-control" aria-label={copy.controls.zoomIn} title={copy.controls.zoomIn} onClick={() => zoomCamera(ZOOM_IN_FACTOR)} disabled={!canInteractCamera || controlsCollapsed}>
            <ZoomIn aria-hidden="true" size={15} />
          </button>
        </div>
        <button type="button" className="viewer-stage-control" aria-label={copy.controls.reset} title={copy.controls.reset} onClick={resetCamera} disabled={!canInteractCamera || controlsCollapsed}>
          <RefreshCw aria-hidden="true" size={15} />
        </button>
      </div>
      <button type="button" className="viewer-stage-control viewer-stage-control--toggle" aria-label={controlsToggleLabel} title={controlsToggleTitle} onClick={() => setControlsCollapsed((s) => !s)}>
        <Cog aria-hidden="true" size={15} />
      </button>
    </>
  );
}
