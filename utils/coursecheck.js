module.exports = {
	checkCourse: (data, res, isStrict) => {
		let cl = [
			[data.title, `제목 형식에 일치하지 않습니다.`, /^(?=.*).{5,50}$/],
			[data.category, `카테고리 형식에 일치하지 않습니다.`, /^(?=.*).{1,20}$/],
			[data.unit, `단위시간 형식에 일치하지 않습니다.`, /^(?=.*)[0-9]{1,5}$/],
			[data.price, `가격 형식에 일치하지 않습니다.`, /^(?=.*)[0-9]{1,6}$/],
			[data.curriculum, `커리큘럼 형식에 일치하지 않습니다.`, /^(?=.*).{50,1000}$/],
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
	}
}