'use strict';

const db = require('../database');
const user = require('../user');

module.exports = function (Categories) {
	Categories.getUserLeaderboard = async function (cid, opts = {}) {
		// validate inputs
		const sortBy = ['total', 'posts', 'topics'].includes((opts.sortBy || '').toLowerCase()) ?
			opts.sortBy.toLowerCase() : 'total';
		const order = (opts.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
		const start = Math.max(0, parseInt(opts.start, 10) || 0);
		const limit = Math.max(1, Math.min(200, parseInt(opts.limit, 10) || 50));
	
		// get all users who have posted in given category
		const postsPattern = `cid:${cid}:uid:*:pids`;
		const topicsPattern = `cid:${cid}:uid:*:tids`;

		const [postKeys, topicKeys] = await Promise.all([
			db.scan({ match: postsPattern }),
			db.scan({ match: topicsPattern }),
		]);

		// extract user ids from the keys
		function extractUid(key, suffix) {
			const prefix = `cid:${cid}:uid:`;
			if (!key.startsWith(prefix) || !key.endsWith(suffix)) return null;
			return key.substring(prefix.length, key.length - suffix.length);
		}

		const postUids = postKeys.map(k => extractUid(k, ':pids')).filter(Boolean);
		const topicUids = topicKeys.map(k => extractUid(k, ':tids')).filter(Boolean);
		const uids = [...new Set([...postUids, ...topicUids])];

		if (!uids.length) {
			return {
				cid,
				rows: [],
				totalUsers: 0,
				sortBy,
				order,
				start,
				limit,
			};
		}

		// count posts and topics for each user
		const postsKeys = uids.map(uid => `cid:${cid}:uid:${uid}:pids`);
		const topicsKeys = uids.map(uid => `cid:${cid}:uid:${uid}:tids`);

		const [postCounts, topicCounts] = await Promise.all([
			db.sortedSetsCard(postsKeys),
			db.sortedSetsCard(topicsKeys),
		]);

		// build leaderboard data
		const rowsAll = uids.map((uid, i) => {
			const postCount = parseInt(postCounts[i], 10) || 0;
			const topicCount = parseInt(topicCounts[i], 10) || 0;
			return {
				uid,
				postCount,
				topicCount,
				totalCount: postCount + topicCount,
			};
		});

		// sort data
		rowsAll.sort((a, b) => {
			const av = sortBy === 'posts' ? a.postCount : sortBy === 'topics' ? a.topicCount : a.totalCount;
			const bv = sortBy === 'posts' ? b.postCount : sortBy === 'topics' ? b.topicCount : b.totalCount;
			if (av === bv) {
				return String(a.uid).localeCompare(String(b.uid));
			}
			return order === 'asc' ? av - bv : bv - av;
		});

		//  pagination
		const totalUsers = rowsAll.length;
		const pageRows = rowsAll.slice(start, start + limit);
		const pageUids = pageRows.map(r => r.uid);
		const usersData = await user.getUsersFields(pageUids, ['uid', 'username', 'userslug', 'picture']);

		//final rows with user data and ranks
		const rows = pageRows.map((r, index) => ({
			...r,
			rank: start + index + 1,
			user: usersData.find(u => u.uid == r.uid) || { uid: r.uid, username: String(r.uid), userslug: '', picture: '' },
		}));

		return {
			cid,
			rows,
			totalUsers,
			sortBy,
			order,
			start,
			limit,
		};
	};
};
