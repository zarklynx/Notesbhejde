import { useState } from "react";
import Dashboard from "./dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";

function App() {
  const [page, setPage] = useState("login");

  if (page === "login") {
    return (
      <Login
        onRegister={() => setPage("register")}
        onLoginSuccess={() => setPage("dashboard")}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onLogin={() => setPage("login")}
      />
    );
  }

  if (page === "profile") {
    return <Profile />;
  }

  return <Dashboard />;
}

export default App;