const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let projectManagerSchema = new Schema({
    project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    part: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('ProjectManager', projectManagerSchema);