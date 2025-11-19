import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsAPI, userAPI } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';
import './friends.css';

const Friends = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadFriends();
    loadFriendRequests();
  }, [isAuthenticated]);

  const loadFriends = async () => {
    try {
      const data = await friendsAPI.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const data = await friendsAPI.getFriendRequests();
      setFriendRequests(data);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await userAPI.searchUsers(searchQuery);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await friendsAPI.sendFriendRequest(userId);
      alert('Friend request sent!');
      setSearchResults(searchResults.filter(u => u._id !== userId));
    } catch (error) {
      alert(error.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptFriendRequest(requestId);
      loadFriends();
      loadFriendRequests();
    } catch (error) {
      alert('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsAPI.rejectFriendRequest(requestId);
      loadFriendRequests();
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      await friendsAPI.removeFriend(friendId);
      loadFriends();
    } catch (error) {
      alert('Failed to remove friend');
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading friends...</div>;
  }

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h1>👥 Friends</h1>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showSearch ? 'Close Search' : '+ Add Friends'}
          </button>
        </div>

        {showSearch && (
          <div style={{marginBottom: '30px', padding: '20px', background: '#1a1a1a', borderRadius: '10px'}}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={searchUsers}
              placeholder="Search users by username..."
              style={{
                width: '100%',
                padding: '10px',
                background: '#333',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '5px'
              }}
            />
            {searchResults.length > 0 && (
              <div style={{marginTop: '15px'}}>
                {searchResults.map(user => (
                  <div key={user._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: '#333',
                    marginBottom: '10px',
                    borderRadius: '5px'
                  }}>
                    <div>
                      <div>{user.username}</div>
                      <div style={{fontSize: '12px', color: '#999'}}>{user.email}</div>
                    </div>
                    <button 
                      onClick={() => sendFriendRequest(user._id)}
                      style={{
                        padding: '8px 16px',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {friendRequests.length > 0 && (
          <div style={{marginBottom: '30px'}}>
            <h2>Friend Requests ({friendRequests.length})</h2>
            <div style={{display: 'grid', gap: '10px'}}>
              {friendRequests.map(request => (
                <div key={request._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: '#1a1a1a',
                  borderRadius: '10px'
                }}>
                  <div>
                    <div style={{fontWeight: 'bold'}}>{request.from?.username}</div>
                    <div style={{fontSize: '12px', color: '#999'}}>{request.from?.email}</div>
                  </div>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                      onClick={() => handleAcceptRequest(request._id)}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request._id)}
                      style={{
                        padding: '8px 16px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2>My Friends ({friends.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : friends.length === 0 ? (
            <p style={{color: '#999', padding: '20px'}}>No friends yet. Search for users to add!</p>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px'}}>
              {friends.map(friend => (
                <div key={friend._id} style={{
                  padding: '20px',
                  background: '#1a1a1a',
                  borderRadius: '10px',
                  border: '1px solid #333'
                }}>
                  <div style={{marginBottom: '15px'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '0 auto'
                    }}>
                      {friend.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{friend.username}</div>
                    <div style={{fontSize: '12px', color: '#999', marginBottom: '15px'}}>{friend.email}</div>
                    <button 
                      onClick={() => removeFriend(friend._id)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default Friends;