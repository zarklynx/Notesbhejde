import LoadingState from './LoadingState'
import { useState } from "react";
import "./Register.css";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from './GoogleSignInButton';

function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, mobile });
      onLogin();
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <span>Notes</span><b>bhejde</b>
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join NotesBhejde and start sharing knowledge.
        </p>

        <GoogleSignInButton disabled={loading} onBusyChange={setLoading} onError={setError} onSuccess={onLogin} />
        <form onSubmit={handleRegister}>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Mobile Number</label>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p role="alert">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <LoadingState compact label="Creating your account" /> : "Create Account"}
          </button>

        </form>

        <p className="switch-text">
          Already have an account?
          <button onClick={onLogin}> Sign In</button>
        </p>

      </div>

    </div>
  );
}

export default Register;
