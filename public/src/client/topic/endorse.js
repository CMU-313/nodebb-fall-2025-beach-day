define('forum/topic/endorse', ['api', 'alerts', 'hooks'], function (api, alerts, hooks) {
    const Endorse = {};

    Endorse.toggleEndorse = function ($btn, cssClass) {
        const $post = $btn.closest('[data-pid]');
        const pid = $post.attr('data-pid');
        const endorsed = $btn.hasClass(cssClass.replace('.', ''));

        const method = endorsed ? 'del' : 'put';

        api[method](`/posts/${encodeURIComponent(pid)}/endorse`, {}, function (err) {
            if (err) {
                return alerts.error(err);
            }

            // toggle UI state
            $btn.toggleClass(cssClass.replace('.', ''));
            const $icon = $btn.find('i.fa-thumbs-up');

            if ($btn.hasClass(cssClass.replace('.', ''))) {
                $icon.removeClass('text-muted').addClass('text-success');
                $post.addClass('has-endorsed');
                alerts.success('Post endorsed successfully!');
            } else {
                $icon.removeClass('text-success').addClass('text-muted');
                $post.removeClass('has-endorsed');
                alerts.success('Post unendorsed.');
            }

            hooks.fire('action:post.toggleEndorse', {
                pid: pid,
                unendorse: method === 'del',
            });
        });
    };

    return Endorse;
});
