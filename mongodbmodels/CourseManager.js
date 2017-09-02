const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let courseManagerSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    course: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
    status: { type: Number, required: true, default: 0, enum: [-1, 0, 1] },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('CourseManager', courseManagerSchema);
