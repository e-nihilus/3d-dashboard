import React from 'react';
import { ChevronDown, ChevronUp, FolderOpen, Image, PencilRuler, Plus, Sparkles, Video } from 'lucide-react';

export default function ViewerQuickCreateDock({ copy, isEditMode, isCreateDockCollapsed, createDockShortcutKeys, onCollapseCreateDock, onExpandCreateDock, quickCreateTarget, onQuickCreateTargetChange, quickCreateMode, onQuickCreateModeChange, quickCreatePrompt, onQuickCreatePromptChange, onGenerateAssetInScene, onContinueToUpload, onImportFromLibrary, assetDraftName, onAssetDraftNameChange, assetDraftType, onAssetDraftTypeChange, onAddCustomAsset }) {
  const collapseTitle = `${copy.quickActions.collapseCreateDock} (${createDockShortcutKeys.join(' + ')})`;
  const expandTitle = `${copy.quickActions.expandCreateDock} (${createDockShortcutKeys.join(' + ')})`;
  return (
    <div className={`viewer-stage-create-dock ${isCreateDockCollapsed ? 'is-collapsed' : 'is-expanded'}`}>
      <section className="viewer-quick-create-panel viewer-quick-create-panel--dock" aria-label={copy.quickCreate.title} aria-hidden={isCreateDockCollapsed}>
        <div className="viewer-quick-create-panel__head">
          <h3>{copy.quickCreate.title}</h3>
          <button type="button" className="viewer-stage-control viewer-stage-control--toggle viewer-quick-create-panel__collapse" aria-label={copy.quickActions.collapseCreateDock} title={collapseTitle} onClick={onCollapseCreateDock}>
            <ChevronDown aria-hidden="true" size={13} />
          </button>
        </div>
        <div className="viewer-quick-create-panel__group">
          <p>{copy.quickCreate.targetLabel}</p>
          <div className="viewer-quick-create-panel__chips" role="group" aria-label={copy.quickCreate.targetLabel}>
            <button type="button" className={`viewer-quick-create-panel__chip ${quickCreateTarget === 'object' ? 'is-selected' : ''}`} onClick={() => onQuickCreateTargetChange('object')}>{copy.quickCreate.targetObject}</button>
            <button type="button" className={`viewer-quick-create-panel__chip ${quickCreateTarget === 'scenario' ? 'is-selected' : ''}`} onClick={() => onQuickCreateTargetChange('scenario')}>{copy.quickCreate.targetScenario}</button>
          </div>
        </div>
        <div className="viewer-quick-create-panel__group">
          <p>{copy.quickCreate.modeLabel}</p>
          <div className="viewer-quick-create-panel__chips" role="group" aria-label={copy.quickCreate.modeLabel}>
            <button type="button" className={`viewer-quick-create-panel__chip ${quickCreateMode === 'image' ? 'is-selected' : ''}`} onClick={() => onQuickCreateModeChange('image')}><Image aria-hidden="true" size={13} /><span>{copy.quickCreate.modeImage}</span></button>
            <button type="button" className={`viewer-quick-create-panel__chip ${quickCreateMode === 'video' ? 'is-selected' : ''}`} onClick={() => onQuickCreateModeChange('video')}><Video aria-hidden="true" size={13} /><span>{copy.quickCreate.modeVideo}</span></button>
            <button type="button" className={`viewer-quick-create-panel__chip ${quickCreateMode === 'prompt' ? 'is-selected' : ''}`} onClick={() => onQuickCreateModeChange('prompt')}><PencilRuler aria-hidden="true" size={13} /><span>{copy.quickCreate.modePrompt}</span></button>
          </div>
        </div>
        {quickCreateMode === 'prompt' ? (
          <label className="viewer-quick-create-panel__prompt">
            <span>{copy.quickCreate.promptLabel}</span>
            <textarea value={quickCreatePrompt} rows={4} placeholder={copy.quickCreate.promptPlaceholder} onChange={(e) => onQuickCreatePromptChange(e.target.value)} />
          </label>
        ) : (
          <p className="viewer-quick-create-panel__mode-hint">{quickCreateMode === 'image' ? copy.quickCreate.imageHint : copy.quickCreate.videoHint}</p>
        )}
        {isEditMode ? (
          <>
            <div className="viewer-quick-create-panel__editor-divider" />
            <div className="viewer-quick-create-panel__group">
              <p>{copy.editorMode.addPanelTitle}</p>
              <p className="viewer-quick-create-panel__mode-hint">{copy.editorMode.addPanelDescription}</p>
            </div>
            <button type="button" className="viewer-quick-create-panel__cta" onClick={onGenerateAssetInScene}><Sparkles aria-hidden="true" size={14} /><span>{copy.editorMode.generateInSceneCta}</span></button>
            <button type="button" className="viewer-quick-create-panel__cta viewer-quick-create-panel__cta--secondary" onClick={onContinueToUpload}><Sparkles aria-hidden="true" size={14} /><span>{copy.editorMode.sendToUploadCta}</span></button>
            <button type="button" className="viewer-quick-create-panel__cta viewer-quick-create-panel__cta--secondary" onClick={onImportFromLibrary}><FolderOpen aria-hidden="true" size={14} /><span>{copy.editorMode.importFromLibraryCta}</span></button>
            <label className="viewer-quick-create-panel__prompt">
              <span>{copy.editorMode.customAssetNameLabel}</span>
              <input type="text" className="viewer-quick-create-panel__input" value={assetDraftName} placeholder={copy.editorMode.customAssetNamePlaceholder} onChange={(e) => onAssetDraftNameChange(e.target.value)} />
            </label>
            <div className="viewer-quick-create-panel__group">
              <p>{copy.editorMode.customAssetTypeLabel}</p>
              <div className="viewer-quick-create-panel__chips" role="group" aria-label={copy.editorMode.customAssetTypeLabel}>
                <button type="button" className={`viewer-quick-create-panel__chip ${assetDraftType === 'object' ? 'is-selected' : ''}`} onClick={() => onAssetDraftTypeChange('object')}>{copy.editorMode.assetTypeObject}</button>
                <button type="button" className={`viewer-quick-create-panel__chip ${assetDraftType === 'scenario' ? 'is-selected' : ''}`} onClick={() => onAssetDraftTypeChange('scenario')}>{copy.editorMode.assetTypeScenario}</button>
                <button type="button" className={`viewer-quick-create-panel__chip ${assetDraftType === 'light' ? 'is-selected' : ''}`} onClick={() => onAssetDraftTypeChange('light')}>{copy.editorMode.assetTypeLight}</button>
              </div>
            </div>
            <button type="button" className="viewer-quick-create-panel__cta" onClick={onAddCustomAsset}><Plus aria-hidden="true" size={14} /><span>{copy.editorMode.customAssetAddCta}</span></button>
          </>
        ) : (
          <button type="button" className="viewer-quick-create-panel__cta" onClick={onContinueToUpload}><Sparkles aria-hidden="true" size={14} /><span>{copy.quickCreate.continueCta}</span></button>
        )}
      </section>
      {isCreateDockCollapsed ? (
        <button type="button" className="viewer-stage-control viewer-stage-control--toggle viewer-stage-create-dock__toggle" aria-label={copy.quickActions.expandCreateDock} title={expandTitle} onClick={onExpandCreateDock}>
          <ChevronUp aria-hidden="true" size={15} />
        </button>
      ) : null}
    </div>
  );
}
