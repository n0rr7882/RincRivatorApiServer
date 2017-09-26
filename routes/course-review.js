const express = require('express');

const models = require('../models');

const ac = require('../utils/accountcheck');

const Code = require('../config/status');

const router = express.Router();

router.post('/:courseKey', (req, res) => {

    if (!req.body.data) {
        res.status(200).json({
            status: { success: Code.BAD_REQUEST, message: '잘못된 요청입니다.' }
        }).end();
        return;
    }

    let code = Code.SERVER_ERROR;
    let data = JSON.parse(req.body.data);
    let coursesTeacher = {};
    let applicationCourse = {};
    let teachersCourses = [];
    let coursesReviews = [];

    if (ac.checkLogin(req, res) && ac.onlyStudent(req, res)) {
        data.userId = req.user.userId;
        data.courseKey = Number(req.params.courseKey);
        models.Course.findOne({ where: { courseKey: Number(req.params.courseKey) } }).then(course => {
            if (course) {
                applicationCourse = course;
                return models.CourseReview.create(data);
            }
            code = Code.NOT_FOUND;
            throw new Error('존재하지 않는 강좌입니다.');
        }).then(r => {
            return models.User.findOne({ where: { userId: applicationCourse.userId } });
        }).then(teacher => {
            coursesTeacher = teacher;
            return models.CourseReview.findAll({ where: { courseKey: req.params.courseKey } });
        }).then(reviews => {
            let totalScore = 0;
            for (let i in reviews) totalScore += reviews[i].score;
            applicationCourse.score = totalScore / reviews.length;
            return applicationCourse.save();
        }).then(r => {
            return models.Course.findAll({ where: { userId: applicationCourse.userId } });
        }).then(courses => {
            let totalScore = 0;
            for (let i in courses) totalScore += courses[i].score;
            coursesTeacher.score = totalScore / courses.length;
            return coursesTeacher.save();
        }).then(r => {
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
    query.$and = [];

    if (req.query.courseKey) query.$and.push({ courseKey: Number(req.query.courseKey) });
    if (req.query.userId) query.$and.push({ userId: req.query.userId });

    models.CourseReview.findAll({
        where: query,
        offset: Number(req.query.offset) * Number(req.query.limit),
        limit: Number(req.query.limit),
        include: [
            { model: models.User, attributes: ['userId', 'userName'] },
            { model: models.Course, attributes: ['courseKey', 'title', 'category'] }
        ],
        order: [['created_at', 'DESC']]
    }).then(courseReviews => {
        if (courseReviews.length > 0) return courseReviews;
        code = Code.NOT_FOUND;
        throw new Error('조회된 리뷰가 없습니다.');
    }).then(courseReviews => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            courseReviews: courseReviews
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            courseReviews: null
        }).end();
    });
});

router.get('/:reviewKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    models.CourseReview.findOne({
        where: { reviewKey: req.params.reviewKey },
        include: [
            { model: models.User, attributes: ['userId', 'userName'] },
            { model: models.Course, attributes: ['courseKey', 'title', 'category'] }
        ]
    }).then(courseReview => {
        if (courseReview) return courseReview;
        code = Code.NOT_FOUND;
        throw new Error('조회된 리뷰가 없습니다.');
    }).then(courseReview => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            courseReview: courseReview
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            courseReview: null
        }).end();
    });
});

router.put('/:reviewKey', (req, res) => {

    let code = Code.SERVER_ERROR;
    let bodyData = JSON.parse(req.body.data);
    let data = {};

    if (bodyData.content) data.content = bodyData.content;

    if (ac.checkLogin(req, res)) {
        models.CourseReview.findOne({ where: { reviewKey: req.params.reviewKey } }).then(courseReview => {
            if (courseReview && (courseReview.userId === req.user.userId))
                return models.CourseReview.update(data, { where: { reviewKey: req.params.reviewKey } });
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

router.delete('/:reviewKey', (req, res) => {

    let code = Code.SERVER_ERROR;
    let delCourseReview = {};

    if (ac.checkLogin(req, res)) {
        models.CourseReview.findOne({ where: { reviewKey: req.params.reviewKey } }).then(courseReview => {
            if (courseReview && (courseReview.userId === req.user.userId)) {
                delCourseReview = courseReview;
                return courseReview.destroy();
            }
            code = Code.NOT_FOUND;
            throw new Error('조회된 리뷰나 권한이 없습니다.');
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
