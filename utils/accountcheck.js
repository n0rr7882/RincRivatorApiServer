const crypto = require('crypto');
const config = require('../config/server');
const pwEnc = require('./password.js');
const Code = require('../config/status');

module.exports = {
	checkAccount: (data, res, isStrict) => { // 계정 입력 검증
		let cl = [ // 계정 검증 체크리스트
			[data.userId, `아이디 형식에 일치하지 않습니다.`, /^(?=.*)[a-zA-Z0-9]{6,20}$/],
			[data.userPw, `비밀번호 형식에 일치하지 않습니다.`, /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/],
			[data.userName, `이름 형식에 일치하지 않습니다.`, /^(?=.*)[^\s]{1,20}$/],
			[data.phone, `전화번호를 확인해 주세요.`, /^(?=.*)[0-9]{10,11}$/],
			[data.localCity, `시를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}시$/],
			[data.localDistrict, `구를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}구$/],
			[data.localTown, `동을 확인해 주세요.`, /^(?=.*)[^\s]{1,10}동$/],
			[data.subject, `관심과목을 확인해 주세요.`, /^(?=.*).{1,20}$/],
			[data.userType, '계정 종류가 올바르지 않습니다.', /^(?=.*)[1-3]{1}$/]
		];
		for (let i in cl) {
			if ((cl[i][0] || isStrict) && !cl[i][2].test(cl[i][0])) { // 체크리스트 검증 정규식 검사
				res.status(400).json({
					status: { success: Code.BAD_REQUEST, message: cl[i][1] }
				}).end(); // 걸리면 false 리턴하고 해당 메세지 json responsing
				return false;
			}
		}
		return true; // 전부 통과할 경우 true 리턴
	},
	encryptPassword: (userPw, salt) => {
		if (!salt) salt = pwEnc.getSalt();
		return {
			salt: salt,
			userPw: pwEnc.getEncPw(userPw, salt)
		}
	},
	checkLogin: (req, res) => {
		if (req.isAuthenticated()) {
			return true;
		} else {
			res.status(200).json({
				status: { success: Code.BAD_REQUEST, message: `로그인이 필요한 서비스입니다.` }
			}).end();
			return false;
		}
	},
	onlyTeacher: (req, res) => {
		if (req.user.userType === 3) return true;
		else res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: `강사 회원만 이용할 수 있는 서비스입니다.` }
		}).end();
	},
	onlyStudent: (req, res) => {
		if (req.user.userType === 2) return true;
		else res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: `학생 회원만 이용할 수 있는 서비스입니다.` }
		}).end();
	},
	onlyAdmin: (req, res) => {
		if (req.user.userType === 1) return true;
		else res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: `권한이 부족합니다.` }
		}).end();
	},
}