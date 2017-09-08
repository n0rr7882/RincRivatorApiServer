const express = require('express');

const models = require('../models');

const ac = require('../utils/accountcheck');

const Code = require('../config/status');

const router = express.Router();

router.post('/:contestKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    if (ac.checkLogin(req, res)) {
        models.Contest.findOne({ where: { contestKey: Number(req.params.contestKey) } }).then(contest => {
            if (contest) return models.ContestManager.create({
                userId: req.user.userId,
                contestKey: Number(req.params.contestKey)
            });
            code = Code.NOT_FOUND;
            throw new Error('존재하지 않는 콘테스트입니다.');
        }).then(m => {
            res.status(200).json({
                status: { success: Code.OK, message: '성공적으로 참여되었습니다.' }
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

    if (req.query.contestKey) query.$and.push({ contestKey: Number(req.query.contestKey) });
    if (req.query.userId) query.$and.push({ userId: req.query.userId });

    models.ContestManager.findAll({
        where: query,
        offset: Number(req.query.offset) * Number(req.query.limit),
        limit: Number(req.query.limit),
        include: [
            { model: models.User, attributes: ['userId', 'userName'] },
            { model: models.Contest, attributes: ['contestKey', 'title'] }
        ]
    }).then(contestManagers => {
        if (contestManagers.length > 0) return contestManagers;
        code = Code.NOT_FOUND;
        throw new Error('조회된 콘테스트 참여 상태가 없습니다.');
    }).then(contestManagers => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            contestManagers: contestManagers
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            contestManagers: null
        }).end();
    });
});

router.get('/:managerKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    models.ContestManager.findOne({
        where: { managerKey: req.params.managerKey },
        include: [
            { model: models.User, attributes: ['userId', 'userName'] },
            { model: models.Contest, attributes: ['contestKey', 'title'] }
        ]
    }).then(contestManager => {
        if (contestManager) return contestManager;
        code = Code.NOT_FOUND;
        throw new Error('조회된 콘테스트 참여 상태가 없습니다.');
    }).then(contestManager => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            contestManager: contestManager
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            contestManager: null
        }).end();
    });
});

router.delete('/:managerKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    if (ac.checkLogin(req, res)) {
        models.ContestManager.findOne({ where: { managerKey: req.params.managerKey } }).then(contestManager => {
            if (contestManager && (contestManager.userId === req.user.userId))
                return contestManager.destroy();
            code = Code.NOT_FOUND;
            throw new Error('조회된 콘테스트 참여 상태나 권한이 없습니다.');
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