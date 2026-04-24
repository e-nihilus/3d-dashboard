import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LIGHT_MAP_LIMIT = 8;

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToTwo(value) {
  return Number(value.toFixed(2));
}

function toPercentX(xValue) {
  const normalized = (clampValue(xValue, -LIGHT_MAP_LIMIT, LIGHT_MAP_LIMIT) + LIGHT_MAP_LIMIT) / (LIGHT_MAP_LIMIT * 2);
  return clampValue(normalized * 100, 0, 100);
}

function toPercentY(zValue) {
  const normalized = (clampValue(zValue, -LIGHT_MAP_LIMIT, LIGHT_MAP_LIMIT) + LIGHT_MAP_LIMIT) / (LIGHT_MAP_LIMIT * 2);
  return clampValue((1 - normalized) * 100, 0, 100);
}

function toWorldX(percentX) {
  const normalized = clampValue(percentX / 100, 0, 1);
  return roundToTwo((normalized * 2 - 1) * LIGHT_MAP_LIMIT);
}

function toWorldZ(percentY) {
  const normalized = clampValue(percentY / 100, 0, 1);
  return roundToTwo((1 - normalized * 2) * LIGHT_MAP_LIMIT);
}

export default function ViewerLightComposerMap({ sources, activeSourceId, copy, onSelectSource, onSourceChange }) {
  const mapRef = useRef(null);
  const [dragState, setDragState] = useState(null);

  const sourceById = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources]);

  const activeSource = (activeSourceId ? sourceById.get(activeSourceId) : null) ?? sources[0] ?? null;

  const setSourcePositionFromClient = useCallback((sourceId, clientX, clientY) => {
    const mapElement = mapRef.current;
    const source = sourceById.get(sourceId);
    if (!mapElement || !source) return;
    const bounds = mapElement.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const offsetX = clampValue(clientX - bounds.left, 0, bounds.width);
    const offsetY = clampValue(clientY - bounds.top, 0, bounds.height);
    const percentX = (offsetX / bounds.width) * 100;
    const percentY = (offsetY / bounds.height) * 100;
    onSourceChange({ ...source, position: { ...source.position, x: toWorldX(percentX), z: toWorldZ(percentY) } });
  }, [onSourceChange, sourceById]);

  const beginDrag = useCallback((sourceId, pointerId, clientX, clientY) => {
    onSelectSource(sourceId);
    setDragState({ sourceId, pointerId });
    setSourcePositionFromClient(sourceId, clientX, clientY);
  }, [onSelectSource, setSourcePositionFromClient]);

  const nudgeSource = useCallback((source, deltaX, deltaZ) => {
    onSourceChange({
      ...source,
      position: {
        ...source.position,
        x: roundToTwo(clampValue(source.position.x + deltaX, -LIGHT_MAP_LIMIT, LIGHT_MAP_LIMIT)),
        z: roundToTwo(clampValue(source.position.z + deltaZ, -LIGHT_MAP_LIMIT, LIGHT_MAP_LIMIT)),
      },
    });
  }, [onSourceChange]);

  useEffect(() => {
    if (!dragState) return;
    const onPointerMove = (event) => {
      if (event.pointerId !== dragState.pointerId) return;
      event.preventDefault();
      setSourcePositionFromClient(dragState.sourceId, event.clientX, event.clientY);
    };
    const stopDrag = (event) => {
      if (event.pointerId !== dragState.pointerId) return;
      setDragState(null);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, [dragState, setSourcePositionFromClient]);

  if (sources.length === 0) {
    return (
      <section className="viewer-light-composer__map-panel">
        <div className="viewer-light-composer__section-head">
          <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.lightComposerMapTitle}</p>
        </div>
        <p className="viewer-light-composer__empty">{copy.editorMode.lightComposerSourcesEmpty}</p>
      </section>
    );
  }

  return (
    <section className="viewer-light-composer__map-panel">
      <div className="viewer-light-composer__section-head">
        <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.lightComposerMapTitle}</p>
        <small className="viewer-light-composer__map-hint">{copy.editorMode.lightComposerMapHint}</small>
      </div>
      <div
        ref={mapRef}
        className="viewer-light-composer__map"
        onPointerDown={(event) => {
          const eventTarget = event.target;
          if (eventTarget.closest && eventTarget.closest("[data-source-marker='true']")) return;
          if (!activeSource) return;
          event.preventDefault();
          beginDrag(activeSource.id, event.pointerId, event.clientX, event.clientY);
        }}
        role="application"
        aria-label={copy.editorMode.lightComposerMapTitle}
      >
        <div className="viewer-light-composer__map-grid" aria-hidden="true" />
        <span className="viewer-light-composer__map-axis viewer-light-composer__map-axis--x">{copy.editorMode.lightComposerMapAxisX}</span>
        <span className="viewer-light-composer__map-axis viewer-light-composer__map-axis--z">{copy.editorMode.lightComposerMapAxisZ}</span>
        {sources.map((source, index) => {
          const isActive = source.id === activeSource?.id;
          const markerLeft = toPercentX(source.position.x);
          const markerTop = toPercentY(source.position.z);
          return (
            <button
              key={source.id}
              type="button"
              data-source-marker="true"
              className={`viewer-light-composer__map-marker ${isActive ? 'is-active' : ''}`}
              style={{ left: `${markerLeft}%`, top: `${markerTop}%`, backgroundColor: source.color }}
              onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); beginDrag(source.id, event.pointerId, event.clientX, event.clientY); }}
              onClick={(event) => { event.stopPropagation(); onSelectSource(source.id); }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 0.5 : 0.2;
                if (event.key === 'ArrowLeft') { event.preventDefault(); nudgeSource(source, -step, 0); return; }
                if (event.key === 'ArrowRight') { event.preventDefault(); nudgeSource(source, step, 0); return; }
                if (event.key === 'ArrowUp') { event.preventDefault(); nudgeSource(source, 0, step); return; }
                if (event.key === 'ArrowDown') { event.preventDefault(); nudgeSource(source, 0, -step); }
              }}
              aria-label={`${copy.editorMode.lightComposerSourceNameLabel}: ${source.name}`}
            >
              <span>{index + 1}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
