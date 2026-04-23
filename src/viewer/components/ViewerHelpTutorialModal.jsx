import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clapperboard, X } from 'lucide-react';

export default function ViewerHelpTutorialModal({ isOpen, onClose, copy }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const closeButtonRef = useRef(null);
  const totalSteps = copy.steps.length;
  const safeActiveStepIndex = totalSteps > 0 ? Math.min(activeStepIndex, totalSteps - 1) : 0;
  const activeStep = copy.steps[safeActiveStepIndex];
  const canGoPrevious = safeActiveStepIndex > 0;
  const canGoNext = safeActiveStepIndex < totalSteps - 1;

  useEffect(() => { if (isOpen) setActiveStepIndex(0); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const focusTimeout = window.setTimeout(() => { closeButtonRef.current?.focus(); }, 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'ArrowRight' && canGoNext) { event.preventDefault(); setActiveStepIndex((s) => Math.min(s + 1, Math.max(totalSteps - 1, 0))); }
      if (event.key === 'ArrowLeft' && canGoPrevious) { event.preventDefault(); setActiveStepIndex((s) => Math.max(s - 1, 0)); }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.clearTimeout(focusTimeout); window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = previousOverflow; };
  }, [canGoNext, canGoPrevious, isOpen, onClose, totalSteps]);

  if (!isOpen || !activeStep) return null;

  return (
    <section className="viewer-help-tutorial" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="viewer-help-tutorial__panel">
        <header className="viewer-help-tutorial__header">
          <div>
            <h2>{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
          <button ref={closeButtonRef} type="button" className="viewer-help-tutorial__close" onClick={onClose} aria-label={copy.closeCta}>
            <X aria-hidden="true" size={16} />
          </button>
        </header>
        <section className="viewer-help-tutorial__video-placeholder" aria-label={copy.videoPlaceholderTitle}>
          <span className="viewer-help-tutorial__video-icon"><Clapperboard aria-hidden="true" size={20} /></span>
          <div><p>{copy.videoPlaceholderTitle}</p><small>{copy.videoPlaceholderDescription}</small></div>
        </section>
        <section className="viewer-help-tutorial__step-progress">
          <p>{copy.stepLabel} {safeActiveStepIndex + 1} {copy.stepConnector} {totalSteps}</p>
          <div className="viewer-help-tutorial__step-tabs" role="tablist">
            {copy.steps.map((step, index) => (
              <button key={step.title} type="button" role="tab" aria-selected={index === safeActiveStepIndex} className={`viewer-help-tutorial__step-tab ${index === safeActiveStepIndex ? 'is-active' : ''}`} aria-label={`${copy.jumpToStepLabel} ${index + 1}: ${step.title}`} onClick={() => setActiveStepIndex(index)}>
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </section>
        <article className="viewer-help-tutorial__step-card">
          <h3>{activeStep.title}</h3>
          <p>{activeStep.description}</p>
        </article>
        <footer className="viewer-help-tutorial__actions">
          <button type="button" className="viewer-help-tutorial__action viewer-help-tutorial__action--secondary" onClick={() => setActiveStepIndex((s) => Math.max(s - 1, 0))} disabled={!canGoPrevious}>
            <ChevronLeft aria-hidden="true" size={16} /><span>{copy.previousStepCta}</span>
          </button>
          {canGoNext ? (
            <button type="button" className="viewer-help-tutorial__action" onClick={() => setActiveStepIndex((s) => Math.min(s + 1, Math.max(totalSteps - 1, 0)))}>
              <span>{copy.nextStepCta}</span><ChevronRight aria-hidden="true" size={16} />
            </button>
          ) : (
            <button type="button" className="viewer-help-tutorial__action" onClick={onClose}>{copy.finishCta}</button>
          )}
        </footer>
      </div>
    </section>
  );
}
