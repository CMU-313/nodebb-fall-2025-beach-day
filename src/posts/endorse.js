'use strict';

const db = require('../database');
const privileges = require('../privileges');

module.exports = function (Posts) {
	Posts.endorse = async function (pid, uid) {
		// Only admins or moderators of the topic may endorse
		const tid = await Posts.getPostField(pid, 'tid');
		const allowed = await privileges.topics.isAdminOrMod(tid, uid);
		if (!allowed) {
			throw new Error('[[error:no-privileges]]');
		}

		// Add endorsement to sorted set
		await db.sortedSetAdd(`post:${pid}:endorsements`, Date.now(), uid);
	};

	Posts.unendorse = async function (pid, uid) {
		const tid = await Posts.getPostField(pid, 'tid');
		const allowed = await privileges.topics.isAdminOrMod(tid, uid);
		if (!allowed) {
			throw new Error('[[error:no-privileges]]');
		}
		await db.sortedSetRemove(`post:${pid}:endorsements`, uid);
	};

	Posts.isEndorsed = async function (pid) {
		// Fetch the endorsed member list for this pid
		const endorsedUids = await db.getSetMembers(`pid:${pid}:endorsed:uids`);

		// Return boolean: true if at least one uid has endorsed
		return endorsedUids.length > 0;
	};
};
