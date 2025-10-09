'use strict';

const db = require('../database');
const plugins = require('../plugins');

module.exports = function (Posts) {
	// Support optional `category` parameter while remaining backward-compatible.
	Posts.bookmark = async (pid, uid, category) => toggleBookmark(true, pid, uid, category);
	Posts.unbookmark = async (pid, uid, category) => toggleBookmark(false, pid, uid, category);

	async function toggleBookmark(type, pid, uid, category) {
		if (parseInt(uid, 10) <= 0) {
			throw new Error('[[error:not-logged-in]]');
		}

		const isBookmarking = type;

		const [postData, hasBookmarked] = await Promise.all([
			Posts.getPostFields(pid, ['pid', 'uid']),
			Posts.hasBookmarked(pid, uid),
		]);

		if (isBookmarking && hasBookmarked) {
			throw new Error('[[error:already-bookmarked]]');
		}

		if (!isBookmarking && !hasBookmarked) {
			throw new Error('[[error:already-unbookmarked]]');
		}

		// If a category was provided, maintain a category-specific sorted set
		// for the user's bookmarks and track the user's categories. Categories
		// are optional; if none provided we default to the legacy global set.
		const cat = (typeof category === 'string' && category.trim()) ? category.trim() : null;

		if (cat) {
			const userCatSet = `uid:${uid}:bookmarks:${cat}`;
			if (isBookmarking) {
				await db.sortedSetAdd(userCatSet, Date.now(), pid);
				await db.setAdd(`uid:${uid}:bookmark_categories`, cat);
			} else {
				await db.sortedSetRemove(userCatSet, pid);
			}
		} else {
			// legacy global bookmarks set (kept for backward compatibility)
			if (isBookmarking) {
				await db.sortedSetAdd(`uid:${uid}:bookmarks`, Date.now(), pid);
			} else {
				await db.sortedSetRemove(`uid:${uid}:bookmarks`, pid);
			}
		}
		await db[isBookmarking ? 'setAdd' : 'setRemove'](`pid:${pid}:users_bookmarked`, uid);
		postData.bookmarks = await db.setCount(`pid:${pid}:users_bookmarked`);
		await Posts.setPostField(pid, 'bookmarks', postData.bookmarks);

		plugins.hooks.fire(`action:post.${type}`, {
			pid: pid,
			uid: uid,
			owner: postData.uid,
			current: hasBookmarked ? 'bookmarked' : 'unbookmarked',
		});

		return {
			post: postData,
			isBookmarked: isBookmarking,
		};
	}

	Posts.hasBookmarked = async function (pid, uid) {
		if (parseInt(uid, 10) <= 0) {
			return Array.isArray(pid) ? pid.map(() => false) : false;
		}

		if (Array.isArray(pid)) {
			const sets = pid.map(pid => `pid:${pid}:users_bookmarked`);
			return await db.isMemberOfSets(sets, uid);
		}
		return await db.isSetMember(`pid:${pid}:users_bookmarked`, uid);
	};
};