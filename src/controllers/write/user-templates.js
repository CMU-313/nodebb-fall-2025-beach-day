'use strict';

const api = require('../../api/user-templates');
const helpers = require('../helpers');

const UserTemplates = module.exports;

UserTemplates.list = async (req, res) => {
	helpers.formatApiResponse(200, res, await api.list(req));
};

UserTemplates.get = async (req, res) => {
	helpers.formatApiResponse(200, res, await api.get(req, req.params));
};

UserTemplates.create = async (req, res) => {
	const response = await api.create(req, req.body);
	helpers.formatApiResponse(201, res, response);
};

UserTemplates.update = async (req, res) => {
	await api.update(req, {
		templateId: req.params.templateId,
		...req.body,
	});
	helpers.formatApiResponse(200, res, { success: true });
};

UserTemplates.delete = async (req, res) => {
	await api.delete(req, { templateId: req.params.templateId });
	helpers.formatApiResponse(200, res, { success: true });
};
