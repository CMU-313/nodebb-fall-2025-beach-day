'use strict';

module.exports = {
	name: 'Add user templates support',
	timestamp: Date.UTC(2024, 11, 20), // December 20, 2024
	method: async function () {
		const { progress } = this;
		
		// For Redis, we don't need to create tables as it's a key-value store
		// The API layer will handle creating the necessary data structures
		// We'll use keys like "user_template:{uid}:{templateId}" for storage
		// and sorted sets like "uid:{uid}:templates" for indexing
		
		// No explicit setup needed for Redis - the API layer handles everything
		// This upgrade script is mainly for tracking that the feature was added
		
		progress.incr();
	},
};
