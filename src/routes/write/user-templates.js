'use strict';

const express = require('express');
const middleware = require('../../middleware');
const helpers = require('../helpers');
const writeControllers = require('../../controllers/write');

const middlewares = [
	middleware.autoLocale,
	middleware.applyBlacklist,
	middleware.authenticateRequest,
	middleware.maintenanceMode,
	middleware.registrationComplete,
	middleware.pluginHooks,
	middleware.logApiUsage,
	middleware.handleMultipart,
	middleware.ensureLoggedIn,
];

module.exports = function () {
	const router = express.Router();

	// GET /api/v3/user-templates - List user's templates
	helpers.setupApiRoute(router, 'get', '/', middlewares, writeControllers.userTemplates.list);

	// GET /api/v3/user-templates/:templateId - Get specific template
	helpers.setupApiRoute(router, 'get', '/:templateId', middlewares, writeControllers.userTemplates.get);

	// POST /api/v3/user-templates - Create new template
	helpers.setupApiRoute(router, 'post', '/', middlewares, writeControllers.userTemplates.create);

	// PUT /api/v3/user-templates/:templateId - Update template
	helpers.setupApiRoute(router, 'put', '/:templateId', middlewares, writeControllers.userTemplates.update);

	// DELETE /api/v3/user-templates/:templateId - Delete template
	helpers.setupApiRoute(router, 'delete', '/:templateId', middlewares, writeControllers.userTemplates.delete);

	return router;
};
