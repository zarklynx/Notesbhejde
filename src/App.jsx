import { useState } from "react";
import Dashboard from "./dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import MasterjiPreview from "./components/masterji/MasterjiPreview";
import MasterjiMotionPreview from "./components/masterji/MasterjiMotionPreview";
import { useAuth } from "./context/AuthContext";

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

  if (loading) return <div>Loading your account...</div>;

  if (!configured) {
    return <div>Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.</div>;
  }

  // Authentication pages
  if (!user && page === "login") {
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

export default App;