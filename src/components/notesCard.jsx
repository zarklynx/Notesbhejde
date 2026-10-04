import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaRegBookmark, FaRegHeart, FaHeart, FaRegComment, FaDownload,
} from "react-icons/fa";
import "./NotesCss.css";
import MasterjiChat from './masterji/MasterjiChat'
import NoteComments from './NoteComments'
import NoteRating from './NoteRating'
import { watchStats, watchItems } from '../services/community'

function NoteView({ note, onClose, onProfile, onSave, onFavourite, saved, favourite }) {
  const tags = note.tags || [];
  const images = note.images || [];
  const fileName = note.fileName || (note.file ? note.file.split("/").pop() : "");
  const [stats,setStats] = useState([]), [comments,setComments] = useState([]);
  useEffect(()=>watchStats(setStats),[]);
  useEffect(()=>watchItems(`notes/${note.id}/comments`,setComments),[note.id]);
  const stat = stats.find(s=>s.id===note.id);

  // only PDFs can be previewed in an iframe (docx/pptx cannot)
  const isPdf =
    !!note.file &&
    (note.file.startsWith("data:application/pdf") ||
      /\.pdf(?:[?#]|$)/i.test(note.file) || /\.pdf$/i.test(note.fileName || ''));

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
            <button className="nv-avatar" onClick={() => onProfile?.(note.ownerId,note.ownerName)}>{(note.ownerName || 'S')[0]}</button>
            <div>
              <h2 className="nv-title">{note.topic}</h2>
              <p className="nv-by">
                by {note.ownerName || 'Student'} · {note.subject}
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
          <NoteRating key={`rating-${note.id}`} noteId={note.id} ownerId={note.ownerId} />
          <NoteComments key={note.id} noteId={note.id} onProfile={onProfile} />
        </div>

        <div className="nv-stats">
          <span>{stat?.views || 0} views</span>
          <button onClick={onSave} aria-pressed={saved}><FaRegBookmark /> {saved ? 'Saved' : 'Save'}</button>
          <button className="favourite-action" onClick={onFavourite} aria-pressed={favourite}>{favourite ? <FaHeart key="liked" className="liked-icon" /> : <FaRegHeart key="unliked" />} {stat?.favourites || 0} {favourite ? 'Liked' : 'Like'}</button>
          <span><FaRegComment /> {comments.length}</span>
        </div>

      </div>
      <MasterjiChat key={note.id} note={note} />
    </div>,
    document.body
  );
}

export default NoteView;
