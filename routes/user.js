const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');
const passport = require('passport');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');

const router = express.Router();

// 로그인
router.post('/login', (req, res) => {
  passport.authenticate('local', (e, u, i) => {
    if (e)
      res.status(500).json({
        status: { success: false, message: `계정 인증 중 알 수 없는 오류가 발생하였습니다.` },
        user: null
      }).end();
    else if (i)
      res.status(404).json({
        status: { success: false, message: i.message },
        user: null
      }).end();
    else if (u)
      req.logIn(u, e => {
        if (e) res.status(500).json({
          status: { success: false, message: e.message },
          user: null
        }).end();
        else res.status(200).json({
          status: { success: true, message: `로그인에 성공하였습니다.` },
          user: u
        }).end();
      });
  })(req, res);
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.logOut();
  res.status(200).json({
    status: { success: true, message: `정상적으로 로그아웃 되었습니다.` }
  }).end();
});

// 회원가입
router.post('/register', (req, res) => {
  res.statusCode = 500;
  let data = req.body, profileImage = (req.files && req.files.profileImage) ? req.files.profileImage : undefined;
  if (ac.checkAccount(data, res, true)) {
    models.User.findOne({ where: { userId: data.userId } }).then(u => {
      if (u) {
        res.statusCode = 404;
        throw new Error('이미 존재하는 아이디 입니다.');
      }
    }).then(() => {
      let encrypted = ac.encryptPassword(data.userPw, null);
      data.userPw = encrypted.userPw;
      data.salt = encrypted.salt;
      return models.User.create(data);
    }).then(u => {
      return mkdirp(`./public/users/${data.userId}`)
    }).then(r => {
      let imageResult = fc.checkImage(profileImage);
      if (imageResult.isExist) {
        if (imageResult.isAvailable) {
          return profileImage.mv(`./public/users/${data.userId}/profile-image.jpg`);
        } else {
          res.statusCode = 404;
          throw new Error('유효하지 않은 이미지 확장자 입니다.');
        }
      }
    }).then(() => {
      res.statusCode = 201;
      res.json({
        status: { success: true, message: `정상적으로 생성되었습니다.` }
      }).end();
    }).catch(e => {
      res.json({
        status: { success: false, message: e.message }
      }).end();
    })
  }
});

// 계정 리스트
router.get('/list', (req, res) => {
  res.statusCode = 500;
  let query = new Object();
  query.$and = new Array();
  if (req.query.subject) query.$and.push({ subject: req.query.subject });
  if (req.query.userType) query.$and.push({ userType: Number(req.query.userType) });
  models.User.findAll({
    where: query,
    offset: Number(req.query.offset) * Number(req.query.limit),
    limit: Number(req.query.limit),
    attributes: { exclude: ['userPw', 'salt'] }
  }).then(u => {
    if (u.length > 0) return u;
    res.statusCode = 404;
    throw new Error(`조회된 계정이 없습니다.`);
  }).then(u => {
    res.statusCode = 200;
    res.json({
      status: { success: true, message: `계정 리스트 조회에 성공하였습니다.` },
      users: u
    }).end();
  }).catch(e => {
    res.json({
      status: { success: false, message: e.message },
      users: null
    }).end();
  });
});

// 계정
router.get('/:userId', (req, res) => {
  res.statusCode = 500;
  models.User.findOne({
    where: { userId: req.params.userId },
    attributes: { exclude: ['userPw', 'salt'] },
  }).then(u => {
    if (u) return u;
    res.statusCode = 404;
    throw new Error(`존재하지 않는 계정입니다.`);
  }).then(u => {
    res.statusCode = 200;
    res.json({
      status: { success: true, message: `계정 조회에 성공하였습니다.` },
      user: u
    }).end();
  }).catch(e => {
    res.json({
      status: { success: false, message: e.message },
      user: null
    }).end();
  });
});

// 계정 수정
router.put('/update', (req, res) => {
  res.statusCode = 500;
  let data = {}, profileImage = (req.files && req.files.profileImage) ? req.files.profileImage : undefined, isSend = false, updatedUser;
  if (ac.checkLogin(req, res) && ac.checkAccount(req.body, res, false)) {
    if (req.body.userPw) {
      let encrypted = ac.encryptPassword(req.body.userPw, null);
      data.userPw = encrypted.userPw;
      data.salt = encrypted.salt;
    }
    if (req.body.userName) data.userName = req.body.userName;
    if (req.body.phone) data.phone = req.body.phone;
    if (req.body.localCity) data.localCity = req.body.localCity;
    if (req.body.localDistrict) data.localDistrict = req.body.localDistrict;
    if (req.body.localTown) data.localTown = req.body.localTown;
    if (req.body.subject) data.subject = req.body.subject;
    if (req.body.userType) data.userType = Number(req.body.userType);
    models.User.update(data, { where: { userId: req.user.userId } }).then(u => {
      let imageResult = fc.checkImage(profileImage);
      if (imageResult.isExist) {
        if (imageResult.isAvailable) {
          return profileImage.mv(`./public/users/${req.user.userId}/profile-image.jpg`);
        } else {
          res.statusCode = 404;
          throw new Error('유효하지 않은 이미지 확장자 입니다.');
        }
      }
    }).then(() => {
      return models.User.findOne({ where: { userId: req.user.userId } });
    }).then(u => {
      res.statusCode = 200;
      res.json({
        status: { success: true, message: `정상적으로 수정되었습니다.` },
        user: u
      }).end();
    }).catch(e => {
      res.json({
        status: { success: false, message: e.message },
        user: null
      }).end();
    });
  }
});

// 계정 삭제
router.delete('/delete', (req, res) => {
  res.statusCode = 500;
  let userId = req.user.userId;
  if (ac.checkLogin(req, res)) {
    models.User.destroy({ where: { userId: req.user.userId } }).then(() => {
      return rimraf(`./public/users/${userId}`)
    }).then(() => {
      req.logOut();
      res.statusCode = 200;
      res.json({
        status: { success: true, message: `계정이 정상적으로 삭제되었습니다.` }
      }).end();
    }).catch(e => {
      res.json({
        status: { success: false, message: e.message }
      }).end();
    });
  }
});

module.exports = router;
