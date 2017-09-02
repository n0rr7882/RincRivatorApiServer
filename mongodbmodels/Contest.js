const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let contestSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    priseNum: { type: Number, required: true },
    description: { type: String, required: true },
    fieldEntry: { type: String, required: true },
    criteria: { type: String, required: true },
    award: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: Number, required: true, default: 0 },
    participator: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Contest', contestSchema);