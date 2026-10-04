import { useState } from "react";
import "./Login.css";

function Login({ onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    alert("Login successful!");

    if (onLoginSuccess) {
      onLoginSuccess();
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

          <button type="submit" className="auth-button">
            Sign In
          </button>

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