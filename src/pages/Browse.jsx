import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { omdbAPI, getImageUrl } from "../api/omdb";
import { listsAPI } from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import "./Browse.css";

export default function Browse() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [trendingData, popularData, upcomingData] = await Promise.all([
        omdbAPI.getTrending(),
        omdbAPI.getPopular(),
        omdbAPI.getUpcoming()
      ]);
      
      setTrending(trendingData.results.slice(0, 10));
      setPopular(popularData.results.slice(0, 10));
      setUpcoming(upcomingData.results.slice(0, 10));
      setMovies(popularData.results);
    } catch (error) {
      console.error("Error loading movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMovies();
      return;
    }

    try {
      setSearchLoading(true);
      const data = await omdbAPI.searchMovies(searchQuery);
      setMovies(data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading movies...</div>;
  }

  return (
    <div className="browse-container">
      {/* Search bar */}
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            className="search-input"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={{display: 'none'}}>Search</button>
        </form>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Movies
        </button>
        <Link to="/my-list" className="tab">
          My Lists
        </Link>
        <Link to="/discussion" className="tab">
          Discussions
        </Link>
        <Link to="/reminders" className="tab">
          Reminders
        </Link>
      </div>

      {searchLoading ? (
        <div style={{padding: '20px', textAlign: 'center'}}>Searching...</div>
      ) : searchQuery ? (
        <Section title={`Search Results (${movies.length})`}>
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Section>
      ) : (
        <>
          <Section title="Trending This Week">
            {trending.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Section>

          <Section title="Popular Movies">
            {popular.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Section>

          <Section title="Coming Soon">
            {upcoming.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

/* Reusable Section Component */
function Section({ title, children }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="cards-container">
        {children}
      </div>
    </div>
  );
}
