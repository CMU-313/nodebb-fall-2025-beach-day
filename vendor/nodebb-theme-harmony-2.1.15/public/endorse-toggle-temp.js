/* Temporary front-end-only toggle for the endorse button
 * - Toggles `.endorsed` on the clicked `[component="post/endrose"]` anchor
 * - Toggles `.has-endorsed` on the nearest `[component="post"]` wrapper
 * - Does not persist to server; purely visual for demo/testing.
 */

(function () {
	'use strict';

	// Use delegated listener since posts are dynamic
	$(document).on('click', '[component="post/endrose"]', function (ev) {
		ev.preventDefault();
		var $btn = $(this);
		// Toggle endorsed class on the button
		$btn.toggleClass('endorsed');
		// Swap icon classes (text-success / text-muted)
		var $icon = $btn.find('i.fa-thumbs-up');
		if ($btn.hasClass('endorsed')) {
			$icon.removeClass('text-muted').addClass('text-success');
			// Add has-endorsed to nearest post wrapper so CSS fallback works
			$btn.closest('[component="post"]').addClass('has-endorsed');
		} else {
			$icon.removeClass('text-success').addClass('text-muted');
			$btn.closest('[component="post"]').removeClass('has-endorsed');
		}
	});

})();
