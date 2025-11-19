import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  movieTitle: String,
  moviePoster: String,
  category: {
    type: String,
    enum: ['review', 'theory', 'recommendation', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

discussionSchema.index({ movieId: 1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ createdAt: -1 });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
