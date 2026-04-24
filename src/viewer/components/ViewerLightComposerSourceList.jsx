import React, { useRef } from 'react';
import { Eye, EyeOff, Lightbulb, Plus, Trash2 } from 'lucide-react';

export default function ViewerLightComposerSourceList({ sources, activeSourceId, copy, onSelectSource, onAddSource, onReorderSources, onSourceChange, onDeleteSource }) {
  const previousIntensityRef = useRef(new Map());
  const hasSources = sources.length > 0;

  const toggleMuted = (source) => {
    const isMuted = source.intensity <= 0;
    if (isMuted) {
      const rememberedIntensity = previousIntensityRef.current.get(source.id);
      onSourceChange({ ...source, intensity: rememberedIntensity && rememberedIntensity > 0 ? rememberedIntensity : 1 });
      return;
    }
    previousIntensityRef.current.set(source.id, source.intensity);
    onSourceChange({ ...source, intensity: 0 });
  };

  return (
    <section className="viewer-light-composer__sources">
      <div className="viewer-light-composer__section-head">
        <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.lightComposerSourcesTitle}</p>
        <button type="button" className="viewer-light-composer__section-cta" onClick={onAddSource} aria-label={copy.editorMode.lightComposerAddSourceCta}>
          <Plus aria-hidden="true" size={13} />
        </button>
      </div>
      {hasSources ? (
        <ul className="viewer-light-composer__source-list">
          {sources.map((source) => {
            const isActive = source.id === activeSourceId;
            const isMuted = source.intensity <= 0;
            return (
              <li key={source.id} className={`viewer-light-composer__source-item ${isActive ? 'is-active' : ''} ${isMuted ? 'is-muted' : ''}`}>
                <button type="button" className="viewer-light-composer__source-select" onClick={() => onSelectSource(source.id)}>
                  <Lightbulb aria-hidden="true" size={15} />
                  <span className="viewer-light-composer__source-meta"><strong>{source.name}</strong></span>
                </button>
                <div className="viewer-light-composer__source-row-actions">
                  <button type="button" className="viewer-light-composer__source-action" aria-label={`${copy.editorMode.lightComposerVisibilityCta}: ${source.name}`} onClick={() => toggleMuted(source)}>
                    {isMuted ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
                  </button>
                  <button type="button" className="viewer-light-composer__source-action viewer-light-composer__source-action--danger" aria-label={`${copy.editorMode.lightComposerRemoveSourceCta}: ${source.name}`} onClick={() => onDeleteSource(source.id)}>
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="viewer-light-composer__empty">
          <Lightbulb aria-hidden="true" size={13} />
          <span>{copy.editorMode.lightComposerSourcesEmpty}</span>
        </p>
      )}
    </section>
  );
}
