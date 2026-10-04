import { lazy, Suspense, useState } from "react";
const Dashboard = lazy(() => import('./dashboard'));
import Login from "./components/Login";
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));
const MasterjiPreview = lazy(() => import('./components/masterji/MasterjiPreview'));
const MasterjiMotionPreview = lazy(() => import('./components/masterji/MasterjiMotionPreview'));
import { useAuth } from "./context/AuthContext";
import LoadingState from './components/LoadingState';

function App() {
  const { user, loading, configured } = useAuth();
  const [page, setPage] = useState("login");

  // Masterji preview mode
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has("masterji-preview")) {
    return searchParams.has("gallery") ? (
      <MasterjiPreview />
    ) : (
      <MasterjiMotionPreview />
    );
  }

  if (loading) return <LoadingState fullPage label="Opening your study space" />;

  if (!configured) {
    return <div>Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.</div>;
  }

  // Authentication pages
  if (!user && page !== "register") {
    return (
      <Login
        onRegister={() => setPage("register")}
        onLoginSuccess={() => setPage("dashboard")}
      />
    );
  }

  if (!user && page === "register") {
    return <Register onLogin={() => setPage("login")} />;
  }

  if (user && page === "profile") {
    return <Profile />;
  }

  return <Dashboard />;
}

export default function AppWithLoading() {
  return <Suspense fallback={<LoadingState fullPage label="Opening your study space" skeleton />}><App /></Suspense>;
}
