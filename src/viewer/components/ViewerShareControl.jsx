import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Copy, Download, Link2, Share2, X } from 'lucide-react';

export default function ViewerShareControl({ shareUrl, onDownloadScreenshot, onCopyScreenshot, copy }) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkStatusMessage, setLinkStatusMessage] = useState(null);
  const [screenshotStatusMessage, setScreenshotStatusMessage] = useState(null);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isDownloadingScreenshot, setIsDownloadingScreenshot] = useState(false);
  const [isCopyingScreenshot, setIsCopyingScreenshot] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const focusTimeout = window.setTimeout(() => { closeButtonRef.current?.focus(); }, 0);
    const handleKeyDown = (event) => { if (event.key === 'Escape') { event.preventDefault(); setIsOpen(false); } };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.clearTimeout(focusTimeout); window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  const openDialog = () => { setLinkStatusMessage(null); setScreenshotStatusMessage(null); setIsOpen(true); };
  const copyLink = async () => {
    if (!shareUrl || !navigator.clipboard) { setLinkStatusMessage(copy.copyLinkError); return; }
    setIsCopyingLink(true);
    try { await navigator.clipboard.writeText(shareUrl); setLinkStatusMessage(copy.copiedLinkStatus); } catch { setLinkStatusMessage(copy.copyLinkError); } finally { setIsCopyingLink(false); }
  };
  const downloadScreenshot = async () => {
    setIsDownloadingScreenshot(true);
    try { const saved = await onDownloadScreenshot(); setScreenshotStatusMessage(saved ? copy.screenshotSavedStatus : copy.screenshotError); } catch { setScreenshotStatusMessage(copy.screenshotError); } finally { setIsDownloadingScreenshot(false); }
  };
  const copyScreenshot = async () => {
    setIsCopyingScreenshot(true);
    try {
      const status = await onCopyScreenshot();
      if (status === 'success') setScreenshotStatusMessage(copy.screenshotCopiedStatus);
      else if (status === 'unsupported') setScreenshotStatusMessage(copy.screenshotClipboardUnsupported);
      else setScreenshotStatusMessage(copy.screenshotError);
    } catch { setScreenshotStatusMessage(copy.screenshotError); } finally { setIsCopyingScreenshot(false); }
  };

  const modalNode = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <section className="viewer-share-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="viewer-share-modal__panel">
            <header className="viewer-share-modal__header">
              <div><h2>{copy.dialogTitle}</h2><p>{copy.dialogDescription}</p></div>
              <button ref={closeButtonRef} type="button" className="viewer-share-modal__close" onClick={() => setIsOpen(false)} aria-label={copy.closeDialogCta}><X aria-hidden="true" size={16} /></button>
            </header>
            <article className="viewer-share-modal__card">
              <div className="viewer-share-modal__card-copy">
                <span className="viewer-share-modal__card-icon" aria-hidden="true"><Link2 size={14} /></span>
                <div><h3>{copy.shareLinkTitle}</h3><p>{copy.shareLinkDescription}</p></div>
              </div>
              <label className="viewer-share-modal__field-label">{copy.shareLinkFieldLabel}</label>
              <input className="viewer-share-modal__field" type="text" value={shareUrl} readOnly />
              <button type="button" className="viewer-share-modal__action" onClick={() => { void copyLink(); }} disabled={isCopyingLink}><Copy aria-hidden="true" size={14} /><span>{copy.copyLinkCta}</span></button>
              {linkStatusMessage ? <p className="viewer-share-modal__status" role="status" aria-live="polite">{linkStatusMessage}</p> : null}
            </article>
            <article className="viewer-share-modal__card">
              <div className="viewer-share-modal__card-copy">
                <span className="viewer-share-modal__card-icon" aria-hidden="true"><Camera size={14} /></span>
                <div><h3>{copy.screenshotTitle}</h3><p>{copy.screenshotDescription}</p></div>
              </div>
              <div className="viewer-share-modal__actions-grid">
                <button type="button" className="viewer-share-modal__action" onClick={() => { void downloadScreenshot(); }} disabled={isDownloadingScreenshot || isCopyingScreenshot}><Download aria-hidden="true" size={14} /><span>{copy.screenshotDownloadCta}</span></button>
                <button type="button" className="viewer-share-modal__action viewer-share-modal__action--secondary" onClick={() => { void copyScreenshot(); }} disabled={isCopyingScreenshot || isDownloadingScreenshot}><Copy aria-hidden="true" size={14} /><span>{copy.screenshotClipboardCta}</span></button>
              </div>
              {screenshotStatusMessage ? <p className="viewer-share-modal__status" role="status" aria-live="polite">{screenshotStatusMessage}</p> : null}
            </article>
          </div>
        </section>,
        document.body
      )
    : null;

  return (
    <>
      <button type="button" className="viewer-stage-project-menu__share-trigger" onClick={openDialog} aria-haspopup="dialog" aria-expanded={isOpen} aria-label={copy.triggerLabel} title={copy.triggerLabel}>
        <Share2 aria-hidden="true" size={14} /><span>{copy.triggerLabel}</span>
      </button>
      {modalNode}
    </>
  );
}
