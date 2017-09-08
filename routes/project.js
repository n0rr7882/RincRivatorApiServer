const express = require('express');
const mkdirp = require('mkdirp-promise');
const rimraf = require('rimraf-promise');
const _ = require('lodash');

const models = require('../models');

const ac = require('../utils/accountcheck');
const fc = require('../utils/filecheck');
const pc = require('../utils/projectcheck');

const Code = require('../config/status');

const router = express.Router();

router.post('/', (req, res) => {

    if (!req.body.data) {
        res.status(200).json({
            status: {success: Code.BAD_REQUEST, message: '잘못된 요청입니다.'}
        });
        return;
    }

    let code = Code.SERVER_ERROR;
    let data = JSON.parse(req.body.data);
    let projectKey;
    let projectImage = (req.files && req.files.projectImage) ? req.files.projectImage : undefined;
    let imageResult = fc.checkImage(projectImage);

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
    if (ac.checkLogin(req, res) && pc.checkProject(data, res, true)) {

        data.userId = req.user.userId;
        data.date = new Date(data.date);

        models.Project.create(data).then(project => {
            projectKey = project.projectKey;
        }).then(() => {
            return mkdirp(`./public/projects/${projectKey}`);
        }).then(() => {
            return projectImage.mv(`./public/projects/${projectKey}/project-image.jpg`);
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
    if (req.query.date === 'gt') query.$and.push({ date: { $gt: Date.now() }});
    if (req.query.date === 'lt') query.$and.push({ date: { $lt: Date.now() }});

    models.Project.findAll({
        where: query,
        offset: Number(req.query.offset) * Number(req.query.limit),
        limit: Number(req.query.limit),
        include: [{ model: models.User, attributes: ['userId', 'userName'] }]
    }).then(projects => {
        if (projects.length > 0) return projects;
        code = Code.NOT_FOUND;
        throw new Error('조회된 프로젝트가 없습니다.');
    }).then(projects => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            projects: projects
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            projects: null
        }).end();
    });
});

router.get('/:projectKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    models.Project.findOne({
        where: { projectKey: req.params.projectKey },
        include: [{ model: models.User, attributes: ['userId', 'userName'] }]
    }).then(project => {
        if (project) return project;
        code = Code.NOT_FOUND;
        throw new Error('조회된 프로젝트가 없습니다.');
    }).then(project => {
        res.status(200).json({
            status: { success: Code.OK, message: '조회에 성공하였습니다.' },
            project: project
        }).end();
    }).catch(e => {
        res.status(200).json({
            status: { success: code, message: e.message },
            project: null
        }).end();
    });
});

// 강좌 수정
router.put('/:projectKey', (req, res) => {

    let code = Code.SERVER_ERROR;
    let data = JSON.parse(req.body.data);
    let projectImage = (req.files && req.files.projectImage) ? req.files.projectImage : undefined;

    if (ac.checkLogin(req, res) && pc.checkProject(data, res, false)) {
        models.Project.findOne({
            where: { projectKey: req.params.projectKey, userId: req.user.userId }
        }).then(project => {
            if (project) {
                if (data.title) project.title = data.title;
                if (data.category) project.category = data.category;
                if (data.date) project.date = new Date(data.date);
                if (data.teamName) project.teamName = data.teamName;
                if (data.memberNum) project.memberNum = data.memberNum;
                if (data.description) project.description = data.description;
                return project.save();
            }
            code = Code.NOT_FOUND;
            throw new Error('조회된 프로젝트가 없거나 권한이 부족합니다.');
        }).then(r => {
            let imageResult = fc.checkImage(projectImage);
            if (imageResult.isExist) {
                if (imageResult.isAvailable) {
                    return projectImage.mv(`./public/projects/${req.params.projectKey}/project-image.jpg`);
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

router.delete('/:projectKey', (req, res) => {

    let code = Code.SERVER_ERROR;

    if (ac.checkLogin(req, res)) {
        models.Project.findOne({
            where: { projectKey: req.params.projectKey, userId: req.user.userId }
        }).then(project => {
            if (project) return project.destroy();
            code = Code.NOT_FOUND;
            throw new Error('조회된 프로젝트가 없습니다.');
        }).then(() => {
            return rimraf(`./public/projects/${req.params.projectKey}`);
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