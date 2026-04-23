import React from 'react';
import CameraAngles from './CameraAngles';
import CameraControls from './CameraControls';
import ToggleEditModeButton from './ToggleEditModeButton';

export default function ViewerStageControls({ copy, isEditMode, editStatusFeedback, controlsShortcutKeys, editModeShortcutKeys, toggleEditMode, hideEditModeButton = false, controlsCollapsed, setControlsCollapsed, canInteractCamera, zoomControlProgress, setZoomProgress, rotateCamera, zoomCamera, resetCamera, activeEditorView, setActiveEditorView, editorViewOptions, savingScene, saveSuccess, onSaveScene, sceneId }) {
  const controlsStateClass = controlsCollapsed ? 'is-collapsed' : 'is-expanded';
  return (
    <div className={`viewer-stage-controls ${controlsStateClass}`} role="group" aria-label={copy.controlsAriaLabel}>
      {onSaveScene ? (
        <button
          type="button"
          onClick={onSaveScene}
          disabled={savingScene}
          className={`viewer-stage-control viewer-stage-control--save ${saveSuccess ? 'is-success' : ''}`}
          title={sceneId ? 'Update Scene' : 'Save Scene'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {savingScene ? 'progress_activity' : saveSuccess ? 'check_circle' : 'save'}
          </span>
          <span>{savingScene ? 'Saving...' : saveSuccess ? 'Saved!' : sceneId ? 'Update' : 'Save'}</span>
        </button>
      ) : null}
      {!hideEditModeButton ? (
        <ToggleEditModeButton isEditMode={isEditMode} editModeShortcutKeys={editModeShortcutKeys} editStatusFeedback={editStatusFeedback} toggleEditMode={toggleEditMode} copy={copy} />
      ) : null}
      {!isEditMode ? (
        <CameraControls canInteractCamera={canInteractCamera} controlsCollapsed={controlsCollapsed} controlsShortcutKeys={controlsShortcutKeys} setControlsCollapsed={setControlsCollapsed} zoomControlProgress={zoomControlProgress} setZoomProgress={setZoomProgress} rotateCamera={rotateCamera} zoomCamera={zoomCamera} resetCamera={resetCamera} copy={copy} />
      ) : (
        <CameraAngles activeEditorView={activeEditorView} setActiveEditorView={setActiveEditorView} controlsCollapsed={controlsCollapsed} controlsShortcutKeys={controlsShortcutKeys} setControlsCollapsed={setControlsCollapsed} editorViewOptions={editorViewOptions} copy={copy} />
      )}
    </div>
  );
}
