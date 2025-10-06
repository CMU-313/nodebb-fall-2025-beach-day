'use strict';

const assert = require('assert');

const db = require('../mocks/databasemock');
const topics = require('../../src/topics');
const posts = require('../../src/posts');
const categories = require('../../src/categories');
const user = require('../../src/user');

describe('Post endorsements', () => {
	let endorserUid;
	let authorUid;
	let cid;
	let pid;
	let modUid;

	before(async () => {
		// create users and a category + topic so we have a post to endorse
		endorserUid = await user.create({ username: 'endorser' });
		authorUid = await user.create({ username: 'endorsedauthor' });

		({ cid } = await categories.create({
			name: 'Endorse Category',
			description: 'Category for endorsement tests',
		}));

		const { postData } = await topics.post({
			uid: authorUid,
			cid: cid,
			title: 'Endorse test topic',
			content: 'Content to be endorsed',
		});
		pid = postData.pid;
	});

	it('should NOT allow a non-moderator/non-admin to endorse', async () => {
		let threw = false;
		try {
			await posts.endorse(pid, endorserUid);
		} catch (err) {
			threw = true;
			assert.ok(/no-privileges/.test(err.message));
		}
		assert.strictEqual(threw, true);
	});

	it('should allow a moderator to endorse', async () => {
		// promote a new moderator user for this category
		modUid = await user.create({ username: 'moduser' });
		const Groups = require('../../src/groups');
		// Add to Global Moderators for test convenience
		await Groups.join('Global Moderators', modUid);

		// moderator should be allowed to endorse
		await posts.endorse(pid, modUid);
		const endorsers = await db.getSortedSetRevRange(`post:${pid}:endorsements`, 0, -1);
		assert.ok(Array.isArray(endorsers));
		assert.ok(endorsers.includes(String(modUid)) || endorsers.includes(modUid));
	});

	it('should allow a moderator to unendorse', async () => {
		// non-admin attempt to unendorse should fail
		let threw = false;
		try {
			await posts.unendorse(pid, endorserUid);
		} catch (err) {
			threw = true;
			assert.ok(/no-privileges/.test(err.message));
		}
		assert.strictEqual(threw, true);

		// moderator can unendorse the moderator's endorsement
		await posts.unendorse(pid, modUid);
		const endorsers = await db.getSortedSetRevRange(`post:${pid}:endorsements`, 0, -1);
		assert.ok(Array.isArray(endorsers));
		assert.strictEqual(endorsers.includes(String(modUid)) || endorsers.includes(modUid), false);
	});
});
