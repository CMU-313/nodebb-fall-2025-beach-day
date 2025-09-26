<div class="acp-page-container" component="leaderboard">
	<div class="d-flex border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-start align-items-md-center justify-content-between flex-wrap gap-2">
		<div class="d-flex flex-column gap-1">
			<h4 class="fw-bold tracking-tight mb-0">[[admin/manage/leaderboard:title]]</h4>
			<p class="text-xs text-muted mb-0">[[admin/manage/leaderboard:description]]</p>
			{{{ if hasCategorySelected }}}
			<p class="text-xs text-muted mb-0">[[admin/manage/leaderboard:selected-category, {categoryName}]]</p>
			<p class="text-xs text-muted mb-0">[[admin/manage/leaderboard:total-users, {formattedNumber(leaderboard.totalUsers)}]]</p>
			{{{ end }}}
		</div>
		<div class="d-flex gap-2 flex-wrap align-items-center justify-content-end">
			<div component="leaderboard/category-selector">
				<!-- IMPORT admin/partials/category/selector-dropdown-right.tpl -->
			</div>
			{{{ if hasCategorySelected }}}
			<button type="button" class="btn btn-ghost btn-sm text-nowrap" component="leaderboard/reset">
				<i class="fa fa-rotate-left"></i>
				[[admin/manage/leaderboard:button.reset]]
			</button>
			{{{ end }}}
		</div>
	</div>

	{{{ if categoryMissing }}}
	<div class="alert alert-danger mt-3">[[admin/manage/leaderboard:category-missing]]</div>
	{{{ end }}}

	{{{ if !hasCategorySelected }}}
	<div class="alert alert-info mt-3">[[admin/manage/leaderboard:no-category-selected]]</div>
	{{{ else }}}
	<div class="card mt-3">
		<div class="table-responsive">
			<table class="table table-hover align-middle text-sm mb-0">
				<thead>
					<tr>
						<th class="text-center" style="width: 70px;">[[admin/manage/leaderboard:table.rank]]</th>
						<th>[[admin/manage/leaderboard:table.user]]</th>
						<th class="text-end">[[admin/manage/leaderboard:table.comments]]</th>
						<th class="text-end">[[admin/manage/leaderboard:table.topics]]</th>
						<th class="text-end">[[admin/manage/leaderboard:table.total]]</th>
					</tr>
				</thead>
				<tbody>
					{{{ if !leaderboard.rows.length }}}
					<tr>
						<td colspan="5" class="text-center text-muted py-5">[[admin/manage/leaderboard:no-results]]</td>
					</tr>
					{{{ else }}}
					{{{ each leaderboard.rows }}}
					<tr>
						<td class="text-center text-muted">{./rank}</td>
						<td>
							<div class="d-flex align-items-center gap-2">
								{buildAvatar(./user, "32px", true)}
								<div class="d-flex flex-column lh-sm">
									<a href="{config.relative_path}/uid/{./uid}" target="_top" class="fw-semibold">{./user.username}</a>
									<span class="text-xs text-muted">{{{ if ./user.userslug }}}@{./user.userslug}{{{ else }}}&nbsp;{{{ end }}}</span>
								</div>
							</div>
						</td>
						<td class="text-end">{formattedNumber(./postCount)}</td>
						<td class="text-end">{formattedNumber(./topicCount)}</td>
						<td class="text-end fw-semibold">{formattedNumber(./totalCount)}</td>
					</tr>
					{{{ end }}}
					{{{ end }}}
				</tbody>
			</table>
		</div>
	</div>
	<div class="mt-3" component="leaderboard/pagination">
		<!-- IMPORT admin/partials/paginator.tpl -->
	</div>
	{{{ end }}}
</div>
