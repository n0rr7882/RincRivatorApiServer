const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');
const cc = require('../utils/coursecheck.js');

const router = express.Router();

router.post('/create', (req, res) => {
	res.statusCode = 500;
	let data = req.body, courseImage = (req.files && req.files.courseImage) ? req.files.courseImage : undefined, courseKey;
	let imageResult = fc.checkImage(courseImage);
	if (!imageResult.isExist) {
		res.statusCode = 404;
		res.json({
			status: { success: true, message: '배너 이미지 파일이 필요합니다.' }
		}).end();
		return;
	} else if (!imageResult.isAvailable) {
		res.statusCode = 404;
		res.json({
			status: { success: true, message: '유효하지 않은 이미지 확장자 입니다.' }
		}).end();
		return;
	}
	if (ac.checkLogin(req, res) && ac.onlyTeacher(req, res) && cc.checkCourse(data, res, true)) {
		data.isOpen = true;
		data.userId = req.user.userId;
		data.score = 0;
		models.Course.create(data).then(c => {
			courseKey = c.courseKey;
		}).then(() => {
			return mkdirp(`./public/courses/${courseKey}`);
		}).then(() => {
			return courseImage.mv(`./public/courses/${courseKey}/course-image.jpg`);
		}).then(() => {
			res.statusCode = 201;
			res.json({
				status: { success: true, message: '정상적으로 생성되었습니다.' }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.message }
			}).end();
		});
	}
});

router.get('/list', (req, res) => {
	res.statusCode = 500;
	let query = new Object();
	query.$and = new Array();
	if (req.query.category) query.$and.push({ category: req.query.category });
	if (req.query.userId) query.$and.push({ userId: req.query.userId });
	if (req.query.isOpen === 'true') query.$and.push({ isOpen: true });
	if (req.query.isOpen === 'false') query.$and.push({ isOpen: false });
	models.Course.findAll({
		where: query,
		offset: Number(req.query.offset) * Number(req.query.limit),
		limit: Number(req.query.limit),
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(courses => {
		if (courses.length > 0) return courses;
		res.statusCode = 404;
		throw new Error('조회된 강좌가 없습니다.');
	}).then(courses => {
		res.statusCode = 200;
		res.json({
			status: { success: true, message: '강좌 리스트 조회에 성공하였습니다.' },
			courses: courses
		}).end();
	}).catch(e => {
		res.json({
			status: { success: false, message: e.message },
			courses: null
		}).end();
	});
});

router.get('/:courseKey', (req, res) => {
	res.statusCode = 500;
	models.Course.findOne({
		where: { courseKey: Number(req.params.courseKey) },
		include: [{ model: models.User, attributes: ['userId', 'userName'] }]
	}).then(c => {
		if (c) return c;
		res.statusCode = 404;
		throw new Error('조회된 강좌가 없습니다.');
	}).then(c => {
		res.statusCode = 200;
		res.json({
			status: { success: true, message: '강좌 조회에 성공하였습니다.' },
			course: c
		}).end();
	}).catch(e => {
		res.json({
			status: { success: false, message: e.message },
			course: null
		}).end();
	});
});

// 강좌 수정
router.put('/:courseKey/update', (req, res) => {
	let data = {}, courseImage = (req.files && req.files.courseImage) ? req.files.courseImage : undefined, courseKey;
	if (ac.checkLogin(req, res) && ac.onlyTeacher(req, res)) {
		res.statusCode = 500;
		models.Course.findOne({
			where: { courseKey: Number(req.params.courseKey), userId: req.user.userId }
		}).then(c => {
			if (req.body.title) data.title = req.body.title;
			if (req.body.category) data.category = req.body.category;
			if (req.body.unit) data.unit = req.body.unit;
			if (req.body.price) data.price = req.body.price;
			if (req.body.curriculum) data.curriculum = req.body.curriculum;
			if (req.body.isOpen === 'true') data.isOpen = true;
			if (req.body.isOpen === 'false') data.isOpen = false;
			if (c) return models.Course.update(data, { where: { courseKey: Number(req.params.courseKey) } });
			res.statusCode = 404;
			throw new Error('조회된 강좌가 없습니다.');
		}).then(c => {
			let imageResult = fc.checkImage(courseImage);
			if (imageResult.isExist) {
				if (imageResult.isAvailable) {
					return courseImage.mv(`./public/courses/${c.courseKey}/course-image.jpg`);
				} else {
					res.statusCode = 404;
					throw new Error('유효하지 않은 이미지 확장자 입니다.');
				}
			}
		}).then(() => {
			res.statusCode = 200;
			res.json({
				status: { success: true, message: '강좌 수정에 성공하였습니다.' }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.message }
			}).end();
		});
	}
});

router.delete('/:courseKey/delete', (req, res) => {
	if (ac.checkLogin(req, res)) {
		models.Course.findOne({
			where: { courseKey: Number(req.params.courseKey), userId: req.user.userId }
		}).then(c => {
			if (c) return models.Course.destroy({ courseKey: Number(req.params.courseKey) });
			else {
				res.statusCode = 404;
				throw new Error('조회된 강좌가 없습니다.');
			}
		}).then(() => {
			return rimraf(`./public/courses/${req.params.courseKey}`);
		}).then(() => {
			res.statusCode = 200;
			res.json({
				status: { success: true, message: '강좌가 정상적으로 삭제되었습니다.' }
			}).end();
		}).catch(e => {
			res.json({
				status: { success: false, message: e.message }
			}).end();
		});
	}
});

module.exports = router;