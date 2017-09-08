const express = require('express');

const passport = require('passport');

const Code = require('../config/status');

const router = express.Router();

// 로그인
router.post('/login', (req, res) => {

    passport.authenticate('local', (e, user, info) => {
        if (e)
            res.status(200).json({
                status: { success: Code.SERVER_ERROR, message: e.message },
                user: null
            }).end();
        else if (info)
            res.status(200).json({
                status: { success: Code.BAD_REQUEST, message: info.message },
                user: null
            }).end();
        else if (user)
            req.logIn(user, e => {
                if (e) res.status(200).json({
                    status: { success: Code.SERVER_ERROR, message: e.message },
                    user: null
                }).end();
                else res.status(200).json({
                    status: { success: Code.OK, message: `성공적으로 로그인되었습니다.` },
                    user: user
                }).end();
            });
    })(req, res);
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.logOut();
    res.status(200).json({
        status: { success: Code.OK, message: `성공적으로 로그아웃되었습니다.` }
    }).end();
});

module.exports = router;