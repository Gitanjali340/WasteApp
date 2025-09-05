const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/employees - Fetches all users with the role 'employee'
router.get('/employees', async (req, res) => {
    try {
        // Find all users where the role is 'employee' and only select their username field
        const employees = await User.find({ role: 'employee' }).select('username _id'); 
        
        if (!employees) {
            return res.status(404).json({ success: false, message: 'No employees found.' });
        }
        
        res.json({ success: true, employees });

    } catch (error) {
        console.error('[GET EMPLOYEES] error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
