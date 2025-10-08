'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');

const categories = require('../src/categories');
const topics = require('../src/topics');
const posts = require('../src/posts');
const user = require('../src/user');
const privileges = require('../src/privileges');
const helpers = require('./helpers');

describe('Leaderboard', () => {
	let adminUid;
	let regularUid;
	let categoryObj;
	let topic1;
	let topic2;

	before(async () => {
		// create test users
		adminUid = await user.create({ username: 'admin' });
		regularUid = await user.create({ username: 'regular' });
		
		// make admin 
		await privileges.admin.give(['admin:categories'], adminUid);
		
		// create test category
		categoryObj = await categories.create({
			name: 'Test Category',
			description: 'Test category for leaderboard',
		});
		
		// create topics and posts for testing
		topic1 = await topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'Test Topic 1',
			content: 'Test content 1',
		});
		
		topic2 = await topics.post({
			uid: regularUid,
			cid: categoryObj.cid,
			title: 'Test Topic 2',
			content: 'Test content 2',
		});
		
		await topics.reply({
			uid: adminUid,
			tid: topic2.topicData.tid,
			content: 'This is test reply 1',
		});
		
		await topics.reply({
			uid: adminUid,
			tid: topic2.topicData.tid,
			content: 'This is test reply 2',
		});
	});

	describe('getUserLeaderboard()', () => {
		it('should return correct post/topic counts for users', async () => {
			const result = await categories.getUserLeaderboard(categoryObj.cid, {
				limit: 50,
				sortBy: 'total',
				order: 'desc',
			});
			
			assert(result.rows.length === 2, 'Should have 2 users');
			assert(result.totalUsers === 2, 'Should count 2 total users');
			
			// admin should be first (1 topic + 3 posts = 4 total)
			// note: Creating a topic also creates a post (the main post)
			const adminRow = result.rows.find(r => r.uid == adminUid);
			assert(adminRow.topicCount === 1, 'Admin should have 1 topic');
			assert(adminRow.postCount === 3, 'Admin should have 3 posts (1 main post + 2 replies)');
			assert(adminRow.totalCount === 4, 'Admin should have 4 total');
			
			// regular user should be second (1 topic + 1 post = 2 total)
			const regularRow = result.rows.find(r => r.uid == regularUid);
			assert(regularRow.topicCount === 1, 'Regular should have 1 topic');
			assert(regularRow.postCount === 1, 'Regular should have 1 post (the topic main post)');
			assert(regularRow.totalCount === 2, 'Regular should have 2 total');
		});
		
		it('should sort by different metrics correctly', async () => {
			const byPosts = await categories.getUserLeaderboard(categoryObj.cid, {
				sortBy: 'posts',
				order: 'desc',
			});
			
			assert(byPosts.rows[0].uid == adminUid, 'Admin should be first when sorting by posts');
		});
		
		it('should handle category filtering correctly', async () => {
			// create another category
			const category2 = await categories.create({
				name: 'Another Category',
				description: 'Should not show in results',
			});
			
			const result = await categories.getUserLeaderboard(categoryObj.cid, {});
			
			// verify only users from target category are shown
			assert(result.cid == categoryObj.cid, 'Should return correct category ID');
		});
		
		it('should handle pagination correctly', async () => {
			const page1 = await categories.getUserLeaderboard(categoryObj.cid, {
				start: 0,
				limit: 1,
			});
			
			const page2 = await categories.getUserLeaderboard(categoryObj.cid, {
				start: 1,
				limit: 1,
			});
			
			assert(page1.rows.length === 1, 'Page 1 should have 1 result');
			assert(page2.rows.length === 1, 'Page 2 should have 1 result');
			assert(page1.rows[0].uid !== page2.rows[0].uid, 'Pages should show different users');
		});
		
		it('should handle empty categories gracefully', async () => {
			const emptyCategory = await categories.create({
				name: 'Empty Category',
				description: 'No posts here',
			});
			
			const result = await categories.getUserLeaderboard(emptyCategory.cid, {});
			
			assert.strictEqual(result.rows.length, 0, 'Should have no users');
			assert.strictEqual(result.totalUsers, 0, 'Should count 0 total users');
			assert.strictEqual(result.cid, emptyCategory.cid, 'Should return correct category ID');
		});
	});
});