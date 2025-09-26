'use strict';

const db = require('../database');

module.exports = function (Posts) {
	Posts.endorse = async function (pid, uid) {
		// Add endorsement to sorted set
		await db.sortedSetAdd(`post:${pid}:endorsements`, Date.now(), uid);
	};

	Posts.unendorse = async function (pid, uid) {
		await db.sortedSetRemove(`post:${pid}:endorsements`, uid);
	};

	Posts.hasEndorsed = async function (pid, uid) {
		return await db.isSortedSetMember(`post:${pid}:endorsements`, uid);
	};

	Posts.getEndorsers = async function (pid, start = 0, stop = -1) {
		return await db.getSortedSetRevRange(`post:${pid}:endorsements`, start, stop);
	};
};
