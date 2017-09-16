const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');
const _ = require('lodash');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');
const cc = require('../utils/coursecheck.js');

const Code = require('../config/status');

const router = express.Router();

router.post('/', (req, res) => {

	if (!req.body.data) {
		res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: '잘못된 요청입니다.' }
		});
		return;
	}

	let code = Code.SERVER_ERROR;
	let data = JSON.parse(req.body.data);
	let courseKey;
	let courseImage = (req.files && req.files.courseImage) ? req.files.courseImage : undefined;
	let imageResult = fc.checkImage(courseImage);

	if (!imageResult.isExist) {
		res.status(200).json({
			status: { success: Code.NOT_FOUND, message: '배너 이미지가 필요합니다.' }
		}).end();
		return;
	} else if (!imageResult.isAvailable) {
		res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: '유효하지 않은 이미지 확장자 입니다.' }
		}).end();
		return;
	}
	if (ac.checkLogin(req, res) && ac.onlyTeacher(req, res) && cc.checkCourse(data, res, true)) {

		data.isOpen = true;
		data.userId = req.user.userId;
		data.score = 0;
		data.numOfStudent = 0;
		data.numOfReviews = 0;

		models.Course.create(data).then(course => {
			courseKey = course.courseKey;
		}).then(() => {
			return mkdirp(`${__dirname}/../public/courses/${courseKey}`);
		}).then(() => {
			return courseImage.mv(`${__dirname}/../public/courses/${courseKey}/course-image.jpg`);
		}).then(() => {
			res.status(200).json({
				status: { success: Code.OK, message: '성공적으로 생성되었습니다.' }
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
	let order = [];
	query.$and = [];

	if (req.query.category) query.$and.push({ category: req.query.category });
	if (req.query.userId) query.$and.push({ userId: req.query.userId });
	if (req.query.isOpen === 'true') query.$and.push({ isOpen: true });
	if (req.query.isOpen === 'false') query.$and.push({ isOpen: false });
	if (req.query.sortBy === "score") order.push(['score', 'DESC']);
	if (req.query.sortBy === "numOfStudents") order.push(['numOfStudents', 'DESC']);
	order.push(['created_at', 'DESC']);

	models.Course.findAll({
		where: query,
		offset: Number(req.query.offset) * Number(req.query.limit),
		limit: Number(req.query.limit),
		include: [{ model: models.User, attributes: ['userId', 'userName'] }],
		order: order
	}).then(courses => {
		if (courses.length > 0) return courses;
		code = Code.NOT_FOUND;
		throw new Error('조회된 강좌가 없습니다.');
	}).then(courses => {
		res.status(200).json({
			status: { success: Code.OK, message: '조회에 성공하였습니다.' },
			courses: courses
		}).end();
	}).catch(e => {
		res.status(200).json({
			status: { success: code, message: e.message },
			courses: null
		}).end();
	});
});

router.get('/:courseKey', (req, res) => {

	let code = Code.SERVER_ERROR;

	models.Course.findOne({
		where: { courseKey: req.params.courseKey },
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(course => {
		if (course) return course;
		code = Code.NOT_FOUND;
		throw new Error('조회된 강좌가 없습니다.');
	}).then(course => {
		res.status(200).json({
			status: { success: Code.OK, message: '조회에 성공하였습니다.' },
			course: course
		}).end();
	}).catch(e => {
		res.status(200).json({
			status: { success: code, message: e.message },
			course: null
		}).end();
	});
});

// 강좌 수정
router.put('/:courseKey', (req, res) => {

	let code = Code.SERVER_ERROR;
	let data = JSON.parse(req.body.data);
	let courseImage = (req.files && req.files.courseImage) ? req.files.courseImage : undefined;

	if (ac.checkLogin(req, res) && cc.checkCourse(data, res, false)) {
		models.Course.findOne({
			where: { courseKey: req.params.courseKey, userId: req.user.userId }
		}).then(course => {
			if (course) {
				if (data.title) course.title = data.title;
				if (data.category) course.category = data.category;
				if (data.unit) course.unit = data.unit;
				if (data.price) course.price = data.price;
				if (data.curriculum) course.curriculum = data.curriculum;
				if (_.isBoolean(data.isOpen)) course.isOpen = data.isOpen;
				return course.save();
			}
			code = Code.NOT_FOUND;
			throw new Error('조회된 강좌가 없거나 권한이 부족합니다.');
		}).then(r => {
			let imageResult = fc.checkImage(courseImage);
			if (imageResult.isExist) {
				if (imageResult.isAvailable) {
					return courseImage.mv(`${__dirname}/../public/courses/${req.params.courseKey}/course-image.jpg`);
				} else {
					code = Code.BAD_REQUEST;
					throw new Error('유효하지 않은 이미지 확장자 입니다.');
				}
			}
		}).then(() => {
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

router.delete('/:courseKey', (req, res) => {

	let code = Code.SERVER_ERROR;

	if (ac.checkLogin(req, res)) {
		models.Course.findOne({
			where: { courseKey: req.params.courseKey, userId: req.user.userId }
		}).then(course => {
			if (course) return course.destroy();
			else {
				code = Code.NOT_FOUND;
				throw new Error('조회된 강좌가 없습니다.');
			}
		}).then(() => {
			return rimraf(`${__dirname}/../public/courses/${req.params.courseKey}`);
		}).then(() => {
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