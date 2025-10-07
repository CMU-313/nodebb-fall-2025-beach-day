'use strict';

define('forum/composer-select-format', ['hooks'], function (hooks) {
	const Dropdown = {
		initialised: false,
	};
	//I think it will look something like this and templates can be added.
	const templates = [
		{
			id: 'format1',
			label: 'Format 1',
			description: 'Starter layout with header and code block.',
			body: '## Header\n\n```code```\n\n- Item 1\n- Item 2\n',
		},
		{
			id: 'format2',
			label: 'Format 2',
			description: 'Summary/details sections ready to fill in.',
			body: '### Summary\n\nDescribe the summary.\n\n### Details\n\nAdd the supporting details here.\n',
		},
	];

	//this will build the drop down similar to the headings in the navigation.
	function buildDropdown(postContainer) {
		const dropdown = $('<div>').addClass('btn-group btn-group-sm select-format-dropdown').attr('component', 'composer/select-format');

		const button = $('<button>', {
			type: 'button',
			class: 'btn btn-sm btn-link text-body fw-semibold dropdown-toggle',
			'data-bs-toggle': 'dropdown',
			'aria-haspopup': 'true',
			'aria-expanded': 'false',
			'aria-label': 'Format option',
		});
		button.append($('<i>').addClass('fa fa-list-ul'));
		button.append(' ');
		button.append($('<span>').addClass('d-none d-lg-inline').text('Format option'));

		const menu = $('<ul>').addClass('dropdown-menu dropdown-menu-end p-1').attr('role', 'menu');

		dropdown.append(button).append(menu);

		if (!templates.length) {
			menu.append(
				$('<li>').addClass('px-3 py-2 text-muted small').text('No formats available yet')
			);
		} else {
			templates.forEach((template) => {
				const item = $('<li>');
				const link = $('<a>', {
					href: '#',
					role: 'menuitem',
					class: 'dropdown-item rounded-1',
					'data-template-id': template.id,
				});

				link.append($('<span>').addClass('template-label d-block fw-semibold').text(template.label));
				if (template.description) {
					link.append($('<small>').addClass('text-muted d-block').text(template.description));
				}

				item.append(link);
				menu.append(item);
			});
		}

		dropdown.on('click', '[data-template-id]', function (ev) {
			ev.preventDefault();
			const templateId = $(this).attr('data-template-id');
			const template = templates.find(tpl => tpl.id === templateId);
			if (!template) {
				return;
			}

			dropdown.removeClass('show');
			dropdown.find('.dropdown-menu').removeClass('show');
			applyTemplate(postContainer, template);
		});

		return dropdown;
	} // It will basically just insert the template text into where the cursor is so that we can use multiple.
	function applyTemplate(postContainer, template) {
		const textarea = postContainer.find('textarea');
		if (!textarea.length) {
			return;
		}

		const currentValue = textarea.val();
		const trimmed = currentValue.replace(/\s+$/, '');
		const separator = trimmed.length ? '\n\n' : '';
		const newValue = trimmed + separator + template.body;

		textarea.val(newValue).trigger('input').trigger('change');
		textarea.focus();

		const uuid = postContainer.attr('data-uuid');
		if (uuid) {
			require(['composer'], function (composer) {
				if (composer.posts && composer.posts[uuid]) {
					composer.posts[uuid].body = textarea.val();
					composer.posts[uuid].modified = true;
				}
			});
		}
	}

	function insertDropdown(postContainer) {
		if (!postContainer || !postContainer.length) {
			return;
		}

		const actionBar = postContainer.find('.action-bar').first();
		if (!actionBar.length || actionBar.find('[component="composer/select-format"]').length) {
			return;
		}

		const dropdown = buildDropdown(postContainer);
		const discardButton = actionBar.find('.composer-discard').first();

		if (discardButton.length) {
			dropdown.insertAfter(discardButton);
		} else {
			actionBar.prepend(dropdown);
		}
	}

	Dropdown.init = function () {
		if (Dropdown.initialised) {
			return;
		}
		Dropdown.initialised = true;

		hooks.on('action:composer.enhanced', function (data) {
			insertDropdown(data && data.postContainer);
		});

		hooks.on('action:composer.loadDraft', function (data) {
			insertDropdown(data && data.postContainer);
		});

		$('[component="composer"]').each(function () {
			insertDropdown($(this));
		});
	};

	return Dropdown;
});
