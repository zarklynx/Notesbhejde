import seed from "./notes.json"; // path: src/notes.json

const KEY = "notesbhejde_notes";

// Whoever is logged in. Change this once you have real login.
export const CURRENT_USER = "Vivek";

export function getNotes() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore and fall back to the JSON */
  }
  return seed;
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