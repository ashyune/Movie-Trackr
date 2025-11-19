import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="nav-wrapper">
      <Link to={isAuthenticated ? "/browse" : "/"} className="nav-left">
        <div className="logo-box">🎬</div>
        <div className="logo-text">
          <h1>MovieTrackr</h1>
          <p>Track, Discuss & Discover</p>
        </div>
      </Link>

      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <Link to="/browse" className="icon-btn">🎬 Browse</Link>
            <Link to="/my-list" className="icon-btn">📝 My Lists</Link>
            <Link to="/reminders" className="icon-btn">🔔 Reminders</Link>
            <Link to="/discussion" className="icon-btn">💬 Discussions</Link>
            <Link to="/friends" className="icon-btn">👥 Friends</Link>
            <Link to="/profile" className="icon-btn">👤 {user?.username || 'Profile'}</Link>
            <button onClick={handleLogout} className="login-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/browse" className="icon-btn">🎬 Browse</Link>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="add-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
