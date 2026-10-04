import { useState } from "react";
import "./Login.css";
import { useAuth } from "../context/AuthContext";

function Login({ onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess?.();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("Enter your email first to reset your password.");
      return;
    }
    setError("");
    try {
      await resetPassword(email);
      setError("Password reset email sent.");
    } catch (resetError) {
      setError(resetError.message);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <span>NOTES</span><b>bhejde</b>
        </div>

        <h1>Welcome Back!</h1>

        <p className="auth-subtitle">
          Sign in to continue sharing and discovering notes.
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p role="alert">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <button type="button" onClick={handleReset}>Forgot password?</button>

        </form>

        <p className="switch-text">
          Don't have an account?
          <button onClick={onRegister}> Register</button>
        </p>

      </div>

    </div>
  );
}

export default Login;