var express = require('express');
var mkdir = require('mkdirp');
var fs = require('fs');
var router = express.Router();
var t = require('../utils/tools'); // 입력 검증 등에 필요한 도구
const models = require('../models');

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ title: 'Express' });
});

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
        models.User.create(d);
        mkdir(`./public/users/${d.userId}`, (err) => {
          if (!err) {
            f.profileImage.mv(`./public/users/${d.userId}/profile-image.jpg`, (err) => {
              if (!err) {
                if (d.userStatus === '2') {
                  if (portfolio) {
                    mkdir(`./public/users/${d.userId}/portfolio`, (err) => {
                      if (!err) {
                        portfolio.mv(`./public/user/${d.userId}/portfolio/${portfolio.name}`, (err) => {
                          if (!err) {
                            res.status(201).json({ success: true, text: `정상적으로 생성되었습니다.` }).end();
                            // 정상적으로 생성됨
                          } else {
                            console.error(err.stack);
                            res.status(500).json({ success: false, text: `포트폴리오 파일 업로드에 실패하였습니다.` }).end();
                            // 포트폴리오 파일 업로드 실패
                          }
                        });
                      } else {
                        console.error(err.stack);
                        res.status(500).json({ success: false, text: `포트폴리오 디렉토리 생성 중 에러가 발생하였습니다.` }).end();
                        // 포트폴리오 디렉토리 생성 실패
                      }
                    });
                  } else {
                    res.status(404).json({ success: false, text: `포트폴리오 파일이 존재하지 않습니다.` }).end();
                    // 포트폴리오 파일이 존재하지 않음
                  }
                } else {
                  res.status(201).json({ success: true, text: `정상적으로 생성되었습니다.` }).end();
                  // 정상적으로 생성됨
                }
              } else {
                console.error(err.stack);
                res.status(500).json({ success: false, text: `프로필 이미지 업로드에 실패하였습니다.` }).end();
                // 이미지 업로드에 실패
              }
            });
          } else {
            console.error(err.stack);
            res.status(500).json({ success: false, text: `계정 생성에 실패하였습니다.` }).end();
          }
        });
      } else {
        res.status(404).json({ success: false, text: `이미 존재하는 아이디 입니다.` }).end();
      }
    }).catch((err) => {
      console.error(err.stack);
      res.status(500).json({ success: false, text: `알 수 없는 오류가 발생하였습니다.` }).end();
    });
  }
});

module.exports = router;