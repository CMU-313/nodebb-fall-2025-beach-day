'use strict';

define('forum/composer-select-format', ['hooks'], function (hooks) {
	const Dropdown = {
		initialised: false,
	};
	//Array of available post format templates. Add new templates to extend the dropdown options.
	const defaultTemplates = [
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
	
	// Dynamic templates array that will be populated from API
	let templates = [...defaultTemplates];

	// Load user templates from API
	async function loadUserTemplates() {
		try {
			const response = await fetch('/api/v3/user-templates', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': config.csrf_token,
				},
				credentials: 'same-origin',
			});
			
			console.log('Load templates response status:', response.status);
			
			if (response.ok) {
				const data = await response.json();
				console.log('Load templates response data:', data);
				
				// Handle wrapped response structure
				const responseData = data.response || data;
				
				if (responseData.templates && Array.isArray(responseData.templates)) {
					const userTemplates = responseData.templates.map(template => ({
						id: template.id,
						label: template.name,
						description: template.description,
						body: template.content,
					}));
					
					// Combine default templates with user templates
					templates = [...defaultTemplates, ...userTemplates];
					console.log('Loaded templates:', templates);
				} else {
					console.warn('No templates array in response, using default templates only');
					console.log('Response structure:', responseData);
					templates = [...defaultTemplates];
				}
			} else {
				console.warn('Failed to load user templates, using default templates only. Status:', response.status);
				templates = [...defaultTemplates];
			}
		} catch (error) {
			console.error('Failed to load user templates:', error);
			templates = [...defaultTemplates];
		}
	}

	// Save template to backend
	async function saveTemplateToBackend(templateData) {
		try {
			console.log('Saving template to backend:', templateData);
			
			const response = await fetch('/api/v3/user-templates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': config.csrf_token,
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					name: templateData.name,
					description: templateData.description,
					content: templateData.content,
				}),
			});
			
			console.log('Save template response status:', response.status);
			
			if (response.ok) {
				const data = await response.json();
				console.log('Save template response data:', data);
				
				// Handle wrapped response structure
				const responseData = data.response || data;
				return responseData.templateId;
			}
			
			const errorText = await response.text();
			console.error('Save template failed:', response.status, errorText);
			throw new Error(`Failed to save template: ${response.status} ${errorText}`);
		} catch (error) {
			console.error('Failed to save template:', error);
			throw error;
		}
	}

	// Delete template from backend
	async function deleteTemplateFromBackend(templateId) {
		try {
			const response = await fetch(`/api/v3/user-templates/${templateId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': config.csrf_token,
				},
				credentials: 'same-origin',
			});
			
			return response.ok;
		} catch (error) {
			console.error('Failed to delete template:', error);
			return false;
		}
	}

	// This will build the dropdown similar to the headings in the navigation.
	async function buildDropdown(postContainer) {
		// Load user templates from API
		await loadUserTemplates();
		
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

		// Create Export format button
		const exportButton = $('<button>', {
			type: 'button',
			class: 'btn btn-sm btn-link text-body fw-semibold',
			'aria-label': 'Export format',
		});
		exportButton.append($('<i>').addClass('fa fa-download'));
		exportButton.append(' ');
		exportButton.append($('<span>').addClass('d-none d-lg-inline').text('Export format'));

		// Add click handler for Export format button
		exportButton.on('click', async function (ev) {
			ev.preventDefault();
			const textarea = postContainer.find('textarea');
			if (textarea.length) {
				const currentContent = textarea.val();
				console.log('Current topic description content:', currentContent);
				
				// Add current content as a new template
				if (currentContent.trim()) {
					// Show popup dialog for template name
					const templateName = prompt('Enter a name for this template:', 'My Template');
					
					if (templateName && templateName.trim()) {
						try {
							// Save to backend
							const templateId = await saveTemplateToBackend({
								name: templateName.trim(),
								description: 'Content exported from current topic description',
								content: currentContent,
							});
							
							// Add to local templates array
							const newTemplate = {
								id: templateId,
								label: templateName.trim(),
								description: 'Content exported from current topic description',
								body: currentContent,
							};
							
							templates.push(newTemplate);
							
							// Refresh the dropdown menu
							menu.empty();
							if (!templates.length) {
								menu.append(
									$('<li>').addClass('px-3 py-2 text-muted small').text('No formats available yet')
								);
							} else {
								templates.forEach((template) => {
									const item = $('<li>').addClass('d-flex justify-content-between align-items-center');
									const link = $('<a>', {
										href: '#',
										role: 'menuitem',
										class: 'dropdown-item rounded-1 flex-grow-1',
										'data-template-id': template.id,
									});

									link.append($('<span>').addClass('template-label d-block fw-semibold').text(template.label));
									if (template.description) {
										link.append($('<small>').addClass('text-muted d-block').text(template.description));
									}

									// Add delete button for user templates (not default ones)
									const deleteButton = $('<button>', {
										type: 'button',
										class: 'btn btn-sm btn-outline-danger ms-2',
										'data-template-id': template.id,
										title: 'Delete template',
									});
									deleteButton.append($('<i>').addClass('fa fa-trash'));

									item.append(link);
									if (!defaultTemplates.find(t => t.id === template.id)) {
										item.append(deleteButton);
									}
									menu.append(item);
								});
							}
							
							console.log('Content added as template:', newTemplate);
						} catch (error) {
							console.error('Failed to save template:', error);
							alert('Failed to save template. Please try again.');
						}
					} else {
						console.log('Template creation cancelled or no name provided');
					}
				} else {
					console.log('No content to export - textarea is empty');
				}
			} else {
				console.log('No textarea found in the composer');
			}
		});

		dropdown.append(button).append(exportButton).append(menu);

		if (!templates.length) {
			menu.append(
				$('<li>').addClass('px-3 py-2 text-muted small').text('No formats available yet')
			);
		} else {
			templates.forEach((template) => {
				const item = $('<li>').addClass('d-flex justify-content-between align-items-center');
				const link = $('<a>', {
					href: '#',
					role: 'menuitem',
					class: 'dropdown-item rounded-1 flex-grow-1',
					'data-template-id': template.id,
				});

				link.append($('<span>').addClass('template-label d-block fw-semibold').text(template.label));
				if (template.description) {
					link.append($('<small>').addClass('text-muted d-block').text(template.description));
				}

				// Add delete button for exported templates
				const deleteButton = $('<button>', {
					type: 'button',
					class: 'btn btn-sm btn-outline-danger ms-2',
					'data-template-id': template.id,
					title: 'Delete template',
				});
				deleteButton.append($('<i>').addClass('fa fa-trash'));

				item.append(link);
				if (template.id.startsWith('exported-')) {
					item.append(deleteButton);
				}
				menu.append(item);
			});
		}

		dropdown.on('click', '[data-template-id]', async function (ev) {
			ev.preventDefault();
			const templateId = $(this).attr('data-template-id');
			const template = templates.find(tpl => tpl.id === templateId);
			if (!template) {
				return;
			}

			// Check if this is a delete button click
			if ($(this).hasClass('btn-outline-danger')) {
				// Delete the template from backend
				const success = await deleteTemplateFromBackend(templateId);
				if (success) {
					// Remove from local templates array
					const index = templates.findIndex(tpl => tpl.id === templateId);
					if (index > -1) {
						templates.splice(index, 1);
						
						// Refresh the dropdown menu
						menu.empty();
						if (!templates.length) {
							menu.append(
								$('<li>').addClass('px-3 py-2 text-muted small').text('No formats available yet')
							);
						} else {
							templates.forEach((template) => {
								const item = $('<li>').addClass('d-flex justify-content-between align-items-center');
								const link = $('<a>', {
									href: '#',
									role: 'menuitem',
									class: 'dropdown-item rounded-1 flex-grow-1',
									'data-template-id': template.id,
								});

								link.append($('<span>').addClass('template-label d-block fw-semibold').text(template.label));
								if (template.description) {
									link.append($('<small>').addClass('text-muted d-block').text(template.description));
								}

								// Add delete button for user templates (not default ones)
								const deleteButton = $('<button>', {
									type: 'button',
									class: 'btn btn-sm btn-outline-danger ms-2',
									'data-template-id': template.id,
									title: 'Delete template',
								});
								deleteButton.append($('<i>').addClass('fa fa-trash'));

								item.append(link);
								if (!defaultTemplates.find(t => t.id === template.id)) {
									item.append(deleteButton);
								}
								menu.append(item);
							});
						}
						
						console.log('Template deleted:', templateId);
					}
				} else {
					console.error('Failed to delete template from backend');
					alert('Failed to delete template. Please try again.');
				}
				return;
			}

			// Apply template (original functionality)
			dropdown.removeClass('show');
			dropdown.find('.dropdown-menu').removeClass('show');
			applyTemplate(postContainer, template);
		});

		return dropdown;
	}
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

	async function insertDropdown(postContainer) {
		if (!postContainer || !postContainer.length) {
			return;
		}

		const actionBar = postContainer.find('.action-bar').first();
		if (!actionBar.length || actionBar.find('[component="composer/select-format"]').length) {
			return;
		}

		const dropdown = await buildDropdown(postContainer);
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
