const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');
const cc = require('../utils/coursecheck.js');

const router = express.Router();

router.post('/:courseKey/join', (req, res) => {
	res.statusCode = 500;
	if (ac.checkLogin(req, res) && ac.onlyStudent(req, res)) {
		models.Course.findOne({ where: { courseKey: Number(req.params.courseKey) } }).then(c => {
			if (c) return models.CourseManager.create({
				userId: req.user.userId,
				courseKey: Number(req.params.courseKey),
				status: Number(req.body.status)
			});
			else {
				res.statusCode = 404;
				throw new Error('존재하지 않는 강좌입니다.');
			}
		}).then(m => {
			res.statusCode = 200;
			res.json({
				status: { success: true, message: '강좌 신청에 성공하였습니다.' }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.messege }
			}).end();
		});
	}
});

router.get('/list', (req, res) => {
	res.statusCode = 500;
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
		else {
			res.statusCode = 404;
			throw new Error('조회된 강좌 수강 상태가 없습니다.');
		}
	}).then(courseManagers => {
		res.statusCode = 200;
		res.json({
			status: { success: true, message: '강좌 수강 상태 조회에 성공하였습니다.' }
		}).end();
	}).catch(e => {
		res.json({
			status: { success: false, message: e.message }
		}).end();
	});
});

router.get('/:managerKey', (req, res) => {

});

router.put('/:managerKey', (req, res) => {

});

router.delete('/:managerKey', (req, res) => {

});

module.exports = router;