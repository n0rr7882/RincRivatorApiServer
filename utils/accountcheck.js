const crypto = require('crypto');
const config = require('../config/server');
const pwEnc = require('./password.js');
const Code = require('../config/status');

module.exports = {
	checkAccount: (data, res, isStrict) => { // 계정 입력 검증
		let cl = [ // 계정 검증 체크리스트
			[data.userId, `아이디를 6 ~ 20글자 이내의 대소문자, 숫자로 맞춰주세요.`, /^(?=.*)[a-zA-Z0-9]{6,20}$/],
			[data.userPw, `비밀번호는 6 ~ 20글자이며 대소문자, 숫자, 특수기호가 포함되어야 합니다.`, /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/],
			[data.userName, `20글자 이내의 이름을 사용해 주세요.`, /^(?=.*)[^\s]{1,20}$/],
			[data.phone, `전화번호를 확인해 주세요.`, /^(?=.*)[0-9]{9,11}$/],
			[data.localCity, `시를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}$/],
			[data.localDistrict, `구를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}$/],
			[data.localTown, `동을 확인해 주세요.`, /^(?=.*)[^\s]{1,10}$/],
			[data.subject, `관심과목을 확인해 주세요.`, /^(?=.*).{1,20}$/],
			[data.userType, '계정 타입이 올바르지 않습니다.', /^(student|teacher)$/]
		];
		for (let i in cl) {
			if ((cl[i][0] || isStrict) && !cl[i][2].test(cl[i][0])) { // 체크리스트 검증 정규식 검사
				res.status(200).json({
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
		if (req.user) {
			return true;
		} else {
			res.status(200).json({
				status: { success: Code.BAD_REQUEST, message: `로그인이 필요한 서비스입니다.` }
			}).end();
			return false;
		}
	},
	onlyTeacher: (req, res) => {
		if (req.user.userType === 'teacher') return true;
		else res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: `강사 회원만 이용할 수 있는 서비스입니다.` }
		}).end();
	},
	onlyStudent: (req, res) => {
		if (req.user.userType === 'student') return true;
		else res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: `학생 회원만 이용할 수 있는 서비스입니다.` }
		}).end();
	},
	onlyAdmin: (req, res) => {
		if (req.user.userType === 'admin') return true;
		else res.status(200).json({
			status: { success: Code.BAD_REQUEST, message: `권한이 부족합니다.` }
		}).end();
	},
}