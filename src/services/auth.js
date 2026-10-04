import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
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
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/network-request-failed": "Unable to connect. Check your internet connection and try again.",
    "auth/user-disabled": "This account is disabled. Contact the NotesBhejde team.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Use a stronger password with at least six characters.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/popup-blocked": "Your browser blocked Google sign-in. Allow pop-ups for this site and try again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled. You can try again or sign in with email.",
    "auth/cancelled-popup-request": "Another sign-in window is already open.",
    "auth/account-exists-with-different-credential": "This email uses a different sign-in method. Sign in using your existing method first.",
    "auth/operation-not-allowed": "Google sign-in is not enabled for this Firebase project.",
    "auth/unauthorized-domain": "Google sign-in is not enabled for this website address. Please use the hosted NotesBhejde URL.",
  };
  return new Error(messages[error.code] || "Authentication failed. Please try again.");
}

export async function loginWithGoogle() {
  try {
    const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'})
    const {user}=await signInWithPopup(requireAuth(),provider)
    const reference=doc(db,'users',user.uid)
    const existing=await getDoc(reference)
    if(!existing.exists()) await setDoc(reference,{
      uid:user.uid,displayName:user.displayName || 'Student',email:user.email,
      mobile:null,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),
    },{merge:true})
    return user
  } catch(error) {throw getAuthError(error)}
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
    const userCredential = await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
    return userCredential.user;
  } catch (error) {
    throw getAuthError(error);
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(requireAuth(), email.trim());
  } catch (error) {
    if(error.code === 'auth/user-not-found') return;
    throw getAuthError(error);
  }
}

export async function logoutUser() {
  await signOut(requireAuth());
}
