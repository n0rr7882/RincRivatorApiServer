const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let projectSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    teamName: { type: String, required: true },
    category: { type: String, required: true },
    memberNum: { type: Number, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);