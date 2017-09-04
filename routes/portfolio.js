const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');

const Code = require('../config/status');

const router = express.Router();

// 포트폴리오 생성
router.post('/create', (req, res) => {
	let code = Code.SERVER_ERROR;
	let data = req.body;
	let portfolioKey;
	let portfolioFile = (req.files && req.files.portfolioFile) ? req.files.portfolioFile : undefined;
	let fileResult = fc.checkFile(portfolioFile);
	if (!fileResult.isExist) {
		res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: '포트폴리오 파일이 필요합니다.' }
		}).end();
		return;
	} else if (!fileResult.isAvailable) {
		res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: '유효하지 않은 파일 확장자 입니다.' }
		}).end();
		return;
	}
	if (ac.checkLogin(req, res) && ac.onlyTeacher(req, res)) {
		data.portfolioFile = portfolioFile.name;
		data.userId = req.user.userId;
		models.Portfolio.create(data).then(portfolio => {
			portfolioKey = portfolio.portfolioKey;
			return mkdirp(`./public/portfolios/${portfolioKey}`)
		}).then(r => {
			return portfolioFile.mv(`./public/portfolios/${portfolioKey}/${portfolioFile.name}`)
		}).then(() => {
			res.status(200).json({
				status: { success: Code.OK, message: `포트폴리오 업로드 성공.` }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

// 포트폴리오 리스트 출력
router.get('/list', (req, res) => {
	let code = Code.SERVER_ERROR;
	let query = new Object();
	if (req.query.userId) query.userId = req.query.userId;
	models.Portfolio.findAll({
		where: query,
		offset: Number(req.query.offset) * Number(req.query.limit),
		limit: Number(req.query.limit),
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(portfolios => {
		if (portfolios.length > 0) return portfolios;
		code = Code.NOT_FOUND;
		throw new Error('조회된 포트폴리오가 없습니다.');
	}).then(portfolios => {
		res.status(200).json({
			status: { success: Code.OK, message: `포트폴리오 리스트 조회에 성공하였습니다.` },
			portfolios: portfolios
		}).end();
	}).catch(e => {
		res.status(200).json({
			status: { success: code, message: e.message },
			portfolios: null
		}).end();
	});
});

// 포트폴리오 출력
router.get('/:portfolioKey', (req, res) => {
	let code = Code.SERVER_ERROR;
	models.Portfolio.findOne({
		where: { portfolioKey: req.params.portfolioKey },
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(portfolio => {
		if (portfolio) return portfolio;
		code = Code.NOT_FOUND;
		throw new Error('조회된 포트폴리오가 없습니다.');
	}).then(portfolio => {
		res.json({
			status: { success: Code.OK, message: `포트폴리오 조회에 성공하였습니다.` },
			portfolio: portfolio
		}).end();
	}).catch(e => {
		res.json({
			status: { success: code, message: e.message },
			portfolio: null
		}).end();
	});
});

// 포트폴리오 수정
router.put('/:portfolioKey/update', (req, res) => {
	let code = Code.SERVER_ERROR;
	let portfolioKey;
	let data = JSON.parse(req.body);
	let portfolioFile = (req.files && req.files.portfolioFile) ? req.files.portfolioFile : undefined;
	if (ac.checkLogin(req, res)) {
		if (portfolioFile) data.portfolioFile = portfolioFile.name;
		models.Portfolio.findOne({
			where: { portfolioKey: req.params.portfolioKey, userId: req.user.userId }
		}).then(portfolio => {
			if (portfolio) {
				if (data.title) portfolio.title = data.title;
				if (data.description) portfolio.description = data.description;
				if (portfolioFile) portfolio.portfolioFile = portfolioFile.name;
				return portfolio.save();
			}
			code = Code.NOT_FOUND;
			throw new Error('조회된 포트폴리오가 없습니다.');
		}).then(r => {
			let fileResult = fc.checkFile(portfolioFile);
			if (fileResult.isExist) {
				if (fileResult.isAvailable) {
					return portfolioFile.mv(`./public/portfolios/${req.params.portfolioKey}/${portfolioFile.name}`);
				} else {
					code = Code.BAD_REQUEST;
					throw new Error('유효하지 않은 파일 확장자 입니다.');
				}
			}
		}).then(() => {
			res.status(200).json({
				status: { success: Code.OK, message: `정상적으로 업데이트되었습니다.` }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

// 포트폴리오 삭제
router.delete('/:portfolioKey/delete', (req, res) => {
	let code = Code.SERVER_ERROR;
	if (ac.checkLogin(req, res)) {
		models.Portfolio.findOne({
			where: { portfolioKey: req.params.portfolioKey, userId: req.user.userId }
		}).then(portfolio => {
			if (portfolio) return portfolio.destroy();
			code = Code.NOT_FOUND;
			throw new Error('조회된 포트폴리오가 없거나 권한이 부족합니다.');
		}).then(() => {
			return rimraf(`./public/portfolios/${req.params.portfolioKey}`);
		}).then(() => {
			res.status(200).json({
				status: { success: Code.OK, message: `정상적으로 처리되었습니다.` }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

module.exports = router;
