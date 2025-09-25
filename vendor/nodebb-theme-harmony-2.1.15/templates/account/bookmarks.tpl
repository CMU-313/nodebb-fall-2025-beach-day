<!-- IMPORT partials/account/header.tpl -->

<!-- Header area with title + category management -->
<div class="mb-3 d-flex align-items-center justify-content-between gap-3">
  <h3 class="fw-semibold fs-5">Bookmarks</h3>
  <div class="d-flex gap-2 align-items-center">
    <!-- Dropdown for filtering by category -->
    <select id="bookmark-category-select" class="form-select form-select-sm">
      <option value="__all__">All</option>
    </select>
    <!-- Input to add a new category -->
    <input id="bookmark-category-input" class="form-control form-control-sm" placeholder="New category">
    <!-- Button to add new category -->
    <button id="bookmark-category-add" class="btn btn-sm btn-primary">Add</button>
  </div>
</div>

<!-- Posts container (shown in rows now instead of horizontal scroll) -->
<div>
  <ul component="posts" id="bookmarks-list" 
      class="posts-list list-unstyled d-flex flex-column gap-3" 
      data-nextstart="{nextStart}">
    {{{ each posts }}}
      <!-- Render each bookmarked post using partial -->
      <!-- IMPORT partials/posts_list_item.tpl -->
    {{{ end }}}
  </ul>
</div>

<!-- Loading spinner while more posts load -->
<div component="posts/loading" class="loading-indicator text-center hidden">
  <i class="fa fa-refresh fa-spin"></i>
</div>

<script>
;(function () {
  // LocalStorage keys for categories & assignments
  const STORAGE_CATS = 'bookmarkCategories';
  const STORAGE_ASSIGN = 'bookmarkAssignments';

  // Helpers to read/write JSON safely from localStorage
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // Load saved categories and assignments (postID -> category)
  const categories = loadJSON(STORAGE_CATS, []);
  const assignments = loadJSON(STORAGE_ASSIGN, {});

  // DOM elements
  const select = document.getElementById('bookmark-category-select');
  const input = document.getElementById('bookmark-category-input');
  const addBtn = document.getElementById('bookmark-category-add');
  const list = document.getElementById('bookmarks-list');

  // Refresh dropdown options when categories change
  function refreshCategoryOptions() {
    // Remove old options (except "All")
    Array.from(select.options).forEach(opt => { if (opt.value !== '__all__') opt.remove(); });
    // Add each category to dropdown
    categories.forEach(cat => {
      const o = document.createElement('option'); 
      o.value = cat; 
      o.textContent = cat; 
      select.appendChild(o);
    });
  }

  // Filter posts by currently selected category
  function applyFilter() {
    const chosen = select.value;
    Array.from(list.children).forEach(item => {
      const pid = item.getAttribute('data-pid');
      const assigned = assignments[pid] || '';
      // Show all posts OR only ones in chosen category
      item.style.display = (chosen === '__all__' || chosen === assigned) ? '' : 'none';
    });
  }

  // Add category dropdown to each post (auto-assigns on change)
  function ensureVisibleAssignControls(item) {
    if (item.querySelector('.bookmark-cat-controls')) return; // Skip if already added

    const pid = item.getAttribute('data-pid');
    const controls = document.createElement('div');
    controls.className = 'bookmark-cat-controls mt-2';

    // Build dropdown with categories + "(none)" option
    const sel = document.createElement('select'); 
    sel.className = 'form-select form-select-sm';
    const noneOpt = document.createElement('option'); 
    noneOpt.value = ''; 
    noneOpt.textContent = '(none)'; 
    sel.appendChild(noneOpt);

    categories.forEach(cat => { 
      const o = document.createElement('option'); 
      o.value = cat; 
      o.textContent = cat; 
      sel.appendChild(o); 
    });
    sel.value = assignments[pid] || '';

    // When user changes category, auto-save and sync with server
    sel.addEventListener('change', async () => {
      const val = sel.value || null;

      // Update local assignment map
      if (val) assignments[pid] = val; 
      else delete assignments[pid];
      saveJSON(STORAGE_ASSIGN, assignments);

      // Try to persist change on server
      try {
        if (val) {
          await fetch(`/api/v3/posts/${pid}/bookmark`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ category: val }) 
          });
        } else {
          await fetch(`/api/v3/posts/${pid}/unbookmark`, { method: 'POST' });
        }
      } catch (e) {
        console.error('Category persist failed', e);
      }

      // Re-apply filter so only matching posts show
      applyFilter();
    });

    // Append dropdown to post
    controls.appendChild(sel);
    item.appendChild(controls);
  }

  // Initialize category controls for all posts
  function initAssignmentsOnItems() {
    Array.from(list.children).forEach(item => {
      // Ensure post has a data-pid (fall back to parsing link if needed)
      if (!item.getAttribute('data-pid')) {
        const a = item.querySelector('a');
        if (a && a.href) {
          const m = a.href.match(/(?:pid=|post=)(\d+)/);
          if (m) item.setAttribute('data-pid', m[1]);
        }
      }
      ensureVisibleAssignControls(item);
    });
  }

  // Add new category on button click
  addBtn.addEventListener('click', () => {
    const v = input.value && input.value.trim(); 
    if (!v) return; 
    if (!categories.includes(v)) categories.push(v);

    // Save and refresh UI
    saveJSON(STORAGE_CATS, categories); 
    input.value = ''; 
    refreshCategoryOptions();

    // Add new category to all post dropdowns too
    Array.from(list.querySelectorAll('.bookmark-cat-controls select')).forEach(sel => {
      const o = document.createElement('option'); 
      o.value = v; 
      o.textContent = v; 
      sel.appendChild(o);
    });
  });

  // Filter posts when category is changed in header dropdown
  select.addEventListener('change', applyFilter);

  // Initialize UI on load
  refreshCategoryOptions(); 
  initAssignmentsOnItems(); 
  applyFilter();
})();
</script>

<!-- IMPORT partials/account/footer.tpl -->