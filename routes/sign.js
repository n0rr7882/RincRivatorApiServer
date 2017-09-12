const express = require('express');
const jwt = require('jsonwebtoken');
const password = require('../utils/password');
const models = require('../models/index');
const Code = require('../config/status');
const ac = require('../utils/accountcheck');

const router = express.Router();

// 로그인
router.post('/login', (req, res) => {
    let code = Code.SERVER_ERROR;
    models.User.findOne({
        where: { userId: req.body.userId }
    }).then(user => {
        if (!user) {
            code = Code.NOT_FOUND;
            throw new Error('존재하지 않는 아이디입니다.');
        }
        if (ac.encryptPassword(req.body.userPw, user.salt).userPw !== user.userPw) {
            code = Code.NOT_FOUND;
            throw new Error('암호가 일치하지 않습니다.');
        }
        let payload = { userId: user.userId };
        let token = jwt.sign(payload, password.getTokenKey(), { algorithm: 'HS256' });

        res.status(200).json({
            status: { success: Code.OK, message: `로그인에 성공하였습니다.` },
            user: user,
            token: token
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            user: null,
            token: null
        }).end();
    });
});

module.exports = router;