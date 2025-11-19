import "./Home.css";

export default function Home() {
  return (
    <>
      <div className="home-hero">
        <div className="overlay"></div>

        <div className="home-content">
          <h1>Track. Organize. Discover Movies.</h1>
          <p>
            Your personal movie companion — keep track of what you've watched,
            what you want to watch, and discover new favorites.
          </p>

          <div className="home-buttons">
            <a href="/browse" className="btn-primary">Start Browsing</a>
            <a href="/login" className="btn-secondary">Login</a>
            
          </div>
        </div>
      </div>
    </>
  );
}
