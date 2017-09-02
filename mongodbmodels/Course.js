const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let courseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: Number, required: true },
    score: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    curriculum: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);