import React, { useEffect, useMemo, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { APP_DEFAULT_LIGHT_SOURCE_ID } from '../constants/lighting';

export default function ViewerLightPickerPopover({ baseLightAssets, customLightPresets, activeLightSelection, lightApplyStatus, onApplyBaseLight, onApplyCustomLight, onResetBaseLight, copy }) {
  const [lightSearchQuery, setLightSearchQuery] = useState('');
  const [activeLightCategory, setActiveLightCategory] = useState('all');
  const availableLightCategories = useMemo(() => {
    const categorySet = new Set();
    baseLightAssets.forEach((la) => { la.categories?.forEach((c) => { if (typeof c === 'string' && c.length > 0) categorySet.add(c); }); });
    return Array.from(categorySet).sort();
  }, [baseLightAssets]);
  const normalizedSearchQuery = lightSearchQuery.trim().toLowerCase();
  const filteredBaseLightAssets = useMemo(() => baseLightAssets.filter((la) => {
    if (activeLightCategory !== 'all' && !(la.categories ?? []).includes(activeLightCategory)) return false;
    if (!normalizedSearchQuery) return true;
    return la.title.toLowerCase().includes(normalizedSearchQuery) || (la.categories ?? []).some((c) => c.toLowerCase().includes(normalizedSearchQuery)) || (la.authors ?? []).some((a) => a.toLowerCase().includes(normalizedSearchQuery));
  }), [activeLightCategory, baseLightAssets, normalizedSearchQuery]);
  const hasFilterResults = filteredBaseLightAssets.length > 0;
  const stockLightTitleById = useMemo(() => new Map(baseLightAssets.map((la) => [la.id, la.title])), [baseLightAssets]);

  useEffect(() => { if (activeLightCategory !== 'all' && !availableLightCategories.includes(activeLightCategory)) setActiveLightCategory('all'); }, [activeLightCategory, availableLightCategories]);

  return (
    <div className="viewer-stage-light-picker-popover" role="dialog" aria-label={copy.editorMode.baseLightsTitle}>
      <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.baseLightsTitle}</p>
      <p className="viewer-stage-project-menu__light-copy">{copy.editorMode.baseLightsSubtitle}</p>
      {baseLightAssets.length === 0 ? (
        <p className="viewer-stage-project-menu__light-empty">{copy.editorMode.baseLightsEmpty}</p>
      ) : (
        <>
          <div className="viewer-stage-project-menu__light-filters">
            <label className="viewer-stage-project-menu__light-filter-field">
              <span>{copy.editorMode.baseLightsSearchLabel}</span>
              <input type="search" value={lightSearchQuery} onChange={(e) => setLightSearchQuery(e.target.value)} placeholder={copy.editorMode.baseLightsSearchPlaceholder} />
            </label>
            <label className="viewer-stage-project-menu__light-filter-field">
              <span>{copy.editorMode.baseLightsCategoryLabel}</span>
              <select value={activeLightCategory} onChange={(e) => setActiveLightCategory(e.target.value)}>
                <option value="all">{copy.editorMode.baseLightsCategoryAll}</option>
                {availableLightCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <ul className="viewer-stage-project-menu__light-list">
            <li>
              <div className="viewer-stage-project-menu__light-meta"><strong>{copy.editorMode.defaultLightLabel}</strong><small>{copy.editorMode.lightFallbackStatus}</small></div>
              <button type="button" className={`viewer-stage-quick-action ${activeLightSelection.kind === 'default' ? 'is-active' : ''}`} onClick={onResetBaseLight} disabled={lightApplyStatus === 'loading'}>
                <Lightbulb aria-hidden="true" size={13} /><span>{activeLightSelection.kind === 'default' ? copy.editorMode.appliedLightBadge : copy.editorMode.lightUseDefaultCta}</span>
              </button>
            </li>
            {customLightPresets.length > 0 ? (
              <>
                <li className="viewer-stage-project-menu__light-group-title"><span>{copy.editorMode.customLightsTitle}</span></li>
                {customLightPresets.map((cp) => {
                  const isActive = activeLightSelection.kind === 'custom' && activeLightSelection.presetId === cp.id;
                  const sourceTitle = cp.sourceStockLightId === APP_DEFAULT_LIGHT_SOURCE_ID ? copy.editorMode.lightComposerDefaultSourceLabel : stockLightTitleById.get(cp.sourceStockLightId) ?? cp.sourceStockLightId;
                  return (
                    <li key={cp.id}>
                      <div className="viewer-stage-project-menu__light-meta"><strong>{cp.name}</strong><small>{copy.editorMode.customLightSourceLabel}: {sourceTitle}</small></div>
                      <button type="button" className={`viewer-stage-quick-action ${isActive ? 'is-active' : ''}`} onClick={() => onApplyCustomLight(cp)} disabled={lightApplyStatus === 'loading'}>
                        <Lightbulb aria-hidden="true" size={13} /><span>{isActive ? copy.editorMode.appliedLightBadge : copy.editorMode.applyLightCta}</span>
                      </button>
                    </li>
                  );
                })}
              </>
            ) : null}
            {hasFilterResults ? filteredBaseLightAssets.map((la) => {
              const isActive = activeLightSelection.kind === 'stock' && activeLightSelection.lightId === la.id;
              return (
                <li key={la.id}>
                  <div className="viewer-stage-project-menu__light-meta"><strong>{la.title}</strong><small>{copy.editorMode.lightSourceLabel}: {la.sourceUrl ? <a href={la.sourceUrl} target="_blank" rel="noreferrer">Poly Haven</a> : ' Poly Haven'}</small></div>
                  <button type="button" className={`viewer-stage-quick-action ${isActive ? 'is-active' : ''}`} onClick={() => onApplyBaseLight(la)} disabled={lightApplyStatus === 'loading'}>
                    <Lightbulb aria-hidden="true" size={13} /><span>{isActive ? copy.editorMode.appliedLightBadge : copy.editorMode.applyLightCta}</span>
                  </button>
                </li>
              );
            }) : <li className="is-empty">{copy.editorMode.baseLightsNoResults}</li>}
          </ul>
        </>
      )}
    </div>
  );
}
