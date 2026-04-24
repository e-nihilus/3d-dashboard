import React from 'react';

function formatSliderValue(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function parseNumericValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function ViewerLightComposerSliderField({ label, value, min, max, step, onValueChange, numberFormatter = (v) => `${v}` }) {
  return (
    <label className="viewer-light-composer__prop-row viewer-light-composer__prop-row--slider">
      <span>{label}</span>
      <div className="viewer-light-composer__prop-slider-field">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onValueChange(parseNumericValue(e.target.value, value))} />
        <input type="number" min={min} max={max} step={step} inputMode="decimal" className="viewer-light-composer__prop-input" value={numberFormatter(value)} onChange={(e) => onValueChange(parseNumericValue(e.target.value, value))} />
      </div>
    </label>
  );
}

export default function ViewerLightComposerSourceProperties({ source, copy, onSourceChange }) {
  const setPositionAxis = (axis, value) => {
    onSourceChange({ ...source, position: { ...source.position, [axis]: value } });
  };

  return (
    <section className="viewer-light-composer__properties">
      <div className="viewer-light-composer__properties-head">
        <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.lightComposerPropertiesTitle}</p>
      </div>
      <div className="viewer-light-composer__prop-block">
        <label className="viewer-light-composer__prop-row">
          <span>{copy.editorMode.lightComposerSourceNameLabel}</span>
          <input type="text" className="viewer-light-composer__prop-input" value={source.name} onChange={(e) => onSourceChange({ ...source, name: e.target.value })} />
        </label>
        <ViewerLightComposerSliderField label={copy.editorMode.lightComposerScaleLabel} min={0.1} max={12} step={0.1} value={source.size} numberFormatter={(v) => v.toFixed(1)} onValueChange={(nextSize) => onSourceChange({ ...source, size: nextSize })} />
        <div className="viewer-light-composer__prop-row viewer-light-composer__prop-row--stacked">
          <span>{copy.editorMode.positionLabel}</span>
          <div className="viewer-light-composer__prop-triplet">
            <label className="viewer-light-composer__prop-triplet-field">
              <span>{copy.editorMode.lightComposerPositionXLabel}</span>
              <input type="number" step={0.1} min={-8} max={8} inputMode="decimal" className="viewer-light-composer__prop-input" value={source.position.x.toFixed(2)} onChange={(e) => setPositionAxis('x', parseNumericValue(e.target.value, source.position.x))} />
            </label>
            <label className="viewer-light-composer__prop-triplet-field">
              <span>{copy.editorMode.lightComposerPositionYLabel}</span>
              <input type="number" step={0.1} min={0} max={12} inputMode="decimal" className="viewer-light-composer__prop-input" value={source.position.y.toFixed(2)} onChange={(e) => setPositionAxis('y', parseNumericValue(e.target.value, source.position.y))} />
            </label>
            <label className="viewer-light-composer__prop-triplet-field">
              <span>{copy.editorMode.lightComposerPositionZLabel}</span>
              <input type="number" step={0.1} min={-8} max={8} inputMode="decimal" className="viewer-light-composer__prop-input" value={source.position.z.toFixed(2)} onChange={(e) => setPositionAxis('z', parseNumericValue(e.target.value, source.position.z))} />
            </label>
          </div>
        </div>
      </div>
      <div className="viewer-light-composer__prop-block">
        <label className="viewer-light-composer__prop-row">
          <span>{copy.editorMode.lightComposerColorLabel}</span>
          <div className="viewer-light-composer__prop-color-field">
            <input type="color" value={source.color} onChange={(e) => onSourceChange({ ...source, color: e.target.value })} />
            <input type="text" className="viewer-light-composer__prop-input" value={source.color} onChange={(e) => onSourceChange({ ...source, color: e.target.value })} />
          </div>
        </label>
        <ViewerLightComposerSliderField label={copy.editorMode.lightComposerIntensityLabel} min={0} max={20} step={0.05} value={source.intensity} numberFormatter={formatSliderValue} onValueChange={(nextIntensity) => onSourceChange({ ...source, intensity: nextIntensity })} />
      </div>
    </section>
  );
}
