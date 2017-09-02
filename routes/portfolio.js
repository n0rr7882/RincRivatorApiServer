const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');

const router = express.Router();

// 포트폴리오 생성
router.post('/create', (req, res) => {
	res.statusCode = 500;
	let data = req.body, portfolioFile = (req.files && req.files.portfolioFile) ? req.files.portfolioFile : undefined, portfolioKey;
	let fileResult = fc.checkFile(portfolioFile);
	if (!fileResult.isExist) {
		res.statusCode = 404;
		res.json({
			status: { success: true, message: '포트폴리오 파일이 필요합니다.' }
		}).end();
		return;
	} else if (!fileResult.isAvailable) {
		res.statusCode = 404;
		res.json({
			status: { success: true, message: '유효하지 않은 파일 확장자 입니다.' }
		}).end();
		return;
	}
	if (ac.checkLogin(req, res) && ac.onlyTeacher(req, res)) {
		data.portfolioFile = portfolioFile.name;
		data.userId = req.user.userId;
		models.Portfolio.create(data).then(p => {
			portfolioKey = p.portfolioKey;
			return mkdirp(`./public/portfolios/${portfolioKey}`)
		}).then(r => {
			return portfolioFile.mv(`./public/portfolios/${portfolioKey}/${portfolioFile.name}`)
		}).then(() => {
			res.statusCode = 200;
			res.json({
				status: { success: true, message: `포트폴리오 업로드 성공.` }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.message }
			}).end();
		});
	}
});

// 포트폴리오 리스트 출력
router.get('/list', (req, res) => {
	res.statusCode = 500;
	let query = new Object();
	query.$and = new Array();
	if (req.query.userId) query.$and.push({ userId: req.query.userId });
	models.Portfolio.findAll({
		where: query,
		offset: Number(req.query.offset) * Number(req.query.limit),
		limit: Number(req.query.limit),
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(portfolios => {
		if (portfolios.length > 0) return portfolios;
		res.statusCode = 404;
		throw new Error('조회된 포트폴리오가 없습니다.');
	}).then(portfolios => {
		res.statusCode = 200;
		res.json({
			status: { success: true, message: `포트폴리오 리스트 조회에 성공하였습니다.` },
			portfolios: portfolios
		}).end();
	}).catch(e => {
		res.json({
			status: { success: false, message: e.message },
			portfolios: null
		}).end();
	});
});

// 포트폴리오 출력
router.get('/:portfolioKey', (req, res) => {
	res.statusCode = 500;
	models.Portfolio.findOne({
		where: { portfolioKey: req.params.portfolioKey },
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(p => {
		if (p) return p;
		res.statusCode = 404;
		throw new Error('조회된 포트폴리오가 없습니다.');
	}).then(p => {
		res.statusCode = 200;
		res.json({
			status: { success: true, message: `포트폴리오 조회에 성공하였습니다.` },
			portfolio: p
		}).end();
	}).catch(e => {
		res.json({
			status: { success: false, message: e.message },
			portfolio: nnull
		}).end();
	});
});

// 포트폴리오 수정
router.put('/:portfolioKey/update', (req, res) => {
	res.statusCode = 500;
	let query = new Object();
	query.$and = new Array();
	let data = req.body, portfolioFile = (req.files && req.files.portfolioFile) ? req.files.portfolioFile : undefined, portfolioKey;
	if (ac.checkLogin(req, res)) {
		query.$and.push({ portfolioKey: req.params.portfolioKey });
		query.$and.push({ userId: req.user.userId });
		if (portfolioFile) data.portfolioFile = portfolioFile.name;
		models.Portfolio.findOne({ where: query }).then(p => {
			if (p) return models.Portfolio.update(data, { where: query });
			res.statusCode = 404;
			throw new Error('조회된 포트폴리오가 없습니다.');
		}).then(p => {
			let fileResult = fc.checkFile(portfolioFile);
			if (fileResult.isExist) {
				if (fileResult.isAvailable) {
					return portfolioFile.mv(`./public/portfolios/${p.portfolioKey}/${portfolioFile.name}`);
				} else {
					res.statusCode = 404;
					throw new Error('유효하지 않은 파일 확장자 입니다.');
				}
			}
		}).then(() => {
			res.statusCode = 200;
			res.json({
				status: { success: true, message: `포트폴리오 업로드 성공.` }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.message }
			}).end();
		});
	}
});

// 포트폴리오 삭제
router.delete('/:portfolioKey/delete', (req, res) => {
	res.statusCode = 500;
	let query = new Object();
	query.$and = new Array();
	if (ac.checkLogin(req, res)) {
		query.$and.push({ portfolioKey: req.params.portfolioKey });
		query.$and.push({ userId: req.user.userId });
		models.Portfolio.findOne({ where: query }).then(p => {
			if (p) return models.Portfolio.destroy({ where: query });
			res.statusCode = 404;
			throw new Error('조회된 포트폴리오가 없습니다.');
		}).then(() => {
			return rimraf(`./public/portfolios/${req.params.portfolioKey}`);
		}).then(() => {
			res.statusCode = 200;
			res.json({
				status: { success: true, message: `정상적으로 처리되었습니다.` }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.message }
			}).end();
		});
	}
});

module.exports = router;
