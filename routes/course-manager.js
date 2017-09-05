const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');
const cc = require('../utils/coursecheck.js');

const Code = require('../config/status');

const router = express.Router();

router.post('/:courseKey/join', (req, res) => {

	let code = Code.SERVER_ERROR;

	if (ac.checkLogin(req, res) && ac.onlyStudent(req, res)) {
		models.Course.findOne({ where: { courseKey: Number(req.params.courseKey) } }).then(c => {
			if (c) return models.CourseManager.create({
				userId: req.user.userId,
				courseKey: Number(req.params.courseKey),
				status: 0
			});
			code = Code.NOT_FOUND;
			throw new Error('존재하지 않는 강좌입니다.');
		}).then(m => {
			res.status(200).json({
				status: { success: Code.OK, message: '강좌 신청에 성공하였습니다.' }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.messege }
			}).end();
		});
	}
});

router.get('/list', (req, res) => {

	let code = Code.SERVER_ERROR;
	let query = new Object();
	query.$and = new Array();

	if (req.query.courseKey) query.$and.push({ courseKey: Number(req.query.courseKey) });
	if (req.query.userId) query.$and.push({ userId: req.query.userId });
	if (req.query.status) query.$and.push({ status: Number(req.query.status) });

	models.CourseManager.findAll({
		where: query,
		offset: Number(req.query.offset) * Number(req.query.limit),
		limit: Number(req.query.limit),
		include: [
			{ model: models.User, attributes: ['userId', 'userName'] },
			{ model: models.Course, attributes: ['courseKey', 'title'] }
		]
	}).then(courseManagers => {
		if (courseManagers.length > 0) return courseManagers;
		code = Code.NOT_FOUND;
		throw new Error('조회된 강좌 수강 상태가 없습니다.');
	}).then(courseManagers => {
		res.status(200).json({
			status: { success: Code.OK, message: '강좌 수강 상태 리스트 조회에 성공하였습니다.' },
			courseManagers: courseManagers
		}).end();
	}).catch(e => {
		res.status(200).json({
			status: { success: code, message: e.message },
			courseManagers: null
		}).end();
	});
});

router.get('/:managerKey', (req, res) => {

	let code = Code.SERVER_ERROR;

	models.CourseManager.findOne({
		where: { managerKey: req.params.managerKey },
		include: [
			{ model: models.User, attributes: ['userId', 'userName'] },
			{ model: models.Course, attributes: ['courseKey', 'title'] }
		]
	}).then(courseManager => {
		if (courseManager) return courseManager;
		code = Code.NOT_FOUND;
		throw new Error('조회된 강좌 수강 상태가 없습니다.');
	}).then(courseManager => {
		res.status(200).json({
			status: { success: Code.OK, message: '강좌 수강 상태 조회에 성공하였습니다.' },
			courseManager: courseManager
		}).end();
	}).catch(e => {
		res.status(200).json({
			status: { success: code, message: e.message },
			courseManager: null
		}).end();
	});
});

router.put('/:managerKey', (req, res) => {

	let code = Code.SERVER_ERROR;
	let bodyData = JSON.parse(req.body.data);
	let data = {}

	if (bodyData.status) data.status = Number(bodyData.status);

	if (ac.checkLogin(req, res)) {
		models.CourseManager.findOne({ where: { managerKey: req.params.managerKey } }).then(courseManager => {
			if (courseManager && (courseManager.userId === req.user.userId))
				return models.CourseManager.update(data, { where: { managerKey: req.params.managerKey } });
			code = Code.NOT_FOUND;
			throw new Error('조회된 강좌 수강 상태나 권한이 없습니다.');
		}).then(r => {
			return models.CourseManager.findOne({
				where: { managerKey: req.params.managerKey },
				include: [
					{ model: models.User, attributes: ['userId', 'userName'] },
					{ model: models.Course, attributes: ['courseKey', 'title'] }
				]
			});
		}).then(courseManager => {
			res.status(200).json({
				status: { success: Code.OK, message: '정상적으로 업데이트되었습니다.' },
				courseManager: courseManager
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message },
				courseManager: null
			}).end();
		});
	}
});

router.delete('/:managerKey', (req, res) => {

	let code = Code.SERVER_ERROR;

	if (ac.checkLogin(req, res)) {
		models.CourseManager.findOne({ where: { managerKey: req.params.managerKey } }).then(courseManager => {
			if (courseManager && (courseManager.userId === req.user.userId))
				return models.CourseManager.destroy({ where: { managerKey: req.params.managerKey } });
			code = Code.NOT_FOUND;
			throw new Error('조회된 강좌 수강 상태나 권한이 없습니다.');
		}).then(() => {
			res.status(200).json({
				status: { success: Code.OK, message: '정상적으로 삭제되었습니다.' }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

module.exports = router;