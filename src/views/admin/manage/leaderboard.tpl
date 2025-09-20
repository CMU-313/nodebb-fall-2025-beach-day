<div class="manage-leaderboard acp-page-container px-lg-4 h-100 d-flex flex-column gap-3" component="admin/manage/leaderboard">
    <div class="d-flex border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex flex-column">
            <h4 class="fw-bold tracking-tight mb-0">[[admin/manage/leaderboard:title]]</h4>
            <p class="text-sm text-muted mb-0">[[admin/manage/leaderboard:description]]</p>
        </div>
    </div>

    <div class="card flex-grow-1">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" id="leaderboard-table">
                <thead class="table-light">
                    <tr>
                        <th scope="col" class="text-center text-nowrap">[[admin/manage/leaderboard:table.rank]]</th>
                        <th scope="col" class="text-nowrap">[[admin/manage/leaderboard:table.user]]</th>
                        <th scope="col" class="text-end text-nowrap">[[admin/manage/leaderboard:table.posts]]</th>
                        <th scope="col" class="text-end text-nowrap">[[admin/manage/leaderboard:table.topics]]</th>
                        <th scope="col" class="text-end text-nowrap">[[admin/manage/leaderboard:table.total]]</th>
                    </tr>
                </thead>
                <tbody>
                    {{{ each entries }}}
                    <tr data-uid="{entries.uid}">
                        <td class="text-center fw-semibold">
                            <span class="badge text-bg-light px-3 py-2">{entries.rank}</span>
                        </td>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                {buildAvatar(entries, "36px", true)}
                                <div class="d-flex flex-column">
                                    <a class="fw-semibold" href="{config.relative_path}/user/{entries.userslug}" target="_blank" rel="noopener">{entries.username}</a>
                                    {{{ if entries.displayName }}}
                                    <span class="text-xs text-muted">{entries.displayName}</span>
                                    {{{ else if entries.email }}}
                                    <span class="text-xs text-muted">{entries.email}</span>
                                    {{{ end }}}
                                </div>
                            </div>
                        </td>
                        <td class="text-end fw-semibold">{entries.posts}</td>
                        <td class="text-end fw-semibold">{entries.topics}</td>
                        <td class="text-end fw-semibold">{entries.total}</td>
                    </tr>
                    {{{ else }}}
                    <tr>
                        <td colspan="5" class="text-center py-5 text-muted">
                            <i class="fa fa-bar-chart fa-2x mb-3 d-block text-secondary"></i>
                            [[admin/manage/leaderboard:empty]]
                        </td>
                    </tr>
                    {{{ end }}}
                </tbody>
            </table>
        </div>
    </div>

    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div class="text-sm text-muted">
            {{{ if entries.length }}}
            [[admin/manage/leaderboard:summary, {pageStart}, {pageEnd}, {total}]]
            {{{ else }}}
            [[admin/manage/leaderboard:summary-empty]]
            {{{ end }}}
        </div>
        <div class="ms-auto">
            <!-- IMPORT admin/partials/paginator.tpl -->
        </div>
    </div>
</div>
