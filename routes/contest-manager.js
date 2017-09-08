const express = require('express');

const models = require('../models');

const ac = require('../utils/accountcheck');

const Code = require('../config/status');

const router = express.Router();

router.post('/:contestKey', (req, res) => {

    if (!req.body.data) {
        res.status(200).json({
            status: {success: Code.BAD_REQUEST, message: '잘못된 요청입니다.'}
        });
        return;
    }

    let code = Code.SERVER_ERROR;
    let data = JSON.parse(req.body.data);

    if (ac.checkLogin(req, res)) {
        models.Project.findOne({ where: { projectKey: Number(req.params.projectKey) } }).then(project => {
            if (project) return models.ProjectManager.create({
                userId: req.user.userId,
                projectKey: Number(req.params.projectKey),
                teamPart: data.teamPart
            });
            code = Code.NOT_FOUND;
            throw new Error('존재하지 않는 프로젝트입니다.');
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

    if (req.query.projectKey) query.$and.push({ projectKey: Number(req.query.projectKey) });
    if (req.query.userId) query.$and.push({ userId: req.query.userId });
    if (req.query.teamPart) query.$and.push({ teamPart: req.query.teamPart });

    models.ProjectManager.findAll({
        where: query,
        offset: Number(req.query.offset) * Number(req.query.limit),
        limit: Number(req.query.limit),
        include: [
            { model: models.User, attributes: ['userId', 'userName'] },
            { model: models.Project, attributes: ['projectKey', 'title'] }
        ]
    }).then(projectManagers => {
        if (projectManagers.length > 0) return projectManagers;
        code = Code.NOT_FOUND;
        throw new Error('조회된 프로젝트 참여 상태가 없습니다.');
    }).then(projectManagers => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            projectManagers: projectManagers
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            projectManagers: null
        }).end();
    });
});

router.get('/:managerKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    models.ProjectManager.findOne({
        where: { managerKey: req.params.managerKey },
        include: [
            { model: models.User, attributes: ['userId', 'userName'] },
            { model: models.Project, attributes: ['projectKey', 'title'] }
        ]
    }).then(projectManager => {
        if (projectManager) return projectManager;
        code = Code.NOT_FOUND;
        throw new Error('조회된 프로젝트 참여 상태가 없습니다.');
    }).then(projectManager => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            projectManager: projectManager
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            projectManager: null
        }).end();
    });
});

router.put('/:managerKey', (req, res) => {

    let code = Code.SERVER_ERROR;
    let bodyData = JSON.parse(req.body.data);
    let data = {};

    if (bodyData.teamPart) data.teamPart = bodyData.teamPart;

    if (ac.checkLogin(req, res)) {
        models.ProjectManager.findOne({ where: { managerKey: req.params.managerKey } }).then(projectManager => {
            if (projectManager && (projectManager.userId === req.user.userId))
                return models.ProjectManager.update(data, { where: { managerKey: req.params.managerKey } });
            code = Code.NOT_FOUND;
            throw new Error('조회된 프로젝트 참여 상태나 권한이 없습니다.');
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

    if (ac.checkLogin(req, res)) {
        models.ProjectManager.findOne({ where: { managerKey: req.params.managerKey } }).then(projectManager => {
            if (projectManager && (projectManager.userId === req.user.userId))
                return projectManager.destroy();
            code = Code.NOT_FOUND;
            throw new Error('조회된 강좌 수강 상태나 권한이 없습니다.');
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