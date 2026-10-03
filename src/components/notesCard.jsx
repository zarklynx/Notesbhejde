import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaStar, FaRegBookmark, FaRegHeart, FaRegComment, FaDownload,
} from "react-icons/fa";
import "./NotesCss.css";

function NoteView({ note, onClose }) {
  const tags = note.tags || [];
  const images = note.images || [];
  const fileName = note.fileName || (note.file ? note.file.split("/").pop() : "");

  // only PDFs can be previewed in an iframe (docx/pptx cannot)
  const isPdf =
    !!note.file &&
    (note.file.startsWith("data:application/pdf") ||
      note.file.toLowerCase().endsWith(".pdf"));

  // uploaded files are data URLs; browsers preview PDFs more reliably as blob URLs
  const [viewerSrc, setViewerSrc] = useState(null);

  useEffect(() => {
    if (!isPdf) {
      setViewerSrc(null);
      return;
    }
    if (!note.file.startsWith("data:")) {
      let stale = false;
      fetch(note.file, { method: "HEAD" })
        .then((r) => {
          if (stale) return;
          const type = r.headers.get("content-type") || "";
          setViewerSrc(r.ok && type.includes("pdf") ? note.file : "missing");
        })
        .catch(() => {
          if (!stale) setViewerSrc("missing");
        });
      return () => {
        stale = true;
      };
    }
    let url;
    let cancelled = false;
    fetch(note.file)
      .then((r) => r.blob())
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setViewerSrc(url);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [note.file, isPdf]);

  // close with the Esc key
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="nv-overlay" onClick={onClose}>
      <div className="nv-panel" onClick={(e) => e.stopPropagation()}>

        <div className="nv-header">
          <div className="nv-user">
            <span className="nv-avatar">{note.name?.[0]}</span>
            <div>
              <h2 className="nv-title">{note.topic}</h2>
              <p className="nv-by">
                by {note.name} · {note.subject}
              </p>
            </div>
          </div>

          <div className="nv-actions">
            {note.file && (
              <a className="nv-download" href={note.file} download={fileName}>
                <FaDownload /> Download
              </a>
            )}
            <button className="nv-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="nv-scroll">
          <div className="nv-tags">
            {tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>

          <div className="nv-text">{note.content || note.info}</div>

          {images.map((src, i) => (
            <figure className="nv-figure" key={i}>
              <img src={src} alt={note.topic} />
              <a className="nv-imgdl" href={src} download>
                Download image
              </a>
            </figure>
          ))}

          {isPdf && viewerSrc && viewerSrc !== "missing" && (
            <iframe className="nv-viewer" src={viewerSrc} title={note.topic} />
          )}

          {isPdf && viewerSrc === "missing" && (
            <p className="nv-nopreview">This file could not be found on the server.</p>
          )}

          {note.file && !isPdf && (
            <p className="nv-nopreview">
              Preview isn't available for this file type. Use Download to open it.
            </p>
          )}
        </div>

        <div className="nv-stats">
          <span><FaStar /> {note.review}</span>
          <span><FaRegBookmark /> {note.saved}</span>
          <span><FaRegHeart /> {note.fav}</span>
          <span><FaRegComment /> {note.comment}</span>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default NoteView;