const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let contestManagerSchema = new Schema({
    contest: { type: Schema.Types.ObjectId, required: true, ref: 'Contest' },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    status: { type: Number, required: true, default: 1 },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('ContestManager', contestManagerSchema);