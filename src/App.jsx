import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getNotes, deleteNote, CURRENT_USER } from "./api";
import Dashboard from "./dashboard";
import Profile from "./components/Profile";
import MyNotes from "./components/Mynotes";
import NoteView from "./components/notesCard";

function App() {
  const [notes, setNotes] = useState(() => getNotes());

  const addNote = (note) => setNotes((prev) => [note, ...prev]);

  const handleDelete = (id) => {
    deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard notes={notes} onAdd={addNote} />} />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/my-notes"
        element={<MyNotes notes={notes.filter((n) => n.owner === CURRENT_USER)} onDelete={handleDelete} />}
      />
      <Route path="/notes/:id" element={<NoteView notes={notes} />} />
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  );
}

export default App;