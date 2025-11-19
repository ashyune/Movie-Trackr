import { useState } from "react";
import { getImageUrl } from "../api/omdb";
import { listsAPI } from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import "./MovieCard.css";

export default function MovieCard({ movie }) {
  const { isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const posterUrl = getImageUrl(movie.poster_path, 'w342');
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  const addToList = async (listName) => {
    if (!isAuthenticated) {
      alert('Please login to add movies to your list');
      return;
    }

    try {
      setLoading(true);
      await listsAPI.addMovieToList(listName, {
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        rating: movie.vote_average
      });
      alert(`Added to ${listName}!`);
      setShowMenu(false);
    } catch (error) {
      if (error.message.includes('already in list')) {
        alert('Movie already in this list');
      } else {
        alert('Failed to add movie: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-card">
      <div
        className="poster"
        style={{ backgroundImage: `url(${posterUrl})` }}
      >
        <div className="movie-overlay">
          <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>⭐ {rating}</p>
            <p>{movie.release_date?.split('-')[0] || 'TBA'}</p>
          </div>
        </div>
      </div>
      
      <div className="card-bottom">
        {isAuthenticated && (
          <div className="card-actions">
            <button 
              className="action-btn"
              onClick={() => setShowMenu(!showMenu)}
              disabled={loading}
            >
              {loading ? '...' : '+'}
            </button>
            
            {showMenu && (
              <div className="action-menu">
                <button onClick={() => addToList('watchlist')}>Add to Watchlist</button>
                <button onClick={() => addToList('watched')}>Mark as Watched</button>
                <button onClick={() => addToList('favorites')}>Add to Favorites</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

