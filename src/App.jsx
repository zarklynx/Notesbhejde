import { useState } from "react";
import Dashboard from "./dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import MasterjiPreview from "./components/masterji/MasterjiPreview";
import MasterjiMotionPreview from "./components/masterji/MasterjiMotionPreview";

function App() {
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

  // Authentication pages
  if (page === "login") {
    return (
      <Login
        onRegister={() => setPage("register")}
        onLoginSuccess={() => setPage("dashboard")}
      />
    );
  }

  if (page === "register") {
    return <Register onLogin={() => setPage("login")} />;
  }

  if (page === "profile") {
    return <Profile />;
  }

  return <Dashboard />;
}

export default App;