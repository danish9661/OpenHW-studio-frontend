const isPdfFile = (url = "") => /\.pdf(\?.*)?$/i.test(url);
const isImageFile = (url = "") => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);

function IconExternalLink({ size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v7h-7" />
      <path d="M3 10V3h7" />
      <path d="M3 21h7v-7" />
      <path d="M14 21 3 10" />
    </svg>
  );
}

function IconFileText({ size = 26 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function IconClose({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function ClassroomFilePreviewModal({ file, onClose }) {
  if (!file?.url) {
    return null;
  }

  const showImage = isImageFile(file.url);
  const showPdf = isPdfFile(file.url);

  return (
    <div className="classroom-preview-modal">
      <button
        type="button"
        className="classroom-preview-modal__backdrop"
        aria-label="Close preview"
        onClick={onClose}
      />

      <section className="classroom-preview-modal__content">
        <header className="classroom-preview-modal__header">
          <div className="classroom-preview-modal__copy">
            <p>
              Classroom File
            </p>
            
          </div>

          <div className="classroom-preview-modal__actions">
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="classroom-preview-modal__open"
            >
              <IconExternalLink size={14} />
              Open in new tab
            </a>
            <button
              type="button"
              onClick={onClose}
              className="classroom-preview-modal__close"
              aria-label="Close preview"
            >
              <IconClose size={18} />
            </button>
          </div>
        </header>

        <div className="classroom-preview-modal__body">
          {showImage ? (
            <div className="classroom-preview-modal__frame classroom-preview-modal__frame--image">
              <img
                src={file.url}
                alt={file.name || "Preview"}
                className="classroom-preview-modal__image"
              />
            </div>
          ) : null}

          {showPdf ? (
            <div className="classroom-preview-modal__frame">
              <iframe
                src={file.url}
                title={file.name || "PDF preview"}
                className="classroom-preview-modal__iframe"
              />
            </div>
          ) : null}

          {!showImage && !showPdf ? (
            <div className="classroom-preview-modal__empty">
              <span className="classroom-preview-modal__empty-icon">
                <IconFileText size={26} />
              </span>
              <h4>
                Preview not available
              </h4>
              <p>
                This file type does not support embedded preview here. Open it in
                a new tab to view or download it.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
