const express = require('express');

const models = require('../models');

const ac = require('../utils/accountcheck');

const Code = require('../config/status');

const router = express.Router();

router.post('/:courseKey', (req, res) => {

	let code = Code.SERVER_ERROR;
	let applicationCourse = {};

	if (ac.checkLogin(req, res) && ac.onlyStudent(req, res)) {
		models.Course.findOne({
			where: { courseKey: Number(req.params.courseKey) }
		}).then(course => {
			if (course) {
				applicationCourse = course;
				return models.CourseManager.findOne({
					where: { courseKey: req.params.courseKey, userId: req.user.userId }
				});
			}
			code = Code.NOT_FOUND;
			throw new Error('존재하지 않는 강좌입니다.');
		}).then(manager => {
			if (!manager) return models.CourseManager.create({
				userId: req.user.userId,
				courseKey: Number(req.params.courseKey),
				status: 0
			});
			code = Code.NOT_FOUND;
			throw new Error('이미 신청한 강좌입니다.');
		}).then(manager => {
			applicationCourse.numOfStudents += 1;
			return applicationCourse.save();
		}).then(result => {
			res.status(200).json({
				status: { success: Code.OK, message: '성공적으로 신청되었습니다.' }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

router.get('/', (req, res) => {

	let code = Code.SERVER_ERROR;
	let query = {};
	query.$and = [];

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
		],
		order: [['created_at', 'DESC']]
	}).then(courseManagers => {
		if (courseManagers.length > 0) return courseManagers;
		code = Code.NOT_FOUND;
		throw new Error('조회된 강좌 수강 상태가 없습니다.');
	}).then(courseManagers => {
		res.status(200).json({
			status: { success: Code.OK, message: '조회에 성공하였습니다.' },
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
			status: { success: Code.OK, message: '조회에 성공하였습니다.' },
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
	let data = {};

	if (bodyData.status) data.status = Number(bodyData.status);

	if (ac.checkLogin(req, res)) {
		models.CourseManager.findOne({ where: { managerKey: req.params.managerKey } }).then(courseManager => {
			if (courseManager && (courseManager.userId === req.user.userId))
				return models.CourseManager.update(data, { where: { managerKey: req.params.managerKey } });
			code = Code.NOT_FOUND;
			throw new Error('조회된 강좌 수강 상태나 권한이 없습니다.');
		}).then(r => {
			res.status(200).json({
				status: { success: Code.OK, message: '성공적으로 업데이트되었습니다.' }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

router.delete('/:managerKey', (req, res) => {

	let code = Code.SERVER_ERROR;
	let courseKey;

	if (ac.checkLogin(req, res)) {
		models.CourseManager.findOne({ where: { managerKey: req.params.managerKey } }).then(courseManager => {
			if (courseManager && (courseManager.userId === req.user.userId)) {
				courseKey = courseManager.courseKey;
				return models.CourseManager.destroy({ where: { managerKey: req.params.managerKey } });
			}
			code = Code.NOT_FOUND;
			throw new Error('조회된 강좌 수강 상태나 권한이 없습니다.');
		}).then(() => {
			return models.Course.findOne({ where: { courseKey: courseKey } });
		}).then(course => {
			course.numOfStudents -= 1;
			return course.save();
		}).then(result => {
			res.status(200).json({
				status: { success: Code.OK, message: '성공적으로 삭제되었습니다.' }
			}).end();
		}).catch(e => {
			res.status(200).json({
				status: { success: code, message: e.message }
			}).end();
		});
	}
});

module.exports = router;