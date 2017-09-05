const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');
const passport = require('passport');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');

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
          status: { success: Code.OK, message: `로그인에 성공하였습니다.` },
          user: user
        }).end();
      });
  })(req, res);
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.logOut();
  res.status(200).json({
    status: { success: Code.OK, message: `정상적으로 로그아웃 되었습니다.` }
  }).end();
});

// 회원가입
router.post('/register', (req, res) => {
  let code = Code.SERVER_ERROR;
  let data = JSON.parse(req.body.data);
  let profileImage = (req.files && req.files.profileImage) ? req.files.profileImage : undefined;

  if (ac.checkAccount(data, res, true)) {

    models.User.findOne({ where: { userId: data.userId } }).then(user => {
      if (user) {
        code = Code.BAD_REQUEST;
        throw new Error('이미 존재하는 아이디 입니다.');
      }
      let encrypted = ac.encryptPassword(data.userPw, null);
      data.userPw = encrypted.userPw;
      data.salt = encrypted.salt;
      return models.User.create(data);
    }).then(user => {
      return mkdirp(`./public/users/${data.userId}`)
    }).then(r => {
      let imageResult = fc.checkImage(profileImage);
      if (imageResult.isExist) {
        if (imageResult.isAvailable) {
          return profileImage.mv(`./public/users/${data.userId}/profile-image.jpg`);
        } else {
          code = Code.BAD_REQUEST;
          throw new Error('유효하지 않은 이미지 확장자 입니다.');
        }
      }
    }).then(() => {
      res.status(200).json({
        status: { success: Code.OK, message: `정상적으로 생성되었습니다.` }
      }).end();
    }).catch(e => {
      res.status(200).json({
        status: { success: code, message: e.message }
      }).end();
    })
  }
});

// 계정 리스트
router.get('/list', (req, res) => {
  let code = Code.SERVER_ERROR;
  let query = new Object();
  query.$and = new Array();

  if (req.query.subject) query.$and.push({ subject: req.query.subject });
  if (req.query.userType) query.$and.push({ userType: req.query.userType });

  models.User.findAll({
    where: query,
    offset: Number(req.query.offset) * Number(req.query.limit),
    limit: Number(req.query.limit),
    attributes: { exclude: ['userPw', 'salt'] }
  }).then(users => {
    if (users.length > 0) return users;
    let code = Code.NOT_FOUND;
    throw new Error(`조회된 계정이 없습니다.`);
  }).then(users => {
    res.status(200).json({
      status: { success: Code.OK, message: `계정 리스트 조회에 성공하였습니다.` },
      users: users
    }).end();
  }).catch(e => {
    res.status(200).json({
      status: { success: code, message: e.message },
      users: null
    }).end();
  });
});

// 계정
router.get('/:userId', (req, res) => {
  let code = Code.SERVER_ERROR;

  models.User.findOne({
    where: { userId: req.params.userId },
    attributes: { exclude: ['userPw', 'salt'] },
  }).then(user => {
    if (user) return user;
    code = Code.NOT_FOUND;
    throw new Error(`존재하지 않는 계정입니다.`);
  }).then(user => {
    res.status(200).json({
      status: { success: Code.OK, message: `계정 조회에 성공하였습니다.` },
      user: user
    }).end();
  }).catch(e => {
    res.status(200).json({
      status: { success: code, message: e.message },
      user: null
    }).end();
  });
});

// 계정 수정
router.put('/update', (req, res) => {
  let code = Code.SERVER_ERROR;
  let bodyData = JSON.parse(req.body.data);
  let data = {};
  let updatedUser;
  let profileImage = (req.files && req.files.profileImage) ? req.files.profileImage : undefined;

  if (ac.checkLogin(req, res) && ac.checkAccount(bodyData, res, false)) {

    if (bodyData.userPw) {
      let encrypted = ac.encryptPassword(bodyData.userPw, null);
      data.userPw = encrypted.userPw;
      data.salt = encrypted.salt;
    }
    if (bodyData.userName) data.userName = bodyData.userName;
    if (bodyData.phone) data.phone = bodyData.phone;
    if (bodyData.localCity) data.localCity = bodyData.localCity;
    if (bodyData.localDistrict) data.localDistrict = bodyData.localDistrict;
    if (bodyData.localTown) data.localTown = bodyData.localTown;
    if (bodyData.subject) data.subject = bodyData.subject;
    if (bodyData.userType) data.userType = bodyData.userType;

    models.User.update(data, { where: { userId: req.user.userId } }).then(r => {
      let imageResult = fc.checkImage(profileImage);
      if (imageResult.isExist) {
        if (imageResult.isAvailable) {
          return profileImage.mv(`./public/users/${bodyData.userId}/profile-image.jpg`);
        } else {
          code = Code.BAD_REQUEST;
          throw new Error('유효하지 않은 이미지 확장자 입니다.');
        }
      }
    }).then(() => {
      return models.User.findOne({ where: { userId: req.user.userId } });
    }).then(user => {
      res.status(200).json({
        status: { success: Code.OK, message: `정상적으로 업데이트되었습니다.` },
        user: user
      }).end();
    }).catch(e => {
      res.status(200).json({
        status: { success: code, message: e.message },
        user: null
      }).end();
    });
  }
});

// 계정 삭제
router.delete('/delete', (req, res) => {

  let code = Code.SERVER_ERROR;

  if (ac.checkLogin(req, res)) {
    let userId = req.user.userId;
    models.User.destroy({ where: { userId: req.user.userId } }).then(() => {
      return rimraf(`./public/users/${userId}`)
    }).then(() => {
      req.logOut();
      res.status(200).json({
        status: { success: Code.OK, message: `계정이 정상적으로 삭제되었습니다.` }
      }).end();
    }).catch(e => {
      res.status(200).json({
        status: { success: code, message: e.message }
      }).end();
    });
  }
});

module.exports = router;
