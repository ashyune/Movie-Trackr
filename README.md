# MovieTrackr 🎬

A comprehensive movie tracking and social platform built with React and Node.js. Track movies you want to watch, have watched, and discuss them with friends.

## Features

### User Management
- User registration and authentication with JWT
- Profile customization (display name, bio, avatar, favorite genres)
- Password management

### Movie Lists
- **Watchlist** - Movies you want to watch
- **Watched** - Movies you've seen
- **Favorites** - Your favorite movies
- Add ratings, notes, and watch dates
- Move movies between lists

### Social Features
- Send and accept friend requests
- View friends' movie lists
- Discussion forums for movies
- Like and comment on discussions
- User search

### Reminders
- Set reminders for upcoming movie releases
- Multiple notification types
- Track active and sent reminders

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Vite
- TailwindCSS
- TMDB API integration

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- TMDB API key (get one at https://www.themoviedb.org/settings/api)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ashyune/MovieTrackr.git
cd MovieTrackr
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:

Frontend (root directory) - Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

Backend - Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movietrackr
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
TMDB_API_KEY=your_tmdb_api_key_here
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend server:
```bash
cd backend
npm run dev
```

7. Start the frontend (in a new terminal):
```bash
npm run dev
```

8. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
MovieTrackr/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── List.js            # Movie lists model
│   │   ├── Reminder.js        # Reminders model
│   │   └── Discussion.js      # Discussions model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User routes
│   │   ├── lists.js           # Lists routes
│   │   ├── reminders.js       # Reminders routes
│   │   ├── discussions.js     # Discussions routes
│   │   └── friends.js         # Friends routes
│   ├── server.js              # Express server
│   └── package.json
├── src/
│   ├── api/
│   │   ├── tmdb.js            # TMDB API integration
│   │   └── userApi.js         # Backend API integration
│   ├── components/
│   │   ├── MovieCard.jsx      # Movie card component
│   │   ├── Navbar.jsx         # Navigation bar
│   │   └── SearchBar.jsx      # Search component
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── hooks/
│   │   └── useAuth.js         # Authentication hook
│   ├── pages/
│   │   ├── Home.jsx           # Home page
│   │   ├── Browse.jsx         # Browse movies
│   │   ├── Login.jsx          # Login page
│   │   ├── Signup.jsx         # Registration page
│   │   ├── Profile.jsx        # User profile
│   │   ├── MyList.jsx         # User's lists
│   │   ├── Reminders.jsx      # Reminders page
│   │   ├── Discussions.jsx    # Discussions page
│   │   ├── StartDiscussion.jsx # Create discussion
│   │   └── friends.jsx        # Friends page
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Built with React and Vite
