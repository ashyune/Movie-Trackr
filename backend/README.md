# MovieTrackr Backend

Backend API for the MovieTrackr application - a comprehensive movie tracking and social platform.

## Features

- User authentication (register/login) with JWT
- User profile management
- Movie lists (Watchlist, Watched, Favorites)
- Reminders for upcoming movie releases
- Discussion forums for movies
- Friends system with friend requests
- MongoDB database integration

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Server port (default: 5000)
- `TMDB_API_KEY`: Your TMDB API key (optional)

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/password` - Change password (protected)
- `GET /api/users/search` - Search users (protected)
- `GET /api/users/:userId` - Get user by ID (protected)

### Lists
- `GET /api/lists` - Get all user lists (protected)
- `GET /api/lists/:listName` - Get specific list (protected)
- `POST /api/lists/:listName/movies` - Add movie to list (protected)
- `PUT /api/lists/:listName/movies/:movieId` - Update movie in list (protected)
- `DELETE /api/lists/:listName/movies/:movieId` - Remove movie from list (protected)
- `POST /api/lists/move` - Move movie between lists (protected)

### Reminders
- `GET /api/reminders` - Get all reminders (protected)
- `GET /api/reminders/:id` - Get reminder by ID (protected)
- `POST /api/reminders` - Create reminder (protected)
- `PUT /api/reminders/:id` - Update reminder (protected)
- `DELETE /api/reminders/:id` - Delete reminder (protected)
- `GET /api/reminders/upcoming/week` - Get upcoming reminders (protected)

### Discussions
- `GET /api/discussions` - Get all discussions (protected)
- `GET /api/discussions/:id` - Get discussion by ID (protected)
- `POST /api/discussions` - Create discussion (protected)
- `PUT /api/discussions/:id` - Update discussion (protected)
- `DELETE /api/discussions/:id` - Delete discussion (protected)
- `POST /api/discussions/:id/like` - Like/unlike discussion (protected)
- `POST /api/discussions/:id/comments` - Add comment (protected)
- `PUT /api/discussions/:id/comments/:commentId` - Update comment (protected)
- `DELETE /api/discussions/:id/comments/:commentId` - Delete comment (protected)
- `POST /api/discussions/:id/comments/:commentId/like` - Like/unlike comment (protected)

### Friends
- `GET /api/friends` - Get friends list (protected)
- `GET /api/friends/requests` - Get friend requests (protected)
- `POST /api/friends/request/:userId` - Send friend request (protected)
- `POST /api/friends/accept/:requestId` - Accept friend request (protected)
- `POST /api/friends/reject/:requestId` - Reject friend request (protected)
- `DELETE /api/friends/:friendId` - Remove friend (protected)
- `GET /api/friends/:friendId/lists` - Get friend's lists (protected)

## Database Models

### User
- username, email, password
- profile (displayName, bio, avatar, favoriteGenres)
- lists, friends, friendRequests

### List
- name (watchlist, watched, favorites)
- userId
- movies array with movieId, title, posterPath, rating, userRating, notes, watchedDate

### Reminder
- userId, movieId, title, posterPath
- releaseDate, reminderDate
- notificationType, status, notes

### Discussion
- title, content, author, movieId
- category, tags
- likes, comments, viewCount

## Development

The backend uses ES6 modules. Make sure your `package.json` has `"type": "module"`.

For development with auto-reload:
```bash
npm run dev
```

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes require valid JWT token
- CORS enabled for frontend integration
