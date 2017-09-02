const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let noticeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);