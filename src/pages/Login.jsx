import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    clearError();

    try {
      await login({ email, password });
      navigate("/browse");
    } catch (err) {
      setLocalError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <div className="auth-header">
          <h2>Welcome Back 🎬</h2>
          <p>Login to continue tracking and discovering movies</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {(localError || error) && (
            <div style={{padding: '10px', background: '#fee', color: '#c00', borderRadius: '5px', marginBottom: '15px'}}>
              {localError || error}
            </div>
          )}

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
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
}
