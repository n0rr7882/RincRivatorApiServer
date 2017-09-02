const config = require('../config/server');

module.exports = {
	checkImage: (imageFile) => { // 파일 검증
		let result = { isExist: true, isAvailable: true };
		if (imageFile) {
			if (!(RegExp(config.accessImage).test(imageFile.name))) result.isAvailable = false;
		} else {
			result.isExist = false;
			result.isAvailable = false;
		}
		return result;
	},
	checkFile: (file) => {
		let result = { isExist: true, isAvailable: true };
		if (file) {
			if (!(RegExp(config.accessFile).test(file.name))) result.isAvailable = false;
		} else {
			result.isExist = false;
			result.isAvailable = false;
		}
		return result;
	}
}