const express = require('express');
const mkdir = require('mkdirp');
const rmdir = require('rimraf');
const fs = require('fs');

const t = require('../utils/tools'); // 입력 검증 등에 필요한 도구
const models = require('../models');

const router = express.Router();

// 계정 조회 (pw o)
router.post('/l/:userId', (req, res) => {
	models.User.findAll({
		where: { userId: req.params.userId }
	}).then((r) => {
		if (r.length === 1) {
			models.User.findAll({
				where: {
					$and: [{ userId: r[0].userId }, { userPw: t.encryptPassword(req.body.userPw, r[0].salt).userPw }]
				}
			}).then((u) => {
				if (u.length === 1) {
					res.status(200).json({
						status: { success: true, message: `조회에 성공하였습니다.` },
						user: u[0]
					}).end();
				} else {
					res.status(404).json({
						status: { success: false, message: `비밀번호가 일치하지 않습니다.` },
						user: null
					}).end();
				}
			}).catch((err) => {
				res.status(500).json({
					status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.(i,p)` },
					user: null
				}).end();
			});
		} else {
			res.status(404).json({
				status: { success: false, message: `일치하는 계정이 존재하지 않습니다.` },
				user: null
			}).end();
		}
	}).catch((err) => {
		res.status(500).json({
			status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.(i)` },
			user: null
		}).end();
	});
});

// 계정 생성
router.post('/:userId', (req, res) => {
	let d = req.body, profileImage = (req.files && req.files.profileImage) ? req.files.profileImage : undefined;
	d.userId = req.params.userId;
	if (t.checkAccount(d, res, true) && t.checkImage(profileImage, res, true)) {
		models.User.findAll({
			where: { userId: d.userId }
		}).then((r) => {
			if (r.length === 0) {
				let enc = t.encryptPassword(d.userPw, null);
				d.salt = enc.salt;
				d.userPw = enc.userPw;
				mkdir(`./public/users/${d.userId}`, (err) => {
					if (!err) {
						profileImage.mv(`./public/users/${d.userId}/profile-image.jpg`, (err) => {
							if (!err) {
								models.User.create(d).then((r) => {
									res.status(201).json({
										status: { success: true, message: `계정 "${d.userId}"가 정상적으로 생성되었습니다.` }
									}).end();
								}).catch((err) => {
									console.error(err.stack);
									res.status(201).json({
										status: { success: false, message: `계정 생성중 알 수 없는 오류가 발생하였습니다.` }
									}).end();
								});
							} else {
								console.error(err.stack);
								res.status(404).json({
									status: { success: false, message: `프로필 이미지 저장 중 알 수 없는 오류가 발생하였습니다.` }
								}).end();
							}
						});
					} else {
						console.error(err.stack);
						res.status(500).json({
							status: { success: false, message: `계정 디렉토리 생성 중 알 수 없는 오류가 발생하였습니다.` }
						}).end();
					}
				});
			} else {
				res.status(404).json({
					status: { success: false, message: `아이디 "${d.userId}는 이미 존재하는 계정 입니다."` }
				}).end();
			}
		}).catch((err) => {
			console.error(err.stack);
			res.status(500).json({
				status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.` }
			}).end();
		});
	}
});

// 계정 리스트 조회
router.get('/list', (req, res) => {
	let queryWhere = {};
	let limit = Number(req.query.limit);
	let offset = Number(req.query.offset);
	delete (req.query.limit);
	delete (req.query.offset);
	for (let elem in req.query) {
		queryWhere[elem] = req.query[elem];
	}
	models.User.findAll({
		attributes: { exclude: ['userPw', 'salt'] },
		where: queryWhere,
		limit: limit,
		offset: offset
	}).then((u) => {
		res.status(200).json({
			status: { success: true, message: `계정 조회에 성공하였습니다.` },
			users: u
		}).end();
	}).catch((err) => {
		console.error(err.stack);
		res.status(500).json({
			status: { success: false, message: `계정 조회 중 알 수 없는 에러가 발행하였습니다.` },
			users: null
		}).end();
	});
});

// 계정 조회 (pw x)
router.get('/:userId', (req, res) => {
	models.User.findAll({
		attributes: { exclude: ['userPw', 'salt'] },
		where: { userId: req.params.userId }
	}).then((u) => {
		if (u.length === 1) {
			res.status(200).json({
				status: { success: true, message: `조회에 성공하였습니다.` },
				user: u[0]
			}).end();
		} else {
			res.status(404).json({
				status: { success: false, message: `해당 아이디를 가진 계정이 존재하지 않습니다.` },
				user: null
			}).end();
		}
	}).catch((err) => {
		console.error(err.stack);
		res.status(500).json({
			status: { success: false, message: `계정 조회 중 알 수 없는 에러가 발행하였습니다.` },
			user: null
		}).end();
	});
});

// 계정 수정
router.put('/:userId', (req, res) => {
	let d = req.body, profileImage = (req.files && req.files.profileImage) ? req.files.profileImage : undefined;
	d.userId = req.params.userId;
	if (t.checkAccount(d, res, false) && t.checkImage(profileImage, res, false)) {
		models.User.findAll({
			where: { userId: req.params.userId }
		}).then((r) => {
			if (r.length === 1) {
				let enc = t.encryptPassword(d.userPw, null);
				d.salt = enc.salt;
				d.userPw = enc.userPw;
				models.User.update(d, {
					where: {
						$and: [{ userId: req.params.userId }, { userPw: t.encryptPassword(d.oldUserPw, r[0].salt).userPw }]
					}
				}).then((u) => {
					if (u[0] === 1) {
						if (profileImage) {
							profileImage.mv(`./public/users/${d.userId}/profile-image.jpg`, (err) => {
								if (!err) {
									res.status(200).json({
										status: { success: true, message: `계정 "${d.userId}"가 정상적으로 수정되었습니다.` },
									}).end();
								} else {
									console.error(err.stack);
									res.status(500).json({
										status: { success: false, message: `프로필 이미지 저장 중 알 수 없는 오류가 발생하였습니다.` },
									}).end();
								}
							});
						} else {
							res.status(200).json({
								status: { success: true, message: `계정 "${d.userId}"가 정상적으로 수정되었습니다.` },
							}).end();
						}
					} else {
						res.status(404).json({
							status: { success: false, message: `계정을 수정하지 못하였습니다. 계정 비밀번호를 확인해주세요.` },
						}).end();
					}
				}).catch((err) => {
					console.error(err.stack);
					res.status(500).json({
						status: { success: false, message: `계정 수정 중 알 수 없는 오류가 발생하였습니다.` },
					}).end();
				});
			} else {
				res.status(404).json({
					status: { success: false, message: `해당 아이디를 가진 계정이 존재하지 않습니다.` },
				}).end();
			}
		}).catch((err) => {
			console.error(err.stack);
			res.status(500).json({
				status: { success: false, message: `계정 조회 중 알 수 없는 오류가 발생하였습니다.` },
			}).end();
		});
	}
});

//계정 삭제
router.delete('/:userId', (req, res) => {
	models.User.findAll({
		where: { userId: req.params.userId }
	}).then((u) => {
		if (u.length === 1) {
			models.User.destroy({
				where: {
					$and: [{ userId: u[0].userId }, { userPw: t.encryptPassword(req.body.userPw, u[0].salt).userPw }]
				}
			}).then((r) => {
				if (r) {
					rmdir(`./public/users/${req.params.userId}`, (err) => {
						if (!err) {
							res.status(200).json({
								status: { success: true, message: `정상적으로 삭제되었습니다.` }
							}).end();
						} else {
							console.error(err.stack);
							res.status(500).json({
								status: { success: false, message: `계정 디렉토리 삭제 중 알 수 없는 오류가 발생하였습니다.` }
							}).end();
						}
					});
				} else {
					res.status(404).json({
						status: { success: false, message: `패스워드가 일치하지 않습니다.` }
					}).end();
				}
			}).catch((err) => {
				console.error(err.stack);
				res.status(500).json({
					status: { success: false, message: `계정 삭제 중 알 수 없는 에러가 발생하였습니다.` }
				}).end();
			});
		} else {
			res.status(404).json({
				status: { success: false, message: `존재하지 않는 계정입니다.` }
			}).end();
		}
	}).catch((err) => {
		console.error(err.stack);
		res.status(500).json({
			status: { success: false, message: `해당 아이디로 계정 조회 중 알 수 없는 에러가 발생하였습니다.` }
		}).end();
	});
});

module.exports = router;