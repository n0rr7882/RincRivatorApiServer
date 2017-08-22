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
	if (t.checkFile(portfolioFile, res, true)) {
		models.User.findAll({
			where: { userId: req.params.userId }
		}).then((r) => {
			if (r.length === 1) {
				models.User.findAll({
					where: {
						$and: [{ userId: req.params.userId }, { userPw: t.encryptPassword(d.userPw, r[0].salt).userPw }]
					}
				}).then((u) => {
					if (u.length === 1) {
						models.Portfolio.findAll({
							where: { userId: req.params.userId }
						}).then((p) => {
							if (p.length === 0) {
								mkdir(`./public/portfolios/${req.params.userId}`, (e) => {
									if (!e) {
										portfolioFile.mv(`./public/portfolios/${req.params.userId}/${portfolioFile.name}`, (e) => {
											if (!e) {
												d.userId = req.params.userId;
												d.portfolioFile = portfolioFile.name;
												models.Portfolio.create(d).then((r) => {
													res.status(201).json({
														status: { success: false, message: `"${req.params.userId}"의 포트폴리오가 성공적으로 생성되었습니다.` }
													}).end();
												}).catch((e) => {
													console.error(e.stack);
													res.status(500).json({
														status: { success: false, message: `포트폴리오 생성 중 알 수 없는 오류가 발생하였습니다.` }
													}).end();
												});
											} else {
												console.error(e.stack);
												res.status(500).json({
													status: { success: false, message: `포트폴리오 파일 업로드 중 알 수 없는 오류가 발생하였습니다.` }
												}).end();
											}
										});
									} else {
										console.error(e.stack);
										res.status(500).json({
											status: { success: false, message: `포트폴리오 디렉토리 생성 중 알 수 없는 오류가 발생하였습니다.` }
										}).end();
									}
								});
							} else {
								res.status(404).json({
									status: { success: false, message: `"${req.params.userId}"계정으로 만들어진 포트폴리오가 이미 존재합니다.` }
								}).end();
							}
						}).catch((e) => {
							console.error(e.stack);
							res.status(500).json({
								status: { success: false, message: `포트폴리오 조회 중 알 수 없는 오류가 발생하였습니다.` }
							}).end();
						});
					} else {
						res.status(404).json({
							status: { success: false, message: `패스워드가 일치하지 않습니다.` }
						}).end();
					}
				}).catch((e) => {
					console.error(e.stack);
					res.status(500).json({
						status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.(i,p)` }
					}).end();
				});
			} else {
				res.status(404).json({
					status: { success: false, message: `존재하지 않는 계정입니다.` }
				}).end();
			}
		}).catch((e) => {
			console.error(e.stack);
			res.status(500).json({
				status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.(i)` }
			}).end();
		});
	}
});

// 포트폴리오 리스트 조회
router.get('/list', (req, res) => {
	models.Portfolio.findAll({
		limit: Number(req.query.limit),
		offset: Number(req.query.offset),
		include: {
			model: models.User,
			attribute: ['userId', 'userName']
		}
	}).then((p) => {
		console.log(p);
		res.status(200).json({
			status: { success: true, message: `호우` },
			portfolio: p
		}).end();
	}).catch((e) => {
		console.error(e.stack);
		res.status(500).json({
			status: { success: false, message: `포트폴리오 조회 중 알 수 없는 오류가 발생하였습니다.` }
		}).end();
	});
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