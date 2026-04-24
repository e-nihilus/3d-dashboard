import React from 'react';
import ViewerLightComposerMap from './ViewerLightComposerMap';
import ViewerLightComposerSourceList from './ViewerLightComposerSourceList';
import ViewerLightComposerSourceProperties from './ViewerLightComposerSourceProperties';

export default function ViewerLightComposerPanel({ draft, isApplyingLight, copy, onDraftChange, onAddSource, onSelectSource, onReorderSources, onSourceChange, onDeleteSource, onSave, onCancel }) {
  const activeSource = draft.activeSourceId
    ? draft.sources.find((source) => source.id === draft.activeSourceId) ?? null
    : null;
  const hasLightSources = draft.sources.length > 0;

  return (
    <aside className="viewer-light-composer" aria-label={copy.editorMode.lightComposerTitle}>
      <div className="viewer-light-composer__layout">
        <section className="viewer-light-composer__left-panel">
          <div className="viewer-light-composer__head">
            <div>
              <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.lightComposerTitle}</p>
              <p className="viewer-light-composer__subtitle">{copy.editorMode.lightComposerSubtitle}</p>
            </div>
          </div>
          <label className="viewer-light-composer__field">
            <span>{copy.editorMode.lightComposerNameLabel}</span>
            <input
              type="text"
              value={draft.name}
              className="viewer-quick-create-panel__input"
              placeholder={copy.editorMode.lightComposerNamePlaceholder}
              onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
            />
          </label>
          <ViewerLightComposerSourceList
            sources={draft.sources}
            activeSourceId={activeSource?.id ?? null}
            copy={copy}
            onAddSource={onAddSource}
            onSelectSource={onSelectSource}
            onReorderSources={onReorderSources}
            onSourceChange={onSourceChange}
            onDeleteSource={onDeleteSource}
          />
          <div className="viewer-light-composer__actions">
            <button type="button" className="viewer-quick-create-panel__cta viewer-quick-create-panel__cta--secondary" onClick={onCancel} disabled={isApplyingLight}>
              {copy.editorMode.lightComposerCancelCta}
            </button>
            <button type="button" className="viewer-quick-create-panel__cta" onClick={onSave} disabled={isApplyingLight || !hasLightSources}>
              {copy.editorMode.lightComposerSaveCta}
            </button>
          </div>
        </section>
        <ViewerLightComposerMap
          sources={draft.sources}
          activeSourceId={activeSource?.id ?? null}
          copy={copy}
          onSelectSource={onSelectSource}
          onSourceChange={onSourceChange}
        />
        {activeSource ? (
          <div key={activeSource.id} className="viewer-light-composer__right-panel">
            <ViewerLightComposerSourceProperties source={activeSource} copy={copy} onSourceChange={onSourceChange} />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
