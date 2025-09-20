<!-- IMPORT partials/account/header.tpl -->
<!-- Title and Categories -->
<div class="mb-3 d-flex align-items-center justify-content-between gap-3">
  <h3 class="fw-semibold fs-5">Bookmarks</h3>
  <div class="d-flex gap-2 align-items-center">
    <select id="bookmark-category-select" class="form-select form-select-sm">
      <option value="__all__">All</option>
    </select>
    <input id="bookmark-category-input" class="form-control form-control-sm" placeholder="New category">
    <button id="bookmark-category-add" class="btn btn-sm btn-primary">Add</button>
  </div>
</div>

<!-- Horizontal scrolling container -->
<div class="overflow-auto">
  <ul component="posts" id="bookmarks-list" class="posts-list list-unstyled d-flex gap-3" data-nextstart="{nextStart}" style="flex-wrap: nowrap;">
    {{{ each posts }}}
      <!-- IMPORT partials/posts_list_item.tpl -->
    {{{ end }}}
  </ul>
</div>

<!-- Loading indicator -->
<div component="posts/loading" class="loading-indicator text-center hidden">
  <i class="fa fa-refresh fa-spin"></i>
</div>

<!-- Client-side category management + filtering. This keeps most logic in the template as requested.
     Categories are stored in `localStorage.bookmarkCategories` as JSON array and per-post category
     assignments are stored in `localStorage.bookmarkAssignments` as map pid -> category. The UI allows
     creating categories and assigning them to posts via a small overlay on each post item. -->
<script>
;(function () {
  const STORAGE_CATS = 'bookmarkCategories';
  const STORAGE_ASSIGN = 'bookmarkAssignments';

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }

  function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  const categories = loadJSON(STORAGE_CATS, []);
  const assignments = loadJSON(STORAGE_ASSIGN, {});

  const select = document.getElementById('bookmark-category-select');
  const input = document.getElementById('bookmark-category-input');
  const addBtn = document.getElementById('bookmark-category-add');
  const list = document.getElementById('bookmarks-list');

  function refreshCategoryOptions() {
    // remove all except All option
    Array.from(select.options).forEach(opt => { if (opt.value !== '__all__') opt.remove(); });
    categories.forEach(cat => {
      const o = document.createElement('option'); o.value = cat; o.textContent = cat; select.appendChild(o);
    });
  }

  function applyFilter() {
    const chosen = select.value;
    Array.from(list.children).forEach(item => {
      const pid = item.getAttribute('data-pid');
      const assigned = assignments[pid] || '';
      if (chosen === '__all__' || chosen === assigned) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function ensureAssignOverlay(item) {
    if (item.querySelector('.bookmark-cat-assign')) return;
    const pid = item.getAttribute('data-pid');
    const overlay = document.createElement('div');
    overlay.className = 'bookmark-cat-assign position-absolute p-2 bg-white border rounded';
    overlay.style.right = '0.5rem'; overlay.style.top = '0.5rem'; overlay.style.zIndex = 20; overlay.style.display = 'none';

    const sel = document.createElement('select');
    const noneOpt = document.createElement('option'); noneOpt.value = ''; noneOpt.textContent = '(none)'; sel.appendChild(noneOpt);
    categories.forEach(cat => { const o = document.createElement('option'); o.value = cat; o.textContent = cat; sel.appendChild(o); });
    sel.value = assignments[pid] || '';

    const save = document.createElement('button'); save.className = 'btn btn-sm btn-primary ms-2'; save.textContent = 'Save';
    save.addEventListener('click', async () => {
      const val = sel.value || null;
      // update local assignments first
      if (val) assignments[pid] = val; else delete assignments[pid];
      saveJSON(STORAGE_ASSIGN, assignments);

      // attempt to persist category on the server by calling bookmark/unbookmark
      // endpoints. If the post was already bookmarked server-side we call
      // the corresponding endpoint with category to move it into the
      // category-specific set. If not bookmarked, we will first bookmark
      // with the category selected, so server and client remain in sync.
      try {
        // Check current bookmark state by looking for bookmarkCount element or data
        const bookmarked = !!item.querySelector('[data-bookmarks]') && parseInt(item.querySelector('[data-bookmarks]').getAttribute('data-bookmarks') || '0', 10) > 0;
        if (val) {
          // If category provided, call bookmark endpoint with `category`.
          await fetch(`/api/v3/posts/${pid}/bookmark`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: val })
          });
        } else {
          // val is null/empty: unbookmark on server
          await fetch(`/api/v3/posts/${pid}/unbookmark`, { method: 'POST' });
        }
      } catch (e) {
        // ignore network errors — local assignment still applied
        console.error('Category persist failed', e);
      }

      overlay.style.display = 'none';
      applyFilter();
    });

    overlay.appendChild(sel); overlay.appendChild(save);
    item.style.position = 'relative';
    item.appendChild(overlay);

    // toggle overlay when clicking the post (small icon could be used but keep simple)
    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('contextmenu', function (ev) {
        ev.preventDefault(); overlay.style.display = overlay.style.display === 'none' ? '' : 'none';
      });
    }
  }

  // Add a visible dropdown + assign button under each post item
  function ensureVisibleAssignControls(item) {
    if (item.querySelector('.bookmark-cat-controls')) return;
    const pid = item.getAttribute('data-pid');
    const controls = document.createElement('div');
    controls.className = 'bookmark-cat-controls mt-2 d-flex gap-2 align-items-center';

    const sel = document.createElement('select'); sel.className = 'form-select form-select-sm';
    const noneOpt = document.createElement('option'); noneOpt.value = ''; noneOpt.textContent = '(none)'; sel.appendChild(noneOpt);
    categories.forEach(cat => { const o = document.createElement('option'); o.value = cat; o.textContent = cat; sel.appendChild(o); });
    sel.value = assignments[pid] || '';

    const btn = document.createElement('button'); btn.className = 'btn btn-sm btn-outline-primary'; btn.textContent = 'Assign';
    btn.addEventListener('click', async () => {
      const val = sel.value || null;
      if (val) assignments[pid] = val; else delete assignments[pid];
      saveJSON(STORAGE_ASSIGN, assignments);
      try {
        if (val) {
          await fetch(`/api/v3/posts/${pid}/bookmark`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: val }) });
        } else {
          await fetch(`/api/v3/posts/${pid}/unbookmark`, { method: 'POST' });
        }
      } catch (e) {
        console.error('Category persist failed', e);
      }
      applyFilter();
    });

    controls.appendChild(sel); controls.appendChild(btn);
    item.appendChild(controls);
  }

  function initAssignmentsOnItems() {
    Array.from(list.children).forEach(item => {
      // ensure each post list item has data-pid for mapping; if not present try to read from inner link
      if (!item.getAttribute('data-pid')) {
        const a = item.querySelector('a');
        if (a && a.href) {
          const m = a.href.match(/(?:pid=|post=)(\d+)/);
          if (m) item.setAttribute('data-pid', m[1]);
        }
      }
      ensureAssignOverlay(item);
      ensureVisibleAssignControls(item);
    });
  }

  addBtn.addEventListener('click', () => {
    const v = input.value && input.value.trim(); if (!v) return; if (!categories.includes(v)) categories.push(v);
    saveJSON(STORAGE_CATS, categories); input.value = ''; refreshCategoryOptions();
    // refresh assign overlays to include new category
    Array.from(list.querySelectorAll('.bookmark-cat-assign select')).forEach(sel => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o);
    });
  });

  select.addEventListener('change', applyFilter);

  // initial population
  refreshCategoryOptions(); initAssignmentsOnItems(); applyFilter();
})();
</script>

<!-- IMPORT partials/account/footer.tpl -->