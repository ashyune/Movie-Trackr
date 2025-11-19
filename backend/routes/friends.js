import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/friends
// @desc    Get user's friends list
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username email profile');

    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends/requests
// @desc    Get friend requests
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username email profile');

    const pendingRequests = user.friendRequests.filter(req => req.status === 'pending');

    res.json(pendingRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/request/:userId
// @desc    Send friend request
// @access  Private
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    if (targetUserId === req.userId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.userId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === req.userId && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: req.userId,
      status: 'pending'
    });

    await targetUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/accept/:requestId
// @desc    Accept friend request
// @access  Private
router.post('/accept/:requestId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const friendRequest = user.friendRequests.id(req.params.requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const friendId = friendRequest.from;

    // Update request status
    friendRequest.status = 'accepted';

    // Add to friends list
    user.friends.push(friendId);
    await user.save();

    // Add current user to friend's list
    const friend = await User.findById(friendId);
    friend.friends.push(req.userId);
    await friend.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/reject/:requestId
// @desc    Reject friend request
// @access  Private
router.post('/reject/:requestId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const friendRequest = user.friendRequests.id(req.params.requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    friendRequest.status = 'rejected';
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/friends/:friendId
// @desc    Remove friend
// @access  Private
router.delete('/:friendId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const friend = await User.findById(req.params.friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from both users' friends lists
    user.friends = user.friends.filter(id => id.toString() !== req.params.friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends/:friendId/lists
// @desc    Get friend's public lists
// @access  Private
router.get('/:friendId/lists', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const friendId = req.params.friendId;

    // Check if they are friends
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    const List = (await import('../models/List.js')).default;
    const lists = await List.find({ userId: friendId });

    res.json(lists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
