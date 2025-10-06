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

	// Check whether the post has any endorsements
	Posts.isEndorsed = async function (pid) {
		const count = await db.sortedSetCard(`post:${pid}:endorsements`);
		return !!count;
	};

	// Backwards-compatible: check whether the (current) user has endorsed the post.
	// For this app we don't track per-user endorsement as required by the UI; we
	// only need to know whether any admin/mod has endorsed a post. Implement this
	// function to return the post-level endorsed boolean so existing controller
	// code (which passes uid) keeps working.
	Posts.hasEndorsed = async function (pid /*, uid */) {
		return Posts.isEndorsed(pid);
	};

	// Batch helper: given an array of pids, return an array of booleans indicating
	// whether each post has any endorsements.
	Posts.hasAnyEndorsements = async function (pids) {
		if (!Array.isArray(pids)) {
			pids = [pids];
		}
		const results = await Promise.all(pids.map(pid => Posts.isEndorsed(pid).catch(() => false)));
		return results;
	};
};
