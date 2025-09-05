const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const User    = require('../models/User'); // Ensure this path is correct for your project structure

// POST /api/auth/register
// Sets a default role of 'society-member' for every new user.
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ✨ FIX: New users are always registered with the default role of 'society-member'.
    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'society-member', 
    });

    const savedUser = await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully', user: savedUser });
  } catch (err) {
    console.error('[REGISTER] error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
// ✨ UPDATED to strictly check for username AND role
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body; // Role is now received from the app

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Username, password, and role are required.' });
  }

  try {
    // ✨ FIX: Find a user that matches BOTH username and the role sent from the app.
    const user = await User.findOne({ username, role });

    if (!user) {
      // This generic message is more secure. 
      // It doesn't reveal if the username exists but with a different role.
      return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
    }

    // This part for login history can be kept if you are using it.
    if (!user.LoginHistory) {
      user.LoginHistory = [];
    }
    user.LoginHistory.push(new Date());
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        username: user.username,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('[LOGIN] error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// PUT /api/auth/profile/:username
// This route remains the same, only allowing username changes.
router.put('/profile/:username', async (req, res) => {
    const { username } = req.params;
    const { newUsername } = req.body;
  
    try {
      const userToUpdate = await User.findOne({ username });
  
      if (!userToUpdate) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      if (newUsername) userToUpdate.username = newUsername;
  
      const updatedUser = await userToUpdate.save();
      res.json({ success: true, message: 'Profile updated', user: updatedUser });
    } catch (error) {
      console.error('[UPDATE PROFILE] error:', error);
      res.status(500).json({ success: false, message: 'Server error during profile update' });
    }
});

// POST /api/auth/logout
router.post('/logout', (_, res) => {
    console.log('🔒 [LOGOUT]');
    res.json({ success: true, message: 'User logged out' });
});


module.exports = router;

