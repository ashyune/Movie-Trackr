import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  posterPath: String,
  releaseDate: {
    type: Date,
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  notificationType: {
    type: String,
    enum: ['email', 'app', 'both'],
    default: 'app'
  },
  status: {
    type: String,
    enum: ['active', 'sent', 'cancelled'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

reminderSchema.index({ userId: 1, movieId: 1 });
reminderSchema.index({ reminderDate: 1, status: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
