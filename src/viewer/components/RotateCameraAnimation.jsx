import React from 'react';
import { Hand, Mouse } from 'lucide-react';

export default function RotateCameraAnimation({ hasStartedRotation, copy }) {
  return (
    <div
      className={`viewer-rotate-coachmark ${hasStartedRotation ? 'is-dismissed' : ''}`}
      aria-hidden={hasStartedRotation}
    >
      <span className="viewer-rotate-coachmark__icon">
        <Hand aria-hidden="true" size={14} className="viewer-rotate-coachmark__icon--mobile" />
        <Mouse aria-hidden="true" size={14} className="viewer-rotate-coachmark__icon--desktop" />
      </span>
      <span>{copy.rotateCoachmark}</span>
    </div>
  );
}
