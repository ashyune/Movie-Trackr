import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['watchlist', 'watched', 'favorites'],
    default: 'watchlist'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movies: [{
    movieId: {
      type: String,
      required: true
    },
    title: String,
    posterPath: String,
    rating: Number,
    addedAt: {
      type: Date,
      default: Date.now
    },
    userRating: {
      type: Number,
      min: 0,
      max: 10
    },
    notes: String,
    watchedDate: Date
  }]
}, {
  timestamps: true
});

// Compound index to ensure one list per type per user
listSchema.index({ userId: 1, name: 1 }, { unique: true });

const List = mongoose.model('List', listSchema);

export default List;
