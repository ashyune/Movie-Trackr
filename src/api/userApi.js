const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    return response.json();
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json();
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },

  changePassword: async (passwordData) => {
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(passwordData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
    
    return response.json();
  },

  searchUsers: async (query) => {
    const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    
    return response.json();
  },

  getUserById: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    return response.json();
  },
};

// Lists API
export const listsAPI = {
  getAllLists: async () => {
    const response = await fetch(`${API_URL}/lists`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get lists');
    }
    
    return response.json();
  },

  getList: async (listName) => {
    const response = await fetch(`${API_URL}/lists/${listName}`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get list');
    }
    
    return response.json();
  },

  addMovieToList: async (listName, movieData) => {
    const response = await fetch(`${API_URL}/lists/${listName}/movies`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(movieData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add movie');
    }
    
    return response.json();
  },

  updateMovieInList: async (listName, movieId, updateData) => {
    const response = await fetch(`${API_URL}/lists/${listName}/movies/${movieId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update movie');
    }
    
    return response.json();
  },

  removeMovieFromList: async (listName, movieId) => {
    const response = await fetch(`${API_URL}/lists/${listName}/movies/${movieId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove movie');
    }
    
    return response.json();
  },

  moveMovie: async (movieId, fromList, toList) => {
    const response = await fetch(`${API_URL}/lists/move`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ movieId, fromList, toList }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to move movie');
    }
    
    return response.json();
  },
};

// Reminders API
export const remindersAPI = {
  getAllReminders: async (status) => {
    const url = status 
      ? `${API_URL}/reminders?status=${status}`
      : `${API_URL}/reminders`;
    
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get reminders');
    }
    
    return response.json();
  },

  getReminder: async (id) => {
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get reminder');
    }
    
    return response.json();
  },

  createReminder: async (reminderData) => {
    const response = await fetch(`${API_URL}/reminders`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(reminderData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create reminder');
    }
    
    return response.json();
  },

  updateReminder: async (id, updateData) => {
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update reminder');
    }
    
    return response.json();
  },

  deleteReminder: async (id) => {
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete reminder');
    }
    
    return response.json();
  },

  getUpcomingReminders: async () => {
    const response = await fetch(`${API_URL}/reminders/upcoming/week`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upcoming reminders');
    }
    
    return response.json();
  },
};

// Discussions API
export const discussionsAPI = {
  getAllDiscussions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.movieId) queryParams.append('movieId', params.movieId);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await fetch(`${API_URL}/discussions?${queryParams}`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get discussions');
    }
    
    return response.json();
  },

  getDiscussion: async (id) => {
    const response = await fetch(`${API_URL}/discussions/${id}`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get discussion');
    }
    
    return response.json();
  },

  createDiscussion: async (discussionData) => {
    const response = await fetch(`${API_URL}/discussions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(discussionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create discussion');
    }
    
    return response.json();
  },

  updateDiscussion: async (id, updateData) => {
    const response = await fetch(`${API_URL}/discussions/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update discussion');
    }
    
    return response.json();
  },

  deleteDiscussion: async (id) => {
    const response = await fetch(`${API_URL}/discussions/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete discussion');
    }
    
    return response.json();
  },

  likeDiscussion: async (id) => {
    const response = await fetch(`${API_URL}/discussions/${id}/like`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to like discussion');
    }
    
    return response.json();
  },

  addComment: async (id, content) => {
    const response = await fetch(`${API_URL}/discussions/${id}/comments`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    
    return response.json();
  },

  updateComment: async (discussionId, commentId, content) => {
    const response = await fetch(`${API_URL}/discussions/${discussionId}/comments/${commentId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update comment');
    }
    
    return response.json();
  },

  deleteComment: async (discussionId, commentId) => {
    const response = await fetch(`${API_URL}/discussions/${discussionId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
    
    return response.json();
  },

  likeComment: async (discussionId, commentId) => {
    const response = await fetch(`${API_URL}/discussions/${discussionId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to like comment');
    }
    
    return response.json();
  },
};

// Friends API
export const friendsAPI = {
  getFriends: async () => {
    const response = await fetch(`${API_URL}/friends`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friends');
    }
    
    return response.json();
  },

  getFriendRequests: async () => {
    const response = await fetch(`${API_URL}/friends/requests`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friend requests');
    }
    
    return response.json();
  },

  sendFriendRequest: async (userId) => {
    const response = await fetch(`${API_URL}/friends/request/${userId}`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send friend request');
    }
    
    return response.json();
  },

  acceptFriendRequest: async (requestId) => {
    const response = await fetch(`${API_URL}/friends/accept/${requestId}`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept friend request');
    }
    
    return response.json();
  },

  rejectFriendRequest: async (requestId) => {
    const response = await fetch(`${API_URL}/friends/reject/${requestId}`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject friend request');
    }
    
    return response.json();
  },

  removeFriend: async (friendId) => {
    const response = await fetch(`${API_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove friend');
    }
    
    return response.json();
  },

  getFriendLists: async (friendId) => {
    const response = await fetch(`${API_URL}/friends/${friendId}/lists`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get friend lists');
    }
    
    return response.json();
  },
};
