import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listsAPI } from "../api/userApi";
import { getImageUrl } from "../api/omdb";
import { useAuth } from "../hooks/useAuth";

export default function MyList() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeList, setActiveList] = useState('watchlist');
  const [lists, setLists] = useState({ watchlist: null, watched: null, favorites: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadLists();
  }, [isAuthenticated]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const allLists = await listsAPI.getAllLists();
      const listsObj = {};
      allLists.forEach(list => {
        listsObj[list.name] = list;
      });
      setLists(listsObj);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeMovie = async (movieId) => {
    if (!window.confirm('Remove this movie from your list?')) return;

    try {
      await listsAPI.removeMovieFromList(activeList, movieId);
      loadLists();
    } catch (error) {
      alert('Failed to remove movie');
    }
  };

  const moveMovie = async (movieId, toList) => {
    try {
      await listsAPI.moveMovie(movieId, activeList, toList);
      loadLists();
      alert(`Moved to ${toList}!`);
    } catch (error) {
      alert('Failed to move movie');
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading your lists...</div>;
  }

  const currentList = lists[activeList];
  const movies = currentList?.movies || [];

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <h1>My Movie Lists</h1>
      
      <div style={{display: 'flex', gap: '10px', marginBottom: '30px'}}>
        <button 
          onClick={() => setActiveList('watchlist')}
          style={{
            padding: '10px 20px',
            background: activeList === 'watchlist' ? '#6366f1' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Watchlist ({lists.watchlist?.movies.length || 0})
        </button>
        <button 
          onClick={() => setActiveList('watched')}
          style={{
            padding: '10px 20px',
            background: activeList === 'watched' ? '#6366f1' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Watched ({lists.watched?.movies.length || 0})
        </button>
        <button 
          onClick={() => setActiveList('favorites')}
          style={{
            padding: '10px 20px',
            background: activeList === 'favorites' ? '#6366f1' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Favorites ({lists.favorites?.movies.length || 0})
        </button>
      </div>

      {movies.length === 0 ? (
        <div style={{textAlign: 'center', padding: '50px', color: '#999'}}>
          <p>No movies in this list yet.</p>
          <button 
            onClick={() => navigate('/browse')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {movies.map(movie => (
            <div key={movie.movieId} style={{
              background: '#1a1a1a',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={getImageUrl(movie.posterPath, 'w342')}
                alt={movie.title}
                style={{width: '100%', height: '300px', objectFit: 'cover'}}
              />
              <div style={{padding: '10px'}}>
                <h3 style={{fontSize: '14px', margin: '0 0 10px 0'}}>{movie.title}</h3>
                <p style={{fontSize: '12px', color: '#999', margin: '5px 0'}}>
                  ⭐ {movie.rating?.toFixed(1) || 'N/A'}
                </p>
                {movie.userRating && (
                  <p style={{fontSize: '12px', color: '#6366f1', margin: '5px 0'}}>
                    Your rating: {movie.userRating}/10
                  </p>
                )}
                
                <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                  {activeList !== 'watchlist' && (
                    <button 
                      onClick={() => moveMovie(movie.movieId, 'watchlist')}
                      style={{
                        flex: 1,
                        padding: '5px',
                        fontSize: '11px',
                        background: '#444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      To Watchlist
                    </button>
                  )}
                  {activeList !== 'watched' && (
                    <button 
                      onClick={() => moveMovie(movie.movieId, 'watched')}
                      style={{
                        flex: 1,
                        padding: '5px',
                        fontSize: '11px',
                        background: '#444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Mark Watched
                    </button>
                  )}
                  {activeList !== 'favorites' && (
                    <button 
                      onClick={() => moveMovie(movie.movieId, 'favorites')}
                      style={{
                        flex: 1,
                        padding: '5px',
                        fontSize: '11px',
                        background: '#444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      To Favorites
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => removeMovie(movie.movieId)}
                  style={{
                    width: '100%',
                    marginTop: '5px',
                    padding: '5px',
                    fontSize: '11px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
