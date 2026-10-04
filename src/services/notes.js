import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { aiFetch } from "../components/masterji/aiClient";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function requireServices() {
  if (!auth || !db) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.");
  }
  if (!auth.currentUser) throw new Error("Please sign in before managing notes.");
}

async function uploadFile(file, noteId) {
  const form = new FormData();
  form.set("file", file);
  form.set("noteId", noteId);
  const response = await aiFetch("/api/notes/upload", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not upload this file.");
  return result;
}

async function deleteFile(publicId, resourceType) {
  const response = await aiFetch("/api/notes/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId, resourceType }),
  });
  if (!response.ok) throw new Error("Could not remove the uploaded file.");
}

export async function validateNote({ title, description, content }) {
  requireServices();
  const response = await aiFetch("/api/validate-note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, content }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not validate this note.");
  return result;
}

function normalizeNote(snapshot) {
  const data = snapshot.data();
  const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString();
  return { ...data, id: snapshot.id, createdAt };
}

function validateFile(file) {
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) throw new Error("Please use a file smaller than 20 MB.");
  if (!file.type.startsWith("image/") && !ALLOWED_FILE_TYPES.has(file.type)) {
    throw new Error("Supported files are PDF, DOCX, PPTX, and images.");
  }
}

export async function listNotes() {
  requireServices();
  const notesQuery = query(
    collection(db, "notes"),
    where("visibility", "==", "public"),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(notesQuery);
  return snapshot.docs.map(normalizeNote);
}

export async function createNote({ title, subject, description, content, tags, file }) {
  requireServices();
  validateFile(file);

  const user = auth.currentUser;
  const noteReference = doc(collection(db, "notes"));
  let cloudinaryAsset = null;

  try {
    if (file) cloudinaryAsset = await uploadFile(file, noteReference.id);

    const note = {
      ownerId: user.uid,
      ownerName: user.displayName || user.email || "Student",
      topic: title,
      subject,
      info: description || "No description provided.",
      content: content || description || "",
      images: file?.type.startsWith("image/") && cloudinaryAsset ? [cloudinaryAsset.secureUrl] : [],
      file: file && !file.type.startsWith("image/") ? cloudinaryAsset?.secureUrl : null,
      fileName: file?.name || null,
      cloudinaryPublicId: cloudinaryAsset?.publicId || null,
      cloudinaryResourceType: cloudinaryAsset?.resourceType || null,
      tags,
      review: 0,
      saved: 0,
      fav: 0,
      comment: 0,
      visibility: "public",
      isDemo: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(noteReference, note);
    return { ...note, id: noteReference.id, createdAt: new Date().toISOString() };
  } catch (error) {
    if (cloudinaryAsset?.publicId) await deleteFile(cloudinaryAsset.publicId, cloudinaryAsset.resourceType).catch(() => undefined);
    throw error;
  }
}

export async function deleteNote(note) {
  requireServices();
  if (note.ownerId !== auth.currentUser.uid) throw new Error("You can delete only your own notes.");

  await deleteDoc(doc(db, "notes", note.id));
  if (note.cloudinaryPublicId) await deleteFile(note.cloudinaryPublicId, note.cloudinaryResourceType).catch(() => undefined);
}
