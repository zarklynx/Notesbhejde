import React from "react";
import "./Mynotes.css";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function MyNotes({ notes, onDelete, onView, onClose }) {
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      onDelete(id);
    }
  };

  return (
    <div className="my-notes-overlay">
      <div className="my-notes-modal">

        {/* HEADER */}
        <div className="my-notes-header">
          <div>
            <h1>My Notes</h1>
            <p>Notes you have created and uploaded.</p>
          </div>

          <div className="header-right">
            <span className="notes-count">{notes.length} Notes</span>

            <button
              className="close-notes"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* NOTES */}
        {notes.length === 0 ? (
          <div className="no-notes">
            <div className="empty-icon">📄</div>
            <h2>No Notes Found</h2>
            <p>You haven't created any notes yet.</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div className="note-card" key={note.id}>

                <div className="note-card-top">
                  <div className="file-icon">📄</div>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                    aria-label="Delete note"
                  >
                    🗑
                  </button>
                </div>

                <h2>{note.topic}</h2>
                <p className="note-subject">{note.subject}</p>
                <p className="note-description">{note.info}</p>

                <div className="note-tags">
                  {(note.tags || []).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>

                {note.file && (
                  <div className="note-file">
                    <span>📎</span>
                    <span>{note.fileName || note.file.split("/").pop()}</span>
                  </div>
                )}

                <div className="note-footer">
                  <span>Created: {formatDate(note.createdAt)}</span>

                  <button className="view-btn" onClick={() => onView(note)}>
                    View
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyNotes;