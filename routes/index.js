const express = require('express');
const mkdir = require('mkdirp');
const fs = require('fs');
const router = express.Router();
const t = require('../utils/tools'); // 입력 검증 등에 필요한 도구
const models = require('../models');

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ title: 'Express' });
});

// 유저 등록 (회원가입)
router.post('/users', (req, res) => {
  var d = req.body, f = req.files;
  var portfolio = (req.files && req.files.portfolio) ? req.files.portfolio : undefined;
  if (t.checkAccount(d, res) && t.checkFile(f, res)) {
    d.profileUrl = f.profileImage.name;
    delete (d.rePw); delete (d.agree);
    models.User.findAll({
      where: { userId: d.userId }
    }).then((result) => {
      if (result.length === 0) {
        var encrypted = t.encryptPassword(d.userPw, null);
        d.salt = encrypted.salt;
        d.userPw = encrypted.userPw;
        mkdir(`./public/users/${d.userId}`, (err) => {
          if (!err) {
            f.profileImage.mv(`./public/users/${d.userId}/profile-image.jpg`, (err) => {
              if (!err) {
                if (d.userStatus === '2') {
                  if (portfolio) {
                    mkdir(`./public/users/${d.userId}/portfolio`, (err) => {
                      if (!err) {
                        portfolio.mv(`./public/users/${d.userId}/portfolio/${portfolio.name}`, (err) => {
                          if (!err) {
                            models.User.create(d);
                            res.status(201).json({
                              status: { success: true, message: `정상적으로 생성되었습니다.` }
                            }).end();
                            // 정상적으로 생성됨
                          } else {
                            console.error(err.stack);
                            res.status(500).json({
                              status: { success: false, message: `포트폴리오 파일 업로드에 실패하였습니다.` }
                            }).end();
                            // 포트폴리오 파일 업로드 실패
                          }
                        });
                      } else {
                        console.error(err.stack);
                        res.status(500).json({
                          status: { success: false, message: `포트폴리오 디렉토리 생성 중 에러가 발생하였습니다.` }
                        }).end();
                        // 포트폴리오 디렉토리 생성 실패
                      }
                    });
                  } else {
                    res.status(404).json({
                      status: { success: false, message: `강사는 포트폴리오 파일이 필요합니다.` }
                    }).end();
                    // 포트폴리오 파일이 존재하지 않음
                  }
                } else {
                  models.User.create(d);
                  res.status(201).json({
                    status: { success: true, message: `정상적으로 생성되었습니다.` }
                  }).end();
                  // 정상적으로 생성됨
                }
              } else {
                console.error(err.stack);
                res.status(500).json({
                  status: { success: false, message: `프로필 이미지 업로드에 실패하였습니다.` }
                }).end();
                // 이미지 업로드에 실패
              }
            });
          } else {
            console.error(err.stack);
            res.status(500).json({
              status: { success: false, message: `계정 생성에 실패하였습니다.` }
            }).end();
          }
        });
      } else {
        res.status(404).json({
          status: { success: false, message: `이미 존재하는 아이디 입니다.` }
        }).end();
      }
    }).catch((err) => {
      console.error(err.stack);
      res.status(500).json({
        status: { success: false, message: `알 수 없는 오류가 발생하였습니다.` }
      }).end();
    });
  }
});

// 유저 조회 (로그인 [단일, 패스워드 o])
router.post('/users/:userId', (req, res) => {
  models.User.findAll({
    where: {
      userId: req.params.userId
    }
  }).then((result) => {
    if (result.length === 1) {
      models.User.findAll({
        where: {
          $and: [{ userId: result[0].userId }, { userPw: t.encryptPassword(req.body.userPw, result[0].salt).userPw }]
        }
      }).then((account) => {
        if (account.length === 1) {
          res.status(200).json({
            status: { success: true, message: `조회에 성공하였습니다.` },
            user: account[0]
          }).end();
        } else {
          res.status(404).json({
            status: { success: false, message: `비밀번호가 일치하지 않습니다.` },
            user: null
          }).end();
        }
      });
    } else {
      res.status(404).json({
        status: { success: false, message: `일치하는 계정이 존재하지 않습니다.` },
        user: null
      }).end();
    }
  }).catch((err) => {
    res.status(500).json({
      status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.` },
      user: null
    }).end();
  });
});

module.exports = router;