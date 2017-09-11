const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');
const cc = require('../utils/contestcheck');

const Code = require('../config/status');

const auth = require('../utils/authentication');

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
    let contestKey;
    let contestImage = (req.files && req.files.contestImage) ? req.files.contestImage : undefined;
    let imageResult = fc.checkImage(contestImage);

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
    if (ac.checkLogin(req, res) && cc.checkContest(data, res, true)) {

        data.userId = req.user.userId;
        data.dateStart = new Date(data.dateStart);
        data.dateEnd = new Date(data.dateEnd);

        models.Contest.create(data).then(contest => {
            contestKey = contest.contestKey;
        }).then(() => {
            return mkdirp(`./public/contests/${contestKey}`);
        }).then(() => {
            return contestImage.mv(`./public/contests/${contestKey}/contest-image.jpg`);
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
    query.$and = [];

    if (req.query.category) query.$and.push({ category: req.query.category });
    if (req.query.userId) query.$and.push({ userId: req.query.userId });
    if (req.query.teamName) query.$and.push({ teamName: req.query.teamName });
    if (req.query.status === 'doing') {
        query.$and.push({ dateStart: { $lt: Date.now() } });
        query.$and.push({ dateEnd: { $gt: Date.now() } });
    }
    if (req.query.status === 'before') query.$and.push({ dateStart: { $gt: Date.now() } });
    if (req.query.status === 'finished') query.$and.push({ dateEnd: { $lt: Date.now() } });
    models.Contest.findAll({
        where: query,
        offset: Number(req.query.offset) * Number(req.query.limit),
        limit: Number(req.query.limit),
        include: [{ model: models.User, attributes: ['userId', 'userName'] }],
        order: [['created_at', 'DESC']]
    }).then(contests => {
        if (contests.length > 0) return contests;
        code = Code.NOT_FOUND;
        throw new Error('조회된 콘테스트가 없습니다.');
    }).then(contests => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            contests: contests
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            contests: null
        }).end();
    });
});

router.get('/:contestKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    models.Contest.findOne({
        where: { contestKey: req.params.contestKey },
        include: [{ model: models.User, attributes: ['userId', 'userName'] }]
    }).then(contest => {
        if (contest) return contest;
        code = Code.NOT_FOUND;
        throw new Error('조회된 콘테스트가 없습니다.');
    }).then(contest => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            contest: contest
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            contest: null
        }).end();
    });
});

// 강좌 수정
router.put('/:contestKey', (req, res) => {

    let code = Code.SERVER_ERROR;
    let data = JSON.parse(req.body.data);
    let contestImage = (req.files && req.files.contestImage) ? req.files.contestImage : undefined;

    if (ac.checkLogin(req, res) && cc.checkContest(data, res, false)) {
        models.Contest.findOne({
            where: { contestKey: req.params.contestKey, userId: req.user.userId }
        }).then(contest => {
            if (contest) {
                if (data.title) contest.title = data.title;
                if (data.category) contest.category = data.category;
                if (data.dateStart) contest.dateStart = new Date(data.dateStart);
                if (data.dateEnd) contest.dateEnd = new Date(data.dateEnd);
                if (data.priseNum) contest.priseNum = data.priseNum;
                if (data.description) contest.description = data.description;
                if (data.fieldEntry) contest.fieldEntry = data.fieldEntry;
                if (data.criteria) contest.criteria = data.criteria;
                if (data.award) contest.award = data.award;
                return contest.save();
            }
            code = Code.NOT_FOUND;
            throw new Error('조회된 콘테스트가 없거나 권한이 부족합니다.');
        }).then(r => {
            let imageResult = fc.checkImage(contestImage);
            if (imageResult.isExist) {
                if (imageResult.isAvailable) {
                    return contestImage.mv(`./public/contests/${req.params.contestKey}/contest-image.jpg`);
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

router.delete('/:contestKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    if (ac.checkLogin(req, res)) {
        models.Contest.findOne({
            where: { contestKey: req.params.contestKey, userId: req.user.userId }
        }).then(contest => {
            if (contest) return contest.destroy();
            code = Code.NOT_FOUND;
            throw new Error('조회된 콘테스트가 없습니다.');
        }).then(() => {
            return rimraf(`./public/contests/${req.params.contestKey}`);
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