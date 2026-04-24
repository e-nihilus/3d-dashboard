import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Cuboid, Layers, Lightbulb, Pencil, UploadCloud } from 'lucide-react';
import ViewerShareControl from './ViewerShareControl';
import ViewerLightPickerPopover from './ViewerLightPickerPopover';

function getAssetTypeLabel(sceneAsset, copy) {
  if (sceneAsset.type === 'scenario') return copy.editorMode.assetTypeScenario;
  if (sceneAsset.type === 'light') return copy.editorMode.assetTypeLight;
  return copy.editorMode.assetTypeObject;
}

function getAssetTypeClass(sceneAsset) {
  if (sceneAsset.type === 'scenario') return 'is-scenario';
  if (sceneAsset.type === 'light') return 'is-light';
  return 'is-object';
}

function getAssetIcon(sceneAsset) {
  if (sceneAsset.type === 'scenario') return <Layers aria-hidden="true" size={13} />;
  if (sceneAsset.type === 'light') return <Lightbulb aria-hidden="true" size={13} />;
  return <Cuboid aria-hidden="true" size={13} />;
}

export default function ViewerProjectMenu({ isProjectMenuOpen, onToggleProjectMenu, projectMenuShortcutKeys, projectTitle, onRenameProject, sceneAssets, baseLightAssets, customLightPresets, activeLightSelection, activeLightLabel, lightApplyStatus, onApplyBaseLight, onApplyCustomLight, onResetBaseLight, onOpenLightComposer, shareUrl, onDownloadScreenshot, onCopyScreenshot, onOpenGallery, onOpenAssetLibrary, onOpenUpload, copy }) {
  const menuRootRef = useRef(null);
  const titleInputRef = useRef(null);
  const scenarioAsset = sceneAssets.find((a) => a.type === 'scenario');
  const listedSceneAssets = useMemo(() => sceneAssets.filter((a) => { if (a.type === 'light') return false; if (scenarioAsset && a.type === 'scenario') return false; return true; }), [scenarioAsset, sceneAssets]);
  const [isLightPickerOpen, setIsLightPickerOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const projectMenuTitle = isProjectMenuOpen ? copy.quickActions.closeProjectMenu : copy.quickActions.openProjectMenu;
  const projectMenuButtonTitle = `${projectMenuTitle} (${projectMenuShortcutKeys.join(' + ')})`;

  const startEditingTitle = () => {
    setEditingTitleValue(projectTitle);
    setIsEditingTitle(true);
    requestAnimationFrame(() => { titleInputRef.current?.focus(); titleInputRef.current?.select(); });
  };

  const commitTitle = () => {
    setIsEditingTitle(false);
    const trimmed = editingTitleValue.trim();
    if (trimmed && trimmed !== projectTitle) onRenameProject(trimmed);
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditingTitleValue('');
  };

  useEffect(() => { if (!isProjectMenuOpen) setIsLightPickerOpen(false); }, [isProjectMenuOpen]);
  useEffect(() => { if (baseLightAssets.length === 0) setIsLightPickerOpen(false); }, [baseLightAssets.length]);
  useEffect(() => {
    if (!isLightPickerOpen) return;
    const handlePointerDown = (event) => { const menuRoot = menuRootRef.current; if (!menuRoot) return; if (event.target instanceof Node && menuRoot.contains(event.target)) return; setIsLightPickerOpen(false); };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => { window.removeEventListener('pointerdown', handlePointerDown); };
  }, [isLightPickerOpen]);

  return (
    <div ref={menuRootRef} className="viewer-stage-project-menu" role="group" aria-label={copy.quickActions.openProjectMenu}>
      <div className="viewer-stage-project-menu__head">
        <button type="button" className="viewer-stage-project-menu__trigger" aria-label={projectMenuTitle} title={projectMenuButtonTitle} onClick={onToggleProjectMenu}>
          {isProjectMenuOpen ? <ChevronUp aria-hidden="true" size={15} /> : <ChevronDown aria-hidden="true" size={15} />}
        </button>
        <div className="viewer-stage-project-menu__head-actions">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              className="viewer-stage-project-menu__title viewer-stage-project-menu__title--editing"
              type="text"
              value={editingTitleValue}
              onChange={(e) => setEditingTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitTitle(); } if (e.key === 'Escape') cancelEditingTitle(); }}
            />
          ) : (
            <p className="viewer-stage-project-menu__title">
              <span>{projectTitle}</span>
              <button type="button" className="viewer-stage-project-menu__edit-title" aria-label="Rename" title="Rename" onClick={startEditingTitle}>
                <Pencil aria-hidden="true" size={11} />
              </button>
            </p>
          )}
          <ViewerShareControl shareUrl={shareUrl} onDownloadScreenshot={onDownloadScreenshot} onCopyScreenshot={onCopyScreenshot} copy={copy.share} />
        </div>
      </div>
      {isProjectMenuOpen ? (
        <div className="viewer-stage-project-menu__panel">
          <button type="button" className="viewer-stage-quick-action" onClick={onOpenGallery}><Cuboid aria-hidden="true" size={14} /><span>{copy.quickActions.openGallery}</span></button>
          <button type="button" className="viewer-stage-quick-action" onClick={onOpenAssetLibrary}><Layers aria-hidden="true" size={14} /><span>{copy.quickActions.openAssetLibrary}</span></button>
          <button type="button" className="viewer-stage-quick-action" onClick={onOpenUpload}><UploadCloud aria-hidden="true" size={14} /><span>{copy.quickActions.openUpload}</span></button>
          <div className="viewer-stage-project-menu__asset-section">
            <p className="viewer-stage-project-menu__asset-heading">{copy.editorMode.assetsTitle}</p>
            {scenarioAsset ? (
              <div className="viewer-stage-project-menu__scenario-summary">
                <span className="viewer-stage-project-menu__asset-pill is-scenario">{copy.editorMode.assetTypeScenario}</span>
                <strong>{scenarioAsset.name}</strong>
              </div>
            ) : null}
            <ul className="viewer-stage-project-menu__asset-list">
              {listedSceneAssets.map((sceneAsset) => (
                <li key={sceneAsset.id}>
                  <span className="viewer-stage-project-menu__asset-icon" aria-hidden="true">{getAssetIcon(sceneAsset)}</span>
                  <span className="viewer-stage-project-menu__asset-name">{sceneAsset.name}</span>
                  <span className={`viewer-stage-project-menu__asset-pill ${getAssetTypeClass(sceneAsset)}`}>{getAssetTypeLabel(sceneAsset, copy)}</span>
                </li>
              ))}
              <li className={`viewer-stage-project-menu__asset-light-item ${isLightPickerOpen ? 'is-open' : ''}`}>
                <span className="viewer-stage-project-menu__asset-pill is-light" aria-hidden="true"><Lightbulb aria-hidden="true" size={13} /> {copy.editorMode.assetTypeLight}</span>
                <span className="viewer-stage-project-menu__asset-light-meta"><span className="viewer-stage-project-menu__asset-name">{activeLightLabel}</span></span>
                <button type="button" className="viewer-stage-project-menu__light-change" onClick={onOpenLightComposer} disabled={lightApplyStatus === 'loading'}>{copy.editorMode.createLightCta}</button>
                <button type="button" className="viewer-stage-project-menu__light-change" onClick={() => setIsLightPickerOpen((s) => !s)} disabled={lightApplyStatus === 'loading'}>{copy.editorMode.changeLightCta}</button>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
      {isProjectMenuOpen && isLightPickerOpen ? (
        <ViewerLightPickerPopover baseLightAssets={baseLightAssets} customLightPresets={customLightPresets} activeLightSelection={activeLightSelection} lightApplyStatus={lightApplyStatus}
          onApplyBaseLight={(asset) => { onApplyBaseLight(asset); setIsLightPickerOpen(false); }}
          onApplyCustomLight={(preset) => { onApplyCustomLight(preset); setIsLightPickerOpen(false); }}
          onResetBaseLight={() => { onResetBaseLight(); setIsLightPickerOpen(false); }} copy={copy} />
      ) : null}
    </div>
  );
}
