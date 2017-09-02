const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let portfolioSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    portfolioFile: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);