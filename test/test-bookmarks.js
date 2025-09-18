'use strict';

// Load NodeBB core
const nbb = require('../src/meta.js'); // lightweight entrypoint
const Posts = require('../src/posts.js');

(async () => {
	try {
		// make sure NodeBB is fully bootstrapped
		await nbb.ready();

		const pid = 123; // replace with a real post ID
		const uid = 1; // replace with a real user ID

		console.log('Adding bookmark...');
		await Posts.bookmark(pid, uid, 'Games');

		const cat = await Posts.getBookmarkCategory(pid, uid);
		console.log(`Category of bookmark ${pid}:`, cat);

		const list = await Posts.getBookmarksByCategory(uid, 'Games');
		console.log('Bookmarks in Games category:', list);

		console.log('Removing bookmark...');
		await Posts.unbookmark(pid, uid);
	} catch (err) {
		console.error(err);
	} finally {
		process.exit();
	}
})();
