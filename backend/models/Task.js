const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    description: { 
        type: String, 
        required: true 
    },
    assignedTo: { 
        type: String, 
        required: true 
    },
    assignedBy: { 
        type: String, 
        required: true 
    },
    // Deadline for the task
    deadline: {
        type: Date,
        required: true,
    },
    // Timestamp for when the task was completed
    completedAt: {
        type: Date,
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
}, {
    // Enable virtuals to allow for the dynamic 'status' field
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual 'status' property
// This logic runs on the server to automatically determine the correct status.
TaskSchema.virtual('status').get(function() {
    if (this.completedAt) {
        return 'completed';
    }
    // Set the time to the end of the day for accurate comparison
    const deadlineEnd = new Date(this.deadline).setHours(23, 59, 59, 999);
    if (new Date() > deadlineEnd) {
        return 'late';
    }
    return 'pending';
});

module.exports = mongoose.model('Task', TaskSchema);

