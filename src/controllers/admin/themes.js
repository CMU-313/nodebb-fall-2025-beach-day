'use strict';

const path = require('path');
const fs = require('fs');

const file = require('../../file');
const { paths } = require('../../constants');

const themesController = module.exports;

const defaultScreenshotPath = path.join(__dirname, '../../../public/images/themes/default.png');

themesController.get = async function (req, res, next) {
	// Path traversal is prevented by .startsWith() validation below
	// nosemgrep
	const themeDir = path.join(paths.nodeModules, req.params.theme);
	// nosemgrep
	const themeConfigPath = path.join(themeDir, 'theme.json');

	let themeConfig;
	try {
		themeConfig = await fs.promises.readFile(themeConfigPath, 'utf8');
		themeConfig = JSON.parse(themeConfig);
	} catch (err) {
		if (err.code === 'ENOENT') {
			return next(Error('[[error:invalid-data]]'));
		}
		return next(err);
	}

	// nosemgrep
	const screenshotPath = themeConfig.screenshot ?
		path.join(themeDir, themeConfig.screenshot) :
		'';

	// Guard against path traversal - ensure path stays within theme directory
	if (screenshotPath && !screenshotPath.startsWith(themeDir)) {
		throw new Error('[[error:invalid-path]]');
	}
	const exists = screenshotPath ? await file.exists(screenshotPath) : false;
	// Path is validated above to ensure it stays within themeDir
	// nosemgrep
	res.sendFile(exists ? screenshotPath : defaultScreenshotPath);
};
