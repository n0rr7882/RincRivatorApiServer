const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let courseReviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    course: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
    score: { type: Number, required: true, default: 5 },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('CourseReview', courseReviewSchema);
