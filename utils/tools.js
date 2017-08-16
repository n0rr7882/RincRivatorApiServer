const crypto = require('crypto');
const config = require('../config/server');

module.exports = {
    checkAccount: (data, res) => { // 계정 입력 검증
        if (data.userPw === data.rePw) {
            var cl = [ // 계정 검증 체크리스트
                [data.agree, `Rivator 약관에 동의해 주세요.`, /on/],
                [data.userId, `아이디 형식에 일치하지 않습니다.`, /^(?=.*)[a-zA-Z0-9]{6,20}$/],
                [data.userPw, `비밀번호 형식에 일치하지 않습니다.`, /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/],
                [data.userName, `이름 형식에 일치하지 않습니다.`, /^(?=.*)[^\s]{1,20}$/],
                [data.phoneNumber, `전화번호를 확인해 주세요.`, /^(?=.*)[0-9]{10,11}$/],
                [data.localCity, `시를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}시$/],
                [data.localArea, `구를 확인해 주세요.`, /^(?=.*)[^\s]{1,10}구$/],
                [data.localTown, `동을 확인해 주세요.`, /^(?=.*)[^\s]{1,10}동$/],
                [data.subject, `관심과목을 확인해 주세요.`, /^(?=.*).{1,20}$/],
                [data.userStatus, '계정 종류가 올바르지 않습니다.', /^(?=.*)[1-3]{1}$/]
            ];
            for (var i in cl) {
                if (cl[i][0] === undefined || !cl[i][2].test(cl[i][0])) { // 체크리스트 검증 정규식 검사
                    res.json({ message: cl[i][1] }); // 걸리면 false 리턴하고 해당 메세지 json responsing
                    return false;
                }
            }
            return true; // 전부 통과할 경우 true 리턴
        } else {
            res.json({ message: `비밀번호 재입력이 일치하지 않습니다.` });
            return false;
        }
    },
    checkFile: (files, res) => { // 파일 검증
        if (files && files.profileImage) { // 파일 존재여부
            var fileReg = `\.(`;
            for (var i in config.accessImage) { // config 파일에 정의해둔 허용파일 리스트로 검증 정규식 생성
                if (i === config.accessImage.length)
                    fileReg += config.accessImage[i];
                else
                    fileReg += (config.accessImage[i] + '|');
            }
            fileReg += `)`;
            var afl = new RegExp(fileReg); // 정규식 생성
            if (afl.test(files.profileImage.name)) { // 정규식 검사
                return true;
            } else {
                res.json({ message: `허용되지 않은 파일 확장자 입니다.` }); // 검사 실패시 메세지 json responsing
                return false;
            }
        } else {
            res.json({ message: `파일이 존재하지 않습니다.` }); // 파일 존재하지 않을 시 메세지 json responsing
            return false;
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