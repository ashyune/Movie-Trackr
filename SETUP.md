# MovieTrackr Setup Instructions

## Quick Start

### 1. Get an OMDB API Key (Required for movies to show)

1. Go to http://www.omdbapi.com/apikey.aspx
2. Choose the FREE tier (1,000 daily requests)
3. Enter your email address
4. Verify your email
5. Copy your API key from the email

### 2. Configure Environment Variables

Update the `.env` file in the root directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_OMDB_API_KEY=your_actual_api_key_here
```

Update the `backend/.env` file:
```
OMDB_API_KEY=your_actual_api_key_here
```

### 3. Start the Backend Server

```bash
cd backend
node server.js
```

The backend should be running on http://localhost:5000

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The frontend should be running on http://localhost:5173

### 5. Restart Frontend After .env Changes

**Important**: Whenever you update the `.env` file, you must restart the frontend dev server for the changes to take effect.

## Troubleshooting

### Movies not showing up
- Make sure you have a valid OMDB API key in `.env`
- Restart the frontend dev server after adding the key
- Check the browser console for API errors
- OMDB free tier has a limit of 1,000 requests per day

### "Failed to fetch" errors on login/signup
- Make sure the backend server is running on port 5000
- Check that MongoDB is running
- Verify the `.env` file exists in the backend directory

### Backend won't start
- Make sure MongoDB is installed and running
- Run `npm install` in the backend directory
- Check that port 5000 is not already in use
