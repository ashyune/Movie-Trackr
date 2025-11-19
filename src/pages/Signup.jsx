import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    clearError();

    try {
      await register({ username, email, password });
      navigate("/browse");
    } catch (err) {
      setLocalError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <div className="auth-header">
          <h2>Create Account 🎬</h2>
          <p>Join MovieTrackr and start tracking your movies</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          {(localError || error) && (
            <div style={{padding: '10px', background: '#fee', color: '#c00', borderRadius: '5px', marginBottom: '15px'}}>
              {localError || error}
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Signup'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
