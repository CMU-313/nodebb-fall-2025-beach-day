'use strict';

const db = require('../database');
const user = require('../user');
const privileges = require('../privileges');
const utils = require('../utils');

const userTemplatesAPI = module.exports;

userTemplatesAPI.list = async function (caller) {
	if (!caller.uid) {
		throw new Error('[[error:not-logged-in]]');
	}

	const templates = await getUserTemplates(caller.uid);
	return { templates };
};

userTemplatesAPI.get = async function (caller, data) {
	if (!caller.uid) {
		throw new Error('[[error:not-logged-in]]');
	}

	const template = await getUserTemplate(caller.uid, data.templateId);
	if (!template) {
		throw new Error('[[error:template-not-found]]');
	}

	return template;
};

userTemplatesAPI.create = async function (caller, data) {
	if (!caller.uid) {
		throw new Error('[[error:not-logged-in]]');
	}

	const { name, description, content } = data;
	
	if (!name || !name.trim()) {
		throw new Error('[[error:template-name-required]]');
	}
	
	if (!content || !content.trim()) {
		throw new Error('[[error:template-content-required]]');
	}

	const templateId = await createUserTemplate(caller.uid, {
		name: name.trim(),
		description: description ? description.trim() : '',
		content: content.trim(),
	});

	return { templateId };
};

userTemplatesAPI.update = async function (caller, data) {
	if (!caller.uid) {
		throw new Error('[[error:not-logged-in]]');
	}

	const { templateId, name, description, content } = data;
	
	// Check if template exists and belongs to user
	const existingTemplate = await getUserTemplate(caller.uid, templateId);
	if (!existingTemplate) {
		throw new Error('[[error:template-not-found]]');
	}

	const updateData = {};
	if (name !== undefined) updateData.name = name.trim();
	if (description !== undefined) updateData.description = description.trim();
	if (content !== undefined) updateData.content = content.trim();

	await updateUserTemplate(caller.uid, templateId, updateData);
	return { success: true };
};

userTemplatesAPI.delete = async function (caller, data) {
	if (!caller.uid) {
		throw new Error('[[error:not-logged-in]]');
	}

	const { templateId } = data;
	
	// Check if template exists and belongs to user
	const existingTemplate = await getUserTemplate(caller.uid, templateId);
	if (!existingTemplate) {
		throw new Error('[[error:template-not-found]]');
	}

	await deleteUserTemplate(caller.uid, templateId);
	return { success: true };
};

// Database helper functions
async function getUserTemplates(uid) {
	// For Redis, use object-based storage with sorted sets for indexing
	const keys = await db.getSortedSetRange(`uid:${uid}:templates`, 0, -1);
	if (!keys.length) {
		return [];
	}
	
	const templates = await db.getObjects(keys);
	return templates.filter(template => template).map(template => ({
		id: template.id,
		name: template.name,
		description: template.description,
		content: template.content,
		created_at: template.created_at,
		updated_at: template.updated_at,
	}));
}

async function getUserTemplate(uid, templateId) {
	// For Redis
	const key = `user_template:${uid}:${templateId}`;
	const template = await db.getObject(key);
	
	if (!template || template.uid !== uid.toString()) {
		return null;
	}
	
	return {
		id: template.id,
		name: template.name,
		description: template.description,
		content: template.content,
		created_at: template.created_at,
		updated_at: template.updated_at,
	};
}

async function createUserTemplate(uid, templateData) {
	const now = Date.now();
	const templateId = utils.generateUUID();
	
	// For Redis
	const key = `user_template:${uid}:${templateId}`;
	const template = {
		id: templateId,
		uid: uid,
		name: templateData.name,
		description: templateData.description,
		content: templateData.content,
		created_at: now,
		updated_at: now,
	};
	
	await db.setObject(key, template);
	await db.sortedSetAdd(`uid:${uid}:templates`, now, key);
	
	return templateId;
}

async function updateUserTemplate(uid, templateId, updateData) {
	const now = Date.now();
	
	// For Redis
	const key = `user_template:${uid}:${templateId}`;
	const updateObj = { ...updateData, updated_at: now };
	await db.setObjectField(key, updateObj);
}

async function deleteUserTemplate(uid, templateId) {
	// For Redis
	const key = `user_template:${uid}:${templateId}`;
	await db.delete(key);
	await db.sortedSetRemove(`uid:${uid}:templates`, key);
}
