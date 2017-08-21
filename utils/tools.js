const crypto = require('crypto');
const SqlString = require('sqlstring');
const config = require('../config/server');

module.exports = {
	checkAccount: (data, res, isStrict) => { // 계정 입력 검증
		let cl = [ // 계정 검증 체크리스트
			[data.userId, `아이디 형식에 일치하지 않습니다.`, /^(?=.*)[a-zA-Z0-9]{6,20}$/],
			[data.userPw, `비밀번호 형식에 일치하지 않습니다.`, /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/],
			[data.userName, `이름 형식에 일치하지 않습니다.`, /^(?=.*)[^\s]{1,20}$/],
			[data.phoneNumber, `전화번호를 확인해 주세요.`, /^(?=.*)[0-9]{10,11}$/],
			[data.localCity, `시를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}시$/],
			[data.localDistrict, `구를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}구$/],
			[data.localTown, `동을 확인해 주세요.`, /^(?=.*)[^\s]{1,10}동$/],
			[data.subject, `관심과목을 확인해 주세요.`, /^(?=.*).{1,20}$/],
			[data.userStatus, '계정 종류가 올바르지 않습니다.', /^(?=.*)[1-3]{1}$/]
		];
		for (let i in cl) {
			if ((cl[i][0] || isStrict) && !cl[i][2].test(cl[i][0])) { // 체크리스트 검증 정규식 검사
				res.status(404).json({
					status: { success: false, message: cl[i][1] }
				}).end(); // 걸리면 false 리턴하고 해당 메세지 json responsing
				return false;
			}
		}
		return true; // 전부 통과할 경우 true 리턴
	},
	checkImage: (imageFile, res, isStrict) => { // 파일 검증
		if (imageFile) { // 파일 존재여부
			let fileReg = `\.(`;
			for (var i in config.accessImage) { // config 파일에 정의해둔 허용파일 리스트로 검증 정규식 생성
				if (i === config.accessImage.length)
					fileReg += config.accessImage[i];
				else
					fileReg += (config.accessImage[i] + '|');
			}
			fileReg += `)`;
			let afl = new RegExp(fileReg); // 정규식 생성
			if (afl.test(imageFile.name)) { // 정규식 검사
				return true;
			} else {
				res.status(404).json({
					status: { success: false, message: `허용되지 않은 파일 확장자 입니다.` }
				}).end(); // 검사 실패시 메세지 json responsing
				return false;
			}
		} else {
			if (isStrict) {
				res.status(404).json({
					status: { success: false, message: `프로필 이미지가 존재하지 않습니다.` }
				}).end(); // 파일 존재하지 않을 시 메세지 json responsing
				return false;
			} else {
				return true;
			}
		}
	},
	isLogin: (req) => {
		if (req.session && req.session.id && req.session.isLogin) {
			return true;
		} else {
			return false;
		}
	},
	encryptPassword: (userPw, salt) => {
		if (!salt) {
			salt = crypto.createHash('sha256').update(new Date().getTime().toString()).digest('base64');
		}
		return {
			salt: salt,
			userPw: crypto.createHash('sha256').update(userPw + salt).digest('base64')
		}
	}
}