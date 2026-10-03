import seed from "./notes.json"; // path: src/notes.json
import testNotes from './masterjiTestNotes.json';

const KEY = "notesbhejde_notes";
const bundledFiles = import.meta.glob('./assets/notes/*', { eager: true, query: '?url', import: 'default' });
function resolveFiles(notes) {
  const resolve = (url) => url?.startsWith('/notes/') ? bundledFiles[`./assets${url}`] || url : url;
  return notes.map(note => ({ ...note, file: resolve(note.file), images: (note.images || []).map(resolve) }));
}

// Whoever is logged in. Change this once you have real login.
export const CURRENT_USER = "Vivek";

export function getNotes() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const notes = JSON.parse(saved);
      if (!localStorage.getItem('masterji-mca-notes-v2')) {
        const demoIds = new Set(testNotes.map(note => note.id));
        const updated = [...testNotes, ...notes.filter(note => !demoIds.has(note.id))];
        localStorage.setItem(KEY, JSON.stringify(updated));
        localStorage.setItem('masterji-mca-notes-v2', 'added');
        localStorage.setItem('masterji-test-notes-v1', 'added');
        return resolveFiles(updated);
      }
      // One-time seed migration preserves uploads and later deletions of demo notes.
      if (!localStorage.getItem('masterji-test-notes-v1')) {
        const merged = [...testNotes.filter(note => !notes.some(n => n.id === note.id)), ...notes];
        localStorage.setItem(KEY, JSON.stringify(merged));
        localStorage.setItem('masterji-test-notes-v1', 'added');
        return resolveFiles(merged);
      }
      return resolveFiles(notes);
    }
    localStorage.setItem('masterji-test-notes-v1', 'added');
    localStorage.setItem('masterji-mca-notes-v2', 'added');
  } catch {
    /* ignore and fall back to the JSON */
  }
  return resolveFiles([...testNotes, ...seed]);
}

function save(notes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    throw new Error("File is too large to store locally. Try a smaller file.");
  }
}

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export async function createNote({ title, subject, description, tags, file }) {
  const isImage = file && file.type.startsWith("image/");
  const dataUrl = file ? await toDataUrl(file) : null;

  const note = {
    id: Date.now(),
    owner: CURRENT_USER,
    name: CURRENT_USER,
    topic: title,
    subject,
    info: description || "No description provided.",
    content: description || "",
    images: isImage ? [dataUrl] : [],
    file: file && !isImage ? dataUrl : null,
    fileName: file ? file.name : null,
    tags,
    review: 0,
    saved: 0,
    fav: 0,
    comment: 0,
    createdAt: new Date().toISOString(),
  };

  save([note, ...getNotes()]);
  return note;
}

export function deleteNote(id) {
  save(getNotes().filter((n) => n.id !== id));
}
