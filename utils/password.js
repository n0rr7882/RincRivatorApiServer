const crypto = require('crypto');

module.exports = {
    getSalt: () => {
        return crypto.createHash('sha256').update(new Date().getTime().toString()).digest('base64');
    },
    getEncPw: (userPw, salt) => {
        return crypto.createHash('sha256').update(userPw + salt).digest('base64');
    },
    getTokenKey: () => {
        return "!@#$%^&*()_+RiVaToR_SeCrEtKeY+_)(*&^%$#@!";
    }
}