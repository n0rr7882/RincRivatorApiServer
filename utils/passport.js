const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const models = require('../models');
const ac = require('./accountcheck');

module.exports = () => {
	passport.serializeUser((u, done) => { // Strategy 성공 시 호출됨
		// done(null, u._id); // 여기의 user._id가 req.session.passport.user에 저장
		done(null, u.userId); // 여기의 user._id가 req.session.passport.user에 저장
	});
	passport.deserializeUser((userId, done) => { // 매개변수 id는 req.session.passport.user에 저장된 값
		// User.findById(id, (e, u) => {
		// 	done(null, u); // 여기의 user가 req.user가 됨
		// });
		models.User.findOne({ where: { userId: userId } }).then(u => done(null, u));
	});

	passport.use(new LocalStrategy({ // local 전략을 세움
		usernameField: 'userId',
		passwordField: 'userPw',
		session: true, // 세션에 저장 여부
		passReqToCallback: false,
	}, (userId, userPw, done) => {
		models.User.findOne({ where: { userId: userId } }).then(u => {
			if (!u) return done(null, false, { message: '존재하지 않는 아이디입니다.' });
			if (u.userPw === ac.encryptPassword(userPw, u.salt).userPw) return done(null, u);
			else return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
		}).catch(e => {
			return done(e);
		});
		// User.findOne({ userId: userId }, {}, (e, u) => {
		// 	if (e) return done(e); // 서버 에러 처리
		// 	if (!u) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
		// 	if (u.userPw === ac.encryptPassword(userPw, u.salt).userPw) return done(null, u);
		// 	else return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
		// }).select('userId userPw salt');
	}));
};