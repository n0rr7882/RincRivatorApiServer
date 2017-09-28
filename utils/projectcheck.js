const Code = require('../config/status');

module.exports = {
    checkProject: (data, res, isStrict) => {
        let cl = [
            [data.title, `제목을 4 ~ 20글자 사이로 설정해주세요.`, /^(?=.*).{4,20}$/],
            [data.category, `카테고리 형식에 일치하지 않습니다.`, /^(?=.*).{1,20}$/],
            [data.date, `날짜 형식에 일치하지 않습니다.`, /^(?=.*)([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})$/],
            [data.teamName, `팀 이름을 20글자 이내로 설정해주세요.`, /^(?=.*).{1,20}$/],
            [data.memberNum, `팀원 인원을 99명 이내로 설정해주세요.`, /^(?=.*)[0-9]{1,2}$/],
            [data.description, `프로젝트 설명을 10 ~ 1000글자 사이로 설정해주세요.`, /^(?=.*).{1,1000}$/m],
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
    }
}