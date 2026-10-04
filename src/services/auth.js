import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.");
  }
  return auth;
}

function getAuthError(error) {
  const messages = {
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Use a stronger password with at least six characters.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  };
  return new Error(messages[error.code] || "Authentication failed. Please try again.");
}

export async function registerUser({ name, email, password, mobile }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(requireAuth(), email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      displayName: name,
      email: userCredential.user.email,
      mobile: mobile || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return userCredential.user;
  } catch (error) {
    throw getAuthError(error);
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(requireAuth(), email, password);
    return userCredential.user;
  } catch (error) {
    throw getAuthError(error);
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(requireAuth(), email);
  } catch (error) {
    throw getAuthError(error);
  }
}

export async function logoutUser() {
  await signOut(requireAuth());
}
