const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let noticeManagerSchema = new Schema({
    notice: { type: Schema.Types.ObjectId, required: true, ref: 'Notice' },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    isRead: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('NoticeManager', noticeManagerSchema);