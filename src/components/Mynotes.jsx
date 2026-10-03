
import React, { useState } from "react";
import "./Mynotes.css";

function MyNotes({ onClose }) {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "DBMS Notes",
      subject: "Database Management System",
      description:
        "Important DBMS concepts, SQL queries and normalization.",
      tags: ["DBMS", "SQL", "Database"],
      file: "dbms-notes.pdf",
      createdAt: "03 Oct 2026",
    },
    {
      id: 2,
      title: "Java Programming",
      subject: "Java",
      description:
        "Java OOP concepts and important programming examples.",
      tags: ["Java", "OOP"],
      file: "java-notes.pdf",
      createdAt: "02 Oct 2026",
    },
  ]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (confirmDelete) {
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== id)
      );
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

            <span className="notes-count">
              {notes.length} Notes
            </span>

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

            <p>
              You haven't created any notes yet.
            </p>
          </div>

        ) : (

          <div className="notes-grid">

            {notes.map((note) => (

              <div className="note-card" key={note.id}>

                <div className="note-card-top">

                  <div className="file-icon">
                    📄
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                  >
                    🗑
                  </button>

                </div>


                <h2>{note.title}</h2>

                <p className="note-subject">
                  {note.subject}
                </p>

                <p className="note-description">
                  {note.description}
                </p>


                <div className="note-tags">

                  {note.tags.map((tag, index) => (
                    <span key={index}>
                      #{tag}
                    </span>
                  ))}

                </div>


                <div className="note-file">

                  <span>📎</span>

                  <span>{note.file}</span>

                </div>


                <div className="note-footer">

                  <span>
                    Created: {note.createdAt}
                  </span>

                  <button className="view-btn">
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

