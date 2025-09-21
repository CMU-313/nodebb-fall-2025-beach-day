'use strict';

define('admin/manage/leaderboard', [
	'categorySelector',
], function (categorySelector) {
	const Leaderboard = {};

	Leaderboard.init = function () {
		const categorySelectorRoot = $('[component="leaderboard/category-selector"] [component="category-selector"]');
		if (categorySelectorRoot.length) {
			categorySelector.init(categorySelectorRoot, {
				selectedCategory: ajaxify.data.selectedCategory,
				selectedCids: ajaxify.data.selectedCids,
				cacheList: false,
				showLinks: true,
				template: 'admin/partials/category/selector-dropdown-right',
				onSelect(selectedCategory) {
					const selectedCid = parseInt(selectedCategory.cid, 10) || null;
					navigate(selectedCid);
				},
			});
		}

		$('[component="leaderboard/reset"]').on('click', function (ev) {
			ev.preventDefault();
			navigate(null);
		});
	};

	function navigate(cid) {
		const params = new URLSearchParams();
		if (cid) {
			params.set('cid', cid);
		}
		const qs = params.toString();
		ajaxify.go(`${config.relative_path}/admin/manage/leaderboard${qs ? `?${qs}` : ''}`);
	}

	return Leaderboard;
});
