(function () {
  'use strict';
  var data = window.PORTAL_DATA, model = window.PortalModel;
  var $ = function (id) { return document.getElementById(id); };
  var state = { query: '', category: 'all', type: 'all', sort: 'updated', savedOnly: false, layout: 'grid' };
  var bookmarks = [], storageAvailable = true, timer;
  try {
    var raw;
    try { raw = JSON.parse(localStorage.getItem('tsumugu-sample-shelf-v1') || '[]'); } catch (_) { raw = []; }
    if (Array.isArray(raw)) bookmarks = Array.from(new Set(raw.filter(function (id) { return data.resources.some(function (r) { return r.id === id; }); })));
    localStorage.setItem('shelf-storage-probe', '1'); localStorage.removeItem('shelf-storage-probe');
  } catch (_) { storageAvailable = false; $('storage-warning').hidden = false; }
  function node(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function button(text, cls, action) { var b = node('button', cls, text); b.type = 'button'; b.addEventListener('click', action); return b; }
  function category(id) { return data.categories.find(function (c) { return c.id === id; }); }
  function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(timer); timer = setTimeout(function () { $('toast').hidden = true; }, 2200); }
  function persist() { if (storageAvailable) try { localStorage.setItem('tsumugu-sample-shelf-v1', JSON.stringify(bookmarks)); } catch (_) { storageAvailable = false; $('storage-warning').hidden = false; } }
  function toggleSaved(id) {
    if (bookmarks.indexOf(id) === -1) bookmarks.push(id); else bookmarks = bookmarks.filter(function (value) { return value !== id; });
    persist(); render(); toast(bookmarks.indexOf(id) !== -1 ? 'あとで読むに保存しました' : 'あとで読むから外しました');
  }
  function markButton(r) {
    var active = bookmarks.indexOf(r.id) !== -1;
    var b = button('', 'save-button' + (active ? ' saved' : ''), function () { toggleSaved(r.id); });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', 'M6 3h12v18l-6-4-6 4Z'); svg.append(path); b.append(svg);
    b.setAttribute('aria-label', r.title + (active ? 'をあとで読むから外す' : 'をあとで読むに保存'));
    b.setAttribute('aria-pressed', String(active)); b.dataset.bookmarkId = r.id; return b;
  }
  function renderNav() {
    $('all-count').textContent = data.resources.length;
    $('saved-count').textContent = bookmarks.length;
    $('all-resources').classList.toggle('active', !state.savedOnly);
    $('all-resources').setAttribute('aria-pressed', String(!state.savedOnly));
    $('read-later').classList.toggle('active', state.savedOnly);
    $('read-later').setAttribute('aria-pressed', String(state.savedOnly));
    $('category-nav').replaceChildren();
    data.categories.forEach(function (c) {
      var b = button('', 'category-button' + (state.category === c.id ? ' active' : ''), function () { state.category = state.category === c.id ? 'all' : c.id; render(); });
      b.dataset.category = c.id; b.setAttribute('aria-pressed', String(state.category === c.id));
      b.append(node('i', 'category-dot ' + c.color), node('span', '', c.name), node('small', '', String(data.resources.filter(function (r) { return r.category === c.id; }).length)));
      $('category-nav').append(b);
    });
  }
  function renderCollections() {
    var collections = [
      { id: 'onboarding', title: 'チームを知る、最初の一冊。', copy: '新しい仲間のためのガイド', label: 'WELCOME COLLECTION', cls: 'welcome', spine: ['TEAM', 'HELLO', 'START'] },
      { id: 'technology', title: 'つくる人の、道具箱。', copy: '開発を支える知識と手順', label: 'BUILD & CREATE', cls: 'technology', spine: ['CODE', 'GIT', 'BUILD'] },
      { id: 'learning', title: '学びを、ひらく。', copy: '伝える力とチームの学び', label: 'LEARN SOMETHING', cls: 'learning', spine: ['IDEA', 'NOTE', 'LEARN'] }
    ];
    $('collections').replaceChildren();
    collections.forEach(function (c) {
      var b = button('', 'collection ' + c.cls, function () { state.category = c.id; state.savedOnly = false; state.query = ''; $('shelf-search').value = ''; render(); $('catalog-title').scrollIntoView({ block: 'start' }); });
      b.dataset.collection = c.id;
      var art = node('span', 'book-art'); art.setAttribute('aria-hidden', 'true'); c.spine.forEach(function (title) { art.append(node('i', '', title)); });
      var copy = node('span', 'collection-copy'); copy.append(node('small', '', c.label), node('strong', '', c.title), node('span', '', c.copy + '　↗'));
      b.append(art, copy); $('collections').append(b);
    });
  }
  function render() {
    renderNav();
    var resources = model.filterResources(data.resources, { query: state.query, category: state.category, type: state.type, sort: state.sort, bookmarksOnly: state.savedOnly, bookmarks: bookmarks });
    $('catalog-title').textContent = state.savedOnly ? 'あとで読む本棚' : state.category !== 'all' ? category(state.category).name : 'みんなの本棚';
    $('result-count').textContent = resources.length + ' 件の資料' + (state.savedOnly ? 'を保存しています' : 'が見つかりました');
    $('resource-grid').className = 'resource-grid' + (state.layout === 'list' ? ' list-layout' : '');
    $('resource-grid').replaceChildren();
    resources.forEach(function (r) {
      var card = node('article', 'resource-card ' + category(r.category).color), top = node('div', 'card-top');
      top.append(node('span', 'type-badge', r.type), markButton(r));
      var title = node('h3'); title.append(button(r.title, 'resource-title', function () { showDetail(r); }));
      var tags = node('div', 'tags'); r.tags.forEach(function (tag) { tags.append(node('span', '', '# ' + tag)); });
      var bottom = node('div', 'card-bottom'); bottom.append(node('span', '', category(r.category).name), node('time', '', r.updated.replaceAll('-', '.')));
      card.append(top, title, node('p', 'description', r.description), tags, bottom, node('small', 'sample-status', r.url ? '公開参考資料 ↗' : 'サンプル · リンク未設定'));
      $('resource-grid').append(card);
    });
    $('empty-state').hidden = resources.length > 0;
    $('grid-view').setAttribute('aria-pressed', String(state.layout === 'grid')); $('list-view').setAttribute('aria-pressed', String(state.layout === 'list'));
    $('active-filter').replaceChildren();
    if (state.category !== 'all') $('active-filter').append(button(category(state.category).name + ' ×', 'filter-chip', function () { state.category = 'all'; render(); }));
    $('active-filter').hidden = state.category === 'all';
  }
  function showDetail(r) {
    $('detail-type').textContent = r.type + ' / ' + category(r.category).name; $('detail-title').textContent = r.title;
    var body = $('detail-body'); body.replaceChildren(); body.append(node('p', 'detail-description', r.description), node('p', 'detail-meta', r.owner + ' · 更新 ' + r.updated));
    var url = model.safeUrl(r.url);
    if (url) { var a = node('a', 'primary', '資料を開く ↗'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; body.append(a); }
    else { var sample = node('div', 'sample-detail'); sample.append(node('strong', '', 'サンプル資料・リンク未設定'), node('p', '', 'これは資料の掲載例です。実際の社内資料を利用する場合は、共通データのURLを差し替えてください。')); body.append(sample); }
    var save = button('', 'detail-save', function () { toggleSaved(r.id); refresh(); });
    function refresh() { save.textContent = bookmarks.indexOf(r.id) === -1 ? 'あとで読むに保存する' : 'あとで読むから外す'; save.setAttribute('aria-pressed', String(bookmarks.indexOf(r.id) !== -1)); }
    refresh(); body.append(save); $('resource-dialog').showModal();
  }
  function reset() { state.query = ''; state.category = 'all'; state.type = 'all'; state.savedOnly = false; $('shelf-search').value = ''; $('type-filter').value = 'all'; render(); }
  $('shelf-search').addEventListener('input', function () { state.query = this.value; render(); });
  $('type-filter').addEventListener('change', function () { state.type = this.value; render(); });
  $('sort-order').addEventListener('change', function () { state.sort = this.value; render(); });
  $('all-resources').addEventListener('click', reset);
  $('read-later').addEventListener('click', function () { state.savedOnly = true; state.category = 'all'; state.type = 'all'; state.query = ''; $('shelf-search').value = ''; $('type-filter').value = 'all'; render(); });
  $('grid-view').addEventListener('click', function () { state.layout = 'grid'; render(); });
  $('list-view').addEventListener('click', function () { state.layout = 'list'; render(); });
  $('reset-filters').addEventListener('click', reset); $('close-dialog').addEventListener('click', function () { $('resource-dialog').close(); });
  renderCollections(); render();
})();
