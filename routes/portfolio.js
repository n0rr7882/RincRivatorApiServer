const express = require('express');
const mkdir = require('mkdirp');
const rmdir = require('rimraf');
const fs = require('fs');

const t = require('../utils/tools'); // 입력 검증 등에 필요한 도구
const models = require('../models');

const router = express.Router();

// 포트폴리오 등록
router.post('/:userId', (req, res) => {
	let d = req.body, portfolioFile = (req.files && req.files.portfolioFile) ? req.files.portfolioFile : undefined;
	models.User.findAll({
		where: { userId: req.params.userId }
	}).then((r) => {
		models.User.findAll({
			where: {
				$and: [{ userId: r[0].userId }, { userPw: t.encryptPassword(d.userPw, r[0].salt).userPw }]
			}
		}).then((u) => {
			if (u.length === 1) {

			} else {

			}
		}).catch((err) => {

		});
	}).catch((err) => {

	});
});

// 포트폴리오 리스트 조회
router.get('/list', (req, res) => {

});

// 포트폴리오 조회
router.get('/:userId', (req, res) => {

});

// 포트폴리오 수정
router.put('/:userId', (req, res) => {

});

// 포트폴리오 삭제
router.delete('/:userId', (req, res) => {

});

module.exports = router;