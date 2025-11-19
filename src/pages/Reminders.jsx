import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { remindersAPI, listsAPI } from '../api/userApi';
import { omdbAPI, getImageUrl } from '../api/omdb';
import { useAuth } from '../hooks/useAuth';
import './Reminders.css';

const Reminders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadReminders();
    loadUpcomingMovies();
  }, [isAuthenticated]);

  const loadReminders = async () => {
    try {
      const data = await remindersAPI.getAllReminders('active');
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingMovies = async () => {
    try {
      const data = await omdbAPI.getUpcoming();
      setUpcoming(data.results.slice(0, 10));
    } catch (error) {
      console.error('Error loading upcoming movies:', error);
    }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await omdbAPI.searchMovies(searchQuery);
      setSearchResults(data.results.slice(0, 5));
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const addReminder = async (movie) => {
    try {
      // Handle OMDB year format (e.g., "2025" or "2024")
      let releaseDate = movie.release_date;
      let reminderDate;
      
      // If release_date is just a year, create a date for Jan 1 of that year
      if (releaseDate && releaseDate.length === 4 && !isNaN(releaseDate)) {
        releaseDate = `${releaseDate}-01-01`;
        reminderDate = new Date(Date.UTC(parseInt(releaseDate), 0, 1) - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        // Try to parse as a full date
        const parsedDate = new Date(releaseDate);
        if (isNaN(parsedDate.getTime())) {
          // If parsing fails, use current date + 30 days as fallback
          releaseDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          reminderDate = new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString();
        } else {
          reminderDate = new Date(parsedDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        }
      }
      
      await remindersAPI.createReminder({
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: releaseDate,
        reminderDate: reminderDate,
        notificationType: 'app'
      });
      alert('Reminder created!');
      loadReminders();
      setShowAddModal(false);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Reminder error:', error);
      alert(error.message || 'Failed to create reminder');
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await remindersAPI.deleteReminder(id);
      loadReminders();
    } catch (error) {
      alert('Failed to delete reminder');
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading reminders...</div>;
  }

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1>🔔 Movie Reminders</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 20px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          + Add Reminder
        </button>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{background: '#1a1a1a', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px'}}>
            <h3>Search for a Movie</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={searchMovies}
              placeholder="Type to search..."
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: '#333',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '5px'
              }}
            />
            {searchResults.length > 0 && (
              <div style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '20px'}}>
                {searchResults.map(movie => (
                  <div 
                    key={movie.id}
                    onClick={() => addReminder(movie)}
                    style={{
                      padding: '10px',
                      background: '#333',
                      marginBottom: '5px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    {movie.title} ({movie.release_date?.split('-')[0]}) - {movie.release_date}
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={() => {
                setShowAddModal(false);
                setSearchResults([]);
                setSearchQuery('');
              }}
              style={{
                padding: '10px 20px',
                background: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{marginBottom: '40px'}}>
        <h2>Your Reminders ({reminders.length})</h2>
        {reminders.length === 0 ? (
          <p style={{color: '#999', padding: '20px'}}>No active reminders</p>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
            {reminders.map(reminder => (
              <div key={reminder._id} style={{background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden'}}>
                <img 
                  src={getImageUrl(reminder.posterPath, 'w342')}
                  alt={reminder.title}
                  style={{width: '100%', height: '300px', objectFit: 'cover'}}
                />
                <div style={{padding: '10px'}}>
                  <h3 style={{fontSize: '14px', margin: '0 0 5px 0'}}>{reminder.title}</h3>
                  <p style={{fontSize: '12px', color: '#999', margin: '5px 0'}}>
                    Release: {new Date(reminder.releaseDate).toLocaleDateString()}
                  </p>
                  <p style={{fontSize: '12px', color: '#6366f1', margin: '5px 0'}}>
                    Reminder: {new Date(reminder.reminderDate).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => deleteReminder(reminder._id)}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '8px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2>Upcoming Releases</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px'}}>
          {upcoming.map(movie => (
            <div key={movie.id} style={{background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden'}}>
              <img 
                src={getImageUrl(movie.poster_path, 'w342')}
                alt={movie.title}
                style={{width: '100%', height: '225px', objectFit: 'cover'}}
              />
              <div style={{padding: '8px'}}>
                <h4 style={{fontSize: '12px', margin: '0 0 5px 0'}}>{movie.title}</h4>
                <p style={{fontSize: '11px', color: '#999'}}>{movie.release_date}</p>
                <button 
                  onClick={() => addReminder(movie)}
                  style={{
                    width: '100%',
                    marginTop: '5px',
                    padding: '5px',
                    fontSize: '11px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Set Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reminders;