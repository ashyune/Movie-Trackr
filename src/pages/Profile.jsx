import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI, listsAPI } from '../api/userApi';
import './Profile.css';

const Profile = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    favoriteGenres: []
  });
  const [stats, setStats] = useState({ watchlist: 0, watched: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadStats();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile();
      setProfile(data);
      setFormData({
        displayName: data.profile?.displayName || '',
        bio: data.profile?.bio || '',
        favoriteGenres: data.profile?.favoriteGenres || []
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const lists = await listsAPI.getAllLists();
      const statsObj = {};
      lists.forEach(list => {
        statsObj[list.name] = list.movies.length;
      });
      setStats(statsObj);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await userAPI.updateProfile(formData);
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
      alert('Profile updated!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <p>View and manage your movie tracking profile</p>
        </div>

        <div className="profile-content">
          <div className="profile-info">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="profile-details">
              <h2>{formData.displayName || profile?.username}</h2>
              <div className="username">@{profile?.username}</div>
              <div className="email">{profile?.email}</div>
              {editing ? (
                <div style={{marginTop: '10px'}}>
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      background: '#333',
                      color: 'white',
                      border: '1px solid #555',
                      borderRadius: '5px'
                    }}
                  />
                  <textarea
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#333',
                      color: 'white',
                      border: '1px solid #555',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              ) : (
                formData.bio && <p style={{marginTop: '10px', color: '#999'}}>{formData.bio}</p>
              )}
            </div>
          </div>

          {editing ? (
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="edit-profile-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="edit-profile-btn" onClick={() => setEditing(false)} style={{background: '#555'}}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="edit-profile-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}

          <div className="profile-section">
            <h3>Movie Stats</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px'}}>
              <div style={{background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#6366f1'}}>{stats.watchlist || 0}</div>
                <div style={{fontSize: '12px', color: '#999'}}>Watchlist</div>
              </div>
              <div style={{background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#10b981'}}>{stats.watched || 0}</div>
                <div style={{fontSize: '12px', color: '#999'}}>Watched</div>
              </div>
              <div style={{background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#f59e0b'}}>{stats.favorites || 0}</div>
                <div style={{fontSize: '12px', color: '#999'}}>Favorites</div>
              </div>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;