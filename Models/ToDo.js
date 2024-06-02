const mongoose = require('mongoose');

const ToDoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    byClass: [
        {
            classId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class',
                required: true
            },
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
            ]
        }
    ]
});

module.exports = mongoose.model('ToDo', ToDoSchema);
