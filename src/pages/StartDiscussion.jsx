import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { discussionsAPI } from '../api/userApi';
import { omdbAPI } from '../api/omdb';
import { useAuth } from '../hooks/useAuth';
import "./StartDiscussion.css";

export default function StartDiscussion() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    movieId: '',
    movieTitle: '',
    category: 'general',
    tags: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await omdbAPI.searchMovies(searchQuery);
      setSearchResults(data.results.slice(0, 5));
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const selectMovie = (movie) => {
    setFormData({
      ...formData,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster_path
    });
    setSearchResults([]);
    setSearchQuery(movie.title);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const submitDiscussion = async (e) => {
    e.preventDefault();
    if (!formData.movieId) {
      alert('Please select a movie');
      return;
    }

    try {
      setLoading(true);
      await discussionsAPI.createDiscussion(formData);
      alert('Discussion created!');
      navigate('/discussion');
    } catch (error) {
      alert('Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <div style={{marginBottom: '20px'}}>
        <h2>Start a New Discussion</h2>
        <p style={{color: '#999'}}>
          Share your thoughts about a movie or show with the community
        </p>
      </div>

      <form onSubmit={submitDiscussion} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <div>
          <label className="sd-label">Search Movie <span className="required">*</span></label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={searchMovies}
            placeholder="Type to search for a movie..."
            className="sd-input"
          />
          {searchResults.length > 0 && (
            <div style={{background: '#222', border: '1px solid #555', borderRadius: '5px', marginTop: '5px', maxHeight: '200px', overflowY: 'auto'}}>
              {searchResults.map(movie => (
                <div 
                  key={movie.id}
                  onClick={() => selectMovie(movie)}
                  style={{padding: '10px', cursor: 'pointer', borderBottom: '1px solid #333'}}
                >
                  {movie.title} ({movie.release_date?.split('-')[0]})
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="sd-label">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="sd-input"
          >
            <option value="general">General</option>
            <option value="review">Review</option>
            <option value="theory">Theory</option>
            <option value="recommendation">Recommendation</option>
          </select>
        </div>

        <div>
          <label className="sd-label">Discussion Title <span className="required">*</span></label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            placeholder="e.g., Amazing plot twist in episode 5!"
            maxLength={100}
            className="sd-input"
          />
          <p className="sd-charcount">{formData.title.length}/100 characters</p>
        </div>

        <div>
          <label className="sd-label">Your Thoughts <span className="required">*</span></label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
            placeholder="Share your thoughts, theories, or opinions..."
            maxLength={1000}
            rows="10"
            className="sd-textarea"
          />
          <p className="sd-charcount">{formData.content.length}/1000 characters</p>
        </div>

        <div>
          <label className="sd-label">Tags (Optional)</label>
          <div className="sd-tag-input-row">
            <input
              className="sd-input"
              placeholder="Add a tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <button type="button" className="sd-add-btn" onClick={handleAddTag}>Add</button>
          </div>
          <p className="sd-tag-info">
            {formData.tags.length}/5 tags • Use tags like <b>#spoilers</b>, <b>#theory</b>, <b>#recommendation</b>
          </p>
          <div className="sd-tag-list">
            {formData.tags.map((t, i) => (
              <span key={i} className="sd-tag" onClick={() => removeTag(i)}>#{t} ✕</span>
            ))}
          </div>
        </div>

        <div className="sd-footer">
          <button type="button" className="sd-cancel" onClick={() => navigate('/discussion')}>Cancel</button>
          <button type="submit" className="sd-post" disabled={loading}>
            {loading ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </form>
    </div>
  );
}
