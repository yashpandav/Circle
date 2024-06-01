const mongoose = require('mongoose');

const ToDoSchema = new mongoose.Schema({
    assigned: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
        }
    ],
    missing: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
        }
    ],
    completed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
        }
    ],
});

module.exports = mongoose.model('ToDo', ToDoSchema);