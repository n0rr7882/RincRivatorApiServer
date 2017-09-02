const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    userPw: { type: String, required: true },
    salt: { type: String, required: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    localCity: { type: String, required: true },
    localDistrict: { type: String, required: true },
    localTown: { type: String, required: true },
    subject: { type: String, required: true },
    userType: { type: Number, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);