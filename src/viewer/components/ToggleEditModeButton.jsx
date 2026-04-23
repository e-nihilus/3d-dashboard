import React from 'react';
import { PencilRuler } from 'lucide-react';

export default function ToggleEditModeButton({ isEditMode, editModeShortcutKeys, toggleEditMode, editStatusFeedback, copy }) {
  const editModeTitle = isEditMode ? copy.quickActions.disableEditMode : copy.quickActions.enableEditMode;
  const editModeButtonTitle = `${editModeTitle} (${editModeShortcutKeys.join(' + ')})`;
  return (
    <button
      type="button"
      className={`viewer-stage-control viewer-stage-control--toggle viewer-stage-control--edit ${isEditMode ? 'is-active' : ''}`}
      aria-label={editModeTitle}
      title={editModeButtonTitle}
      onClick={toggleEditMode}
    >
      <PencilRuler aria-hidden="true" size={15} />
      <span className={`viewer-stage-edit-label ${editStatusFeedback ? 'is-feedback' : ''}`} aria-hidden="true">
        <span className={`viewer-stage-edit-label__line ${editStatusFeedback ? 'viewer-stage-edit-label__line--animated viewer-stage-edit-label__line--exit' : ''}`}>
          {copy.quickActions.editButton}
        </span>
        <span className={`viewer-stage-edit-label__line viewer-stage-edit-label__line--next ${editStatusFeedback ? 'viewer-stage-edit-label__line--animated viewer-stage-edit-label__line--next-enter' : ''}`}>
          {editStatusFeedback === 'enabled' ? copy.quickActions.editEnabled : editStatusFeedback === 'disabled' ? copy.quickActions.editDisabled : copy.quickActions.editButton}
        </span>
      </span>
    </button>
  );
}
