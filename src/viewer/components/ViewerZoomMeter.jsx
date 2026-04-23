import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function ViewerZoomMeter({ zoomPercent, copy, onOpenHelp }) {
  return (
    <div className="viewer-stage-zoom-meter" aria-label={copy.controls.zoomTitle}>
      <input type="text" readOnly value={`${zoomPercent}%`} aria-label={copy.controls.zoomTitle} />
      <button type="button" aria-label={copy.quickActions.openZoomHelp} title={copy.quickActions.openZoomHelp} onClick={onOpenHelp}>
        <HelpCircle aria-hidden="true" size={14} />
      </button>
    </div>
  );
}
