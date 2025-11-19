import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { discussionsAPI } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';
import "./Discussions.css";

export default function Discussions() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDiscussions();
  }, [filter]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { category: filter } : {};
      const data = await discussionsAPI.getAllDiscussions(params);
      setDiscussions(data.discussions || []);
    } catch (error) {
      console.error('Error loading discussions:', error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert('Please login to like discussions');
      return;
    }
    try {
      await discussionsAPI.likeDiscussion(id);
      loadDiscussions();
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading discussions...</div>;
  }

  return (
    <div className="discussion-page">
      <h2>Community Discussions</h2>
      <p>Join the conversation about your favorite movies</p>

      <div className="discussion-top-row">
        <div className="filter-buttons">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
          <button onClick={() => setFilter('review')} className={filter === 'review' ? 'active' : ''}>Reviews</button>
          <button onClick={() => setFilter('theory')} className={filter === 'theory' ? 'active' : ''}>Theories</button>
          <button onClick={() => setFilter('recommendation')} className={filter === 'recommendation' ? 'active' : ''}>Recommendations</button>
        </div>

        {isAuthenticated && (
          <Link to="/start-discussion" style={{ textDecoration: "none" }}>
            <button className="start-discussion">Start Discussion</button>
          </Link>
        )}
      </div>

      <div className="discussion-list">
        {discussions.length === 0 ? (
          <div style={{textAlign: 'center', padding: '50px', color: '#999'}}>
            <p>No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          discussions.map(discussion => (
            <div key={discussion._id} className="discussion-card">
              <div className="user-info">
                <div className="avatar">{discussion.author?.username?.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{discussion.author?.username}</strong>
                  <p style={{ margin: 0, color: "#aaa", fontSize: "0.8rem" }}>
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <span className="movie-tag">{discussion.movieTitle}</span>

              <h3>{discussion.title}</h3>
              <p className="content">
                {discussion.content.substring(0, 200)}{discussion.content.length > 200 ? '...' : ''}
              </p>

              <div className="hashtags">
                {discussion.tags?.map((tag, idx) => (
                  <span key={idx}>#{tag}</span>
                ))}
              </div>

              <div className="actions">
                <span>💬 {discussion.comments?.length || 0} comments</span>
                <span 
                  onClick={() => handleLike(discussion._id)}
                  style={{cursor: 'pointer'}}
                >
                  ❤️ {discussion.likes?.length || 0}
                </span>
                <span>👁️ {discussion.viewCount || 0} views</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
