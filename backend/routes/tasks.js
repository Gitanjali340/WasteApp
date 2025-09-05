const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// POST /api/tasks/assign - Assign a new task to an employee
router.post('/assign', async (req, res) => {
    const { description, assignedTo, assignedBy, deadline } = req.body;

    if (!description || !assignedTo || !assignedBy || !deadline) {
        return res.status(400).json({ success: false, message: 'All fields, including deadline, are required.' });
    }

    try {
        const newTask = new Task({ description, assignedTo, assignedBy, deadline });
        await newTask.save();
        res.status(201).json({ success: true, message: 'Task assigned successfully.', task: newTask });
    } catch (error) {
        console.error('[ASSIGN TASK] error:', error);
        res.status(500).json({ success: false, message: 'Server error while assigning task.' });
    }
});

// GET /api/tasks/:username - Get all tasks for a specific employee
router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const tasks = await Task.find({ assignedTo: username }).sort({ createdAt: -1 }); 
        res.json({ success: true, tasks });
    } catch (error) {
        console.error('[GET TASKS] error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching tasks.' });
    }
});

// PATCH /api/tasks/:id/complete - Mark a task as done
router.patch('/:id/complete', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }
        
        task.completedAt = new Date();
        await task.save();

        res.json({ success: true, message: 'Task marked as completed.', task });
    } catch (error) {
        console.error('[COMPLETE TASK] error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating task.' });
    }
});

// ✨ NEW: PUT /api/tasks/:id - Update a task's details
router.put('/:id', async (req, res) => {
    try {
        const { description, deadline } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        // Update the fields if they are provided in the request
        if (description) task.description = description;
        if (deadline) task.deadline = deadline;
        
        const updatedTask = await task.save();
        res.json({ success: true, message: 'Task updated successfully.', task: updatedTask });

    } catch (error) {
        console.error('[UPDATE TASK] error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating task.' });
    }
});

// ✨ NEW: DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        await task.deleteOne(); // Use deleteOne() on the document
        res.json({ success: true, message: 'Task deleted successfully.' });

    } catch (error) {
        console.error('[DELETE TASK] error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting task.' });
    }
});


module.exports = router;

