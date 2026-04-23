import React from 'react';

export default function ViewerStageOverlays({ assets, resolvedAsset, manifestError, assetError, onDismissAssetError, copy }) {
  return (
    <>
      {manifestError ? (
        <div className="viewer-stage-overlay viewer-stage-overlay--error" role="alert">
          <p>{copy.asset.missingTitle}</p>
          <small>{manifestError}</small>
        </div>
      ) : null}
      {!manifestError && assets !== null && !resolvedAsset ? (
        <div className="viewer-stage-overlay viewer-stage-overlay--error" role="alert">
          <p>{copy.asset.missingTitle}</p>
          <small>{copy.asset.missingDescription}</small>
        </div>
      ) : null}
      {assetError ? (
        <div className="viewer-stage-overlay viewer-stage-overlay--error" role="alert">
          <p>{copy.asset.missingTitle}</p>
          <small>{assetError}</small>
          {onDismissAssetError ? (
            <button type="button" className="viewer-stage-overlay__dismiss" onClick={onDismissAssetError} aria-label="Dismiss">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
