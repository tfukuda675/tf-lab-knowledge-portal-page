(function () {
  'use strict';
  var model = window.PortalModel, catalogApi = window.PortalCatalog;
  var initialCatalog = catalogApi.validate(Object.assign({ schemaVersion: 1 }, window.PORTAL_DATA)).catalog;
  var data = JSON.parse(JSON.stringify(initialCatalog));
  var $ = function (id) { return document.getElementById(id); };
  var state = { section: 'home', category: 'all', type: 'all', query: '', sort: 'updated', layout: 'grid' };
  var saved = { catalog: null, resources: [], courses: [], bookmarks: [], progress: {} }, storageAvailable = true, storageRecovered = false, catalogRecovered = false;
  try {
    var serialized = localStorage.getItem('tsumugu-v1'), raw = null;
    try { raw = JSON.parse(serialized || 'null'); } catch (_) { storageRecovered = true; }
    if (raw && typeof raw === 'object') {
      if (raw.catalog) {
        var restored = catalogApi.validate(raw.catalog);
        if (restored.ok) { saved.catalog = restored.catalog; data = JSON.parse(JSON.stringify(restored.catalog)); }
        else catalogRecovered = true;
      }
      var knownResourceIds = data.resources.map(function (r) { return r.id; });
      saved.resources = Array.isArray(raw.resources) ? raw.resources.filter(function (r) {
        if (!model.validSavedResource(r, data.categories.map(function (c) { return c.id; })) || knownResourceIds.indexOf(r.id) !== -1) return false;
        knownResourceIds.push(r.id); return true;
      }) : [];
      var resourceIds = resources().map(function (r) { return r.id; });
      var courseIds = data.courses.map(function (c) { return c.id; });
      if (Array.isArray(raw.courses)) raw.courses.forEach(function (c) {
        if (model.validSavedCourse(c, resourceIds, courseIds)) {
          saved.courses.push({ id: c.id, title: c.title.trim(), description: c.description, steps: c.steps.slice(), confirmation: c.confirmation, checks: c.confirmation === 'quiz' ? c.checks : {}, label: '自分のコース', color: 'teal', icon: 'book', duration: '自分のペースで' });
          courseIds.push(c.id);
        }
      });
      saved.bookmarks = Array.isArray(raw.bookmarks) ? Array.from(new Set(raw.bookmarks.filter(function (id) { return typeof id === 'string' && resourceIds.indexOf(id) !== -1; }))) : [];
      if (!catalogRecovered && raw.progress && typeof raw.progress === 'object') courses().forEach(function (c) { saved.progress[c.id] = Array.isArray(raw.progress[c.id]) ? Array.from(new Set(raw.progress[c.id].filter(function (id) { return c.steps.indexOf(id) !== -1; }))) : []; });
    }
    localStorage.setItem('tsumugu-storage-check', '1'); localStorage.removeItem('tsumugu-storage-check');
  } catch (_) { storageAvailable = false; $('storage-warning').hidden = false; }
  function persist() { if (storageAvailable) try { localStorage.setItem('tsumugu-v1', JSON.stringify(saved)); } catch (_) { storageAvailable = false; $('storage-warning').hidden = false; } }
  function node(tag, className, content) { var e = document.createElement(tag); if (className) e.className = className; if (content !== undefined) e.textContent = content; return e; }
  var paths = {
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1"/>',
    clipboard: '<rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/>',
    book: '<path d="M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-2-10 1Zm0 0v16"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
    video: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
    file: '<path d="M14 2H5v20h14V7Zm0 0v6h5M8 13h8M8 17h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/>',
    arrow: '<path d="M5 19 19 5M5 5h14v14"/>'
  };
  function icon(name) { var e = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); e.setAttribute('viewBox', '0 0 24 24'); e.setAttribute('aria-hidden', 'true'); e.innerHTML = paths[name] || paths.file; return e; }
  function button(text, className, action) { var b = node('button', className, text); b.type = 'button'; if (action) b.addEventListener('click', action); return b; }
  function resources() { return data.resources.concat(saved.resources); }
  function courses() { return data.courses.concat(saved.courses); }
  function currentCatalog() { return { schemaVersion: 1, categories: data.categories, resources: resources(), courses: courses() }; }
  function category(id) { return data.categories.find(function (c) { return c.id === id; }); }
  var toastTimer;
  function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { $('toast').hidden = true; }, 2600); }
  function openDialog(id) { $(id).showModal(); }
  var stagedCatalog = null, stagedReset = false, importToken = 0;
  function clearStagedImport(message) {
    importToken += 1; stagedCatalog = null; stagedReset = false;
    $('apply-import').disabled = true; $('import-preview').textContent = message || 'JSONファイルを選ぶと検証結果を表示します。';
    $('import-preview').classList.remove('import-error');
  }
  function previewCatalog(catalog, reset) {
    stagedCatalog = catalog; stagedReset = !!reset; $('apply-import').disabled = false;
    $('import-preview').classList.remove('import-error');
    $('import-preview').textContent = (reset ? '配置ファイルの内容に戻します。' : '検証に成功しました。') + '\nカテゴリ ' + catalog.categories.length + ' 件 / 資料 ' + catalog.resources.length + ' 件 / 学習コース ' + catalog.courses.length + ' 件\n現在の一覧全体を置き換えます。変更されたコースや参照資料に関わる進捗は解除されます。';
  }
  function downloadFile(name, content, mime) {
    var url = URL.createObjectURL(new Blob([content], { type: mime })); var anchor = node('a'); anchor.href = url; anchor.download = name;
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }
  function openDataManagement() {
    clearStagedImport(); $('import-json').value = '';
    $('catalog-source').textContent = saved.catalog ? '現在の表示：このブラウザに読み込んだデータ（配置ファイルより優先）' : '現在の表示：配置ファイルのデータと、このブラウザで追加した内容';
    openDialog('data-dialog');
  }
  $('data-management').addEventListener('click', openDataManagement);
  $('data-management-mobile').addEventListener('click', openDataManagement);
  $('data-dialog').addEventListener('close', function () { if (!this.open) clearStagedImport(); });
  $('export-json').addEventListener('click', function () {
    var result = catalogApi.validate(currentCatalog());
    if (!result.ok) { $('import-preview').textContent = '現在のデータを出力できません。\n' + result.errors.join('\n'); return; }
    downloadFile('portal-catalog.json', JSON.stringify(result.catalog, null, 2) + '\n', 'application/json;charset=utf-8');
  });
  $('export-data-script').addEventListener('click', function () {
    try { downloadFile('data.js', catalogApi.toDataScript(currentCatalog()), 'text/javascript;charset=utf-8'); }
    catch (_) { $('import-preview').textContent = '現在のデータを配布用ファイルに変換できません。JSONの内容を確認してください。'; }
  });
  $('import-json').addEventListener('change', function () {
    clearStagedImport(); var token = importToken, file = this.files && this.files[0];
    if (!file) return;
    function failure(text) { if (token !== importToken) return; stagedCatalog = null; $('apply-import').disabled = true; $('import-preview').textContent = text; $('import-preview').classList.add('import-error'); }
    if (file.size > 2 * 1024 * 1024) { failure('ファイルが大きすぎます。2MB以下のJSONファイルを選んでください。'); return; }
    $('import-preview').textContent = 'ファイルを検証しています…';
    var reader = new FileReader();
    reader.onload = function () {
      if (token !== importToken) return;
      var raw;
      try { raw = JSON.parse(String(reader.result).replace(/^\uFEFF/, '')); } catch (_) { failure('JSONの形式が正しくありません。括弧・引用符・カンマを確認してください。'); return; }
      var result = catalogApi.validate(raw);
      if (!result.ok) { failure('読み込めませんでした。次の項目を確認してください。\n' + result.errors.join('\n')); return; }
      previewCatalog(result.catalog, false);
    };
    reader.onerror = function () { failure('ファイルを読み込めませんでした。もう一度ファイルを選んでください。'); };
    reader.onabort = function () { failure('ファイルの読み込みを中止しました。'); };
    reader.readAsText(file, 'UTF-8');
  });
  $('restore-file-data').addEventListener('click', function () { clearStagedImport(); $('import-json').value = ''; previewCatalog(JSON.parse(JSON.stringify(initialCatalog)), true); });
  $('apply-import').addEventListener('click', function () {
    if (!stagedCatalog) return;
    var next = JSON.parse(JSON.stringify(stagedCatalog)), reset = stagedReset;
    var old = currentCatalog(); saved.progress = catalogApi.retainProgress(old, next, saved.progress);
    saved.bookmarks = saved.bookmarks.filter(function (id) { return next.resources.some(function (resource) { return resource.id === id; }); });
    data = next; saved.catalog = reset ? null : JSON.parse(JSON.stringify(next)); saved.resources = []; saved.courses = [];
    draftSteps = []; draftChecks = {}; renderCategoryOptions(); renderDraft(); persist(); navigate('home');
    clearStagedImport(reset ? '配置ファイルのデータに戻しました。' : 'データを置き換えました。このブラウザに反映されています。');
    $('catalog-source').textContent = reset ? '現在の表示：配置ファイルのデータ' : '現在の表示：このブラウザに読み込んだデータ（配置ファイルより優先）';
    toast(reset ? '配置ファイルのデータに戻しました' : 'JSONの内容を反映しました');
  });
  function navigate(section, categoryId) { state.section = section; state.category = categoryId || 'all'; state.type = section === 'procedures' ? '手順書' : 'all'; state.query = ''; $('search').value = ''; render(); }
  var navItems = [['home', 'ホーム', 'home'], ['library', 'すべての資料', 'grid'], ['procedures', '業務の手順', 'clipboard'], ['courses', '学習コース', 'book'], ['bookmarks', 'ブックマーク', 'bookmark']];
  function renderNav() {
    $('main-nav').replaceChildren();
    navItems.forEach(function (item) { var b = button('', 'nav-item' + (state.section === item[0] && state.category === 'all' ? ' active' : ''), function () { navigate(item[0]); }); b.append(icon(item[2]), node('span', '', item[1])); if (item[0] === 'bookmarks') b.append(node('small', 'nav-count', String(saved.bookmarks.length))); if (state.section === item[0] && state.category === 'all') b.setAttribute('aria-current', 'page'); $('main-nav').append(b); });
    $('category-nav').replaceChildren();
    data.categories.forEach(function (c) { var b = button('', 'nav-item category-nav-item' + (state.category === c.id ? ' active' : ''), function () { navigate('library', c.id); }); b.append(node('i', 'category-dot ' + c.color), node('span', '', c.name)); $('category-nav').append(b); });
  }
  function renderCategories() {
    $('category-grid').replaceChildren(); data.categories.forEach(function (c) { var b = button('', 'category-tile', function () { navigate('library', c.id); }); var badge = node('span', 'category-icon ' + c.color); badge.append(icon(c.icon)); var text = node('span', 'category-tile-copy'); text.append(node('strong', '', c.name), node('small', '', resources().filter(function (r) { return r.category === c.id; }).length + ' 件のナレッジ')); b.append(badge, text, node('span', 'tile-chevron', '›')); $('category-grid').append(b); });
  }
  function progress(c) { return (saved.progress[c.id] || []).length; }
  function renderCourses() {
    $('course-grid').replaceChildren(); courses().forEach(function (c) {
      var b = button('', 'course-card ' + c.color, function () { showCourse(c.id); }); var visual = node('div', 'course-visual'); var courseIcon = node('span', 'course-art-icon'); courseIcon.append(icon(c.icon)); var route = node('div', 'course-route'); c.steps.slice(0, 4).forEach(function (id, index) { route.append(node('span', (saved.progress[c.id] || []).indexOf(id) !== -1 ? 'completed' : '', String(index + 1).padStart(2, '0'))); }); if (c.steps.length > 4) route.append(node('span', 'route-overflow', '+' + (c.steps.length - 4))); visual.append(node('span', 'course-label', c.label), courseIcon, route); var body = node('div', 'course-body'); body.append(node('h3', '', c.title), node('p', '', c.description)); var meta = node('div', 'course-meta'); meta.append(node('span', '', c.steps.length + ' ステップ · ' + c.duration), node('span', '', progress(c) ? progress(c) + '/' + c.steps.length + ' 完了' : '→')); body.append(meta); if (progress(c)) { var track = node('div', 'progress-track'); var fill = node('span'); fill.style.width = progress(c) / c.steps.length * 100 + '%'; track.append(fill); body.append(track); } b.append(visual, body); $('course-grid').append(b);
    });
    if (!courses().length) $('course-grid').append(node('p', 'catalog-empty', '学習コースはまだありません。「学習コースを作成」から資料を順番にまとめられます。'));
  }
  function resourceIcon(r) { return r.type === '動画' ? 'video' : r.type === 'Web' ? 'globe' : r.type === '手順書' ? 'clipboard' : r.type === 'Wiki' ? 'book' : 'file'; }
  function toggleBookmark(id) { var index = saved.bookmarks.indexOf(id); if (index === -1) saved.bookmarks.push(id); else saved.bookmarks.splice(index, 1); persist(); renderNav(); renderResources(); toast(index === -1 ? 'ブックマークに追加しました' : 'ブックマークを解除しました'); }
  function renderResources() {
    var filtered = model.filterResources(resources(), { query: state.query, category: state.category, type: state.type, sort: state.sort, bookmarksOnly: state.section === 'bookmarks', bookmarks: saved.bookmarks });
    var visible = state.section === 'home' ? filtered.slice(0, 6) : filtered;
    $('resource-grid').className = 'resource-grid' + (state.layout === 'list' ? ' list-layout' : ''); $('resource-grid').replaceChildren();
    visible.forEach(function (r) {
      var card = node('article', 'resource-card'); var top = node('div', 'resource-card-top'); var badge = node('span', 'type-badge type-' + resourceIcon(r)); badge.append(icon(resourceIcon(r)), document.createTextNode(r.type)); var mark = button('', 'bookmark-button' + (saved.bookmarks.indexOf(r.id) !== -1 ? ' is-saved' : ''), function () { toggleBookmark(r.id); }); mark.setAttribute('aria-label', r.title + 'をブックマーク' + (saved.bookmarks.indexOf(r.id) !== -1 ? 'から解除' : 'に追加')); mark.setAttribute('aria-pressed', saved.bookmarks.indexOf(r.id) !== -1 ? 'true' : 'false'); mark.append(icon('bookmark')); top.append(badge, mark); var title = node('h3'); title.append(button(r.title, 'resource-title', function () { showResource(r.id); })); var tags = node('div', 'resource-tags'); r.tags.slice(0, 3).forEach(function (tag) { tags.append(button('# ' + tag, '', function () { state.query = tag; $('search').value = tag; state.section = 'library'; render(); })); }); var bottom = node('div', 'resource-bottom'); bottom.append(node('span', '', category(r.category).name), node('time', '', r.updated.replaceAll('-', '.'))); var sample = node('span', 'resource-status', r.url ? (r.owner === '公開参考資料' ? '公開参考資料 ↗' : '資料リンク ↗') : 'サンプル'); card.append(top, title, node('p', 'resource-description', r.description), tags, bottom, sample); $('resource-grid').append(card);
    });
    $('result-count').textContent = state.section === 'home' ? '最近更新された ' + visible.length + ' 件' : filtered.length + ' 件の資料'; $('empty-state').hidden = filtered.length !== 0;
    $('active-filters').replaceChildren(); if (state.category !== 'all') $('active-filters').append(button(category(state.category).name + ' ×', 'filter-chip', function () { state.category = 'all'; render(); })); $('active-filters').hidden = state.category === 'all';
    $('type-tabs').replaceChildren(); ['all', 'Wiki', '資料', '動画', 'Web', '手順書'].forEach(function (type) { var b = button(type === 'all' ? 'すべて' : type, 'type-tab' + (state.type === type ? ' active' : ''), function () { state.type = type; if (state.section === 'home') state.section = 'library'; render(); }); b.setAttribute('aria-pressed', String(state.type === type)); $('type-tabs').append(b); });
    $('grid-view').setAttribute('aria-pressed', String(state.layout === 'grid')); $('list-view').setAttribute('aria-pressed', String(state.layout === 'list'));
  }
  function renderUpdates() { $('updates-list').replaceChildren(); resources().slice().sort(function (a, b) { return b.updated.localeCompare(a.updated); }).slice(0, 4).forEach(function (r, index) { var b = button('', 'update-item', function () { showResource(r.id); }); var symbol = node('span', 'update-icon ' + category(r.category).color); symbol.append(icon(resourceIcon(r))); var text = node('span'); text.append(node('small', '', r.updated.replaceAll('-', '.') + ' · ' + (index === 0 ? 'NEW' : '更新')), node('strong', '', r.title)); b.append(symbol, text); $('updates-list').append(b); }); }
  function render() {
    var isHome = state.section === 'home', isCourses = state.section === 'courses'; var labels = { home: 'ホーム', library: 'すべての資料', procedures: '業務の手順', courses: '学習コース', bookmarks: 'ブックマーク' };
    $('breadcrumb-current').textContent = state.category !== 'all' ? category(state.category).name : labels[state.section]; $('page-title').textContent = isHome ? '知識がつながる、仕事がすすむ。' : state.category !== 'all' ? category(state.category).name : labels[state.section]; $('page-description').textContent = isHome ? '探していた資料も、次の学びも。ここから見つけましょう。' : isCourses ? 'ひとつずつ、着実に。チームの知識を自分の力に。' : state.section === 'bookmarks' ? 'あとで読みたい資料や、よく使う手順を手元に。' : '必要な知識を、キーワードやカテゴリから見つけましょう。';
    $('home-hero').hidden = !isHome; $('category-section').hidden = !isHome; $('learning-section').hidden = !isHome && !isCourses; $('resources-section').hidden = isCourses; $('right-rail').hidden = !isHome; $('view-all').hidden = !isHome; document.querySelector('.content-columns').classList.toggle('full-width', !isHome); renderNav(); renderCategories(); renderCourses(); renderResources(); renderUpdates();
    $('onboarding-button').disabled = courses().length === 0;
    $('onboarding-button').textContent = courses().length ? 'はじめのコースを見る →' : '学習コースは未登録です';
    ['add-button', 'sidebar-add', 'rail-add'].forEach(function (id) { $(id).disabled = data.categories.length === 0; });
  }
  function dialogContent(title, eyebrow) { $('content-title').textContent = title; $('content-eyebrow').textContent = eyebrow; $('content-body').replaceChildren(); return $('content-body'); }
  function showResource(id) { var r = resources().find(function (item) { return item.id === id; }); if (!r) return; var body = dialogContent(r.title, r.type + ' / ' + category(r.category).name); body.append(node('p', 'detail-description', r.description)); var meta = node('p', 'detail-meta', r.owner + ' · 更新 ' + r.updated); body.append(meta); if (model.safeUrl(r.url)) { var a = node('a', 'primary-button external-link', '資料を開く ↗'); a.href = model.safeUrl(r.url); a.target = '_blank'; a.rel = 'noopener noreferrer'; body.append(a); } else { var sample = node('div', 'sample-detail'); sample.append(node('strong', '', 'サンプル資料・リンク未設定'), node('p', '', 'これはポータルの掲載例です。実際の資料を利用するには「リンクを追加」から社内のURLを登録してください。')); body.append(sample); } openDialog('content-dialog'); }
  var draftSteps = [], draftChecks = {};
  function renderDraft() {
    var select = $('course-resource-select');
    select.replaceChildren();
    resources().filter(function (r) { return draftSteps.indexOf(r.id) === -1; }).forEach(function (r) {
      var option = node('option', '', r.title + (r.url ? '' : '（サンプル）'));
      option.value = r.id; select.append(option);
    });
    select.disabled = select.options.length === 0;
    $('course-add-step').disabled = select.disabled;
    $('course-draft-status').textContent = draftSteps.length ? draftSteps.length + ' ステップ · 上下ボタンで順序を変更できます。' : 'まだ資料がありません。上の一覧から資料を追加してください。';
    $('course-draft-steps').replaceChildren();
    draftSteps.forEach(function (id, index) {
      var r = resources().find(function (item) { return item.id === id; });
      var li = node('li', 'draft-step'); li.dataset.resourceId = id;
      var heading = node('div', 'draft-step-heading');
      var text = node('div', 'draft-step-copy'); text.append(node('span', 'step-number', 'STEP ' + String(index + 1).padStart(2, '0')), node('strong', '', r.title), node('small', '', r.type + (r.url ? '' : ' · サンプル・リンク未設定')));
      var controls = node('div', 'draft-step-controls');
      var up = button('↑', 'secondary-button draft-up', function () { var previous = draftSteps[index - 1]; draftSteps[index - 1] = id; draftSteps[index] = previous; renderDraft(); $('course-draft-steps').children[index - 1].querySelector('.draft-down').focus(); });
      up.disabled = index === 0; up.setAttribute('aria-label', r.title + 'を上へ移動');
      var down = button('↓', 'secondary-button draft-down', function () { var next = draftSteps[index + 1]; draftSteps[index + 1] = id; draftSteps[index] = next; renderDraft(); $('course-draft-steps').children[index + 1].querySelector('.draft-up').focus(); });
      down.disabled = index === draftSteps.length - 1; down.setAttribute('aria-label', r.title + 'を下へ移動');
      var remove = button('削除', 'subtle-button draft-remove', function () { draftSteps.splice(index, 1); delete draftChecks[id]; renderDraft(); $('course-resource-select').focus(); }); remove.setAttribute('aria-label', r.title + 'をコースから削除');
      controls.append(up, down, remove); heading.append(text, controls); li.append(heading);
      if ($('course-confirmation').value === 'quiz') li.append(quizEditor(id, index));
      $('course-draft-steps').append(li);
    });
  }
  function quizEditor(id, index) {
    var check = draftChecks[id] || (draftChecks[id] = { question: '', options: ['', '', ''], answer: 0 });
    var fieldset = node('fieldset', 'quiz-editor'); fieldset.append(node('legend', '', 'ステップ ' + (index + 1) + ' の確認問題'));
    function field(labelText, fieldName, value, max, update) { var label = node('label', '', labelText); var input = node('input'); input.type = 'text'; input.value = value; input.maxLength = max; input.required = true; input.dataset.field = fieldName; input.addEventListener('input', function () { update(input.value); }); label.append(input); fieldset.append(label); }
    field('問題', 'question', check.question, 300, function (value) { check.question = value; });
    check.options.forEach(function (option, optionIndex) { field('選択肢 ' + (optionIndex + 1), 'option-' + optionIndex, option, 200, function (value) { check.options[optionIndex] = value; }); });
    var label = node('label', '', '正解の選択肢'); var select = node('select'); select.dataset.field = 'answer';
    [0, 1, 2].forEach(function (number) { var option = node('option', '', '選択肢 ' + (number + 1)); option.value = String(number); select.append(option); });
    select.value = String(check.answer); select.addEventListener('change', function () { check.answer = Number(select.value); }); label.append(select); fieldset.append(label); return fieldset;
  }
  $('create-course').addEventListener('click', function () { $('course-form').reset(); draftSteps = []; draftChecks = {}; $('course-form-error').hidden = true; renderDraft(); openDialog('course-dialog'); });
  $('course-add-step').addEventListener('click', function () { var id = $('course-resource-select').value; if (id && draftSteps.indexOf(id) === -1) { draftSteps.push(id); renderDraft(); } });
  $('course-confirmation').addEventListener('change', renderDraft);
  $('course-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var title = $('course-title').value.trim(), mode = $('course-confirmation').value;
    var custom = { id: 'user-course-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), title: title, description: $('course-description').value.trim(), steps: draftSteps.slice(), confirmation: mode, checks: {}, label: '自分のコース', color: 'teal', icon: 'book', duration: '自分のペースで' };
    if (mode === 'quiz') draftSteps.forEach(function (id) { var check = draftChecks[id]; custom.checks[id] = { question: check.question.trim(), options: check.options.map(function (option) { return option.trim(); }), answer: check.answer }; });
    if (!model.validSavedCourse(custom, resources().map(function (r) { return r.id; }), courses().map(function (c) { return c.id; }))) {
      $('course-form-error').textContent = !title ? 'コース名を入力してください。' : !draftSteps.length ? '資料を1件以上追加してください。' : '各ステップに問題と異なる3つの選択肢、正解を設定してください。'; $('course-form-error').hidden = false; return;
    }
    saved.courses.push(custom); persist(); $('course-dialog').close(); navigate('courses'); toast('学習コースを作成しました');
  });
  function showCourse(id) {
    var c = courses().find(function (item) { return item.id === id; });
    if (!c) return;
    var quizMode = c.confirmation === 'quiz';
    var body = dialogContent(c.title, 'LEARNING PATH / ' + c.steps.length + ' ステップ · ' + c.duration);
    body.append(node('p', 'detail-description', c.description));
    body.append(node('p', 'course-help', quizMode ? '番号順に資料を確認し、各ステップの確認問題に正解すると完了になります。問題は理解を振り返るためのもので、読了や視聴の事実を自動で証明するものではありません。' : '上から順に資料を確認し、学んだステップに自分でチェックを入れましょう。読了は自己申告です。サンプル資料は内容の紹介のみです。'));
    var status = node('p', 'course-status', progress(c) + ' / ' + c.steps.length + ' ステップ完了'); body.append(status);
    function markStep(resourceId, complete) {
      var completed = saved.progress[c.id] || [];
      saved.progress[c.id] = complete ? Array.from(new Set(completed.concat(resourceId))) : completed.filter(function (item) { return item !== resourceId; });
      persist(); status.textContent = progress(c) + ' / ' + c.steps.length + ' ステップ完了'; renderCourses();
    }
    var list = node('ol', 'course-steps');
    c.steps.forEach(function (resourceId, index) {
      var r = resources().find(function (item) { return item.id === resourceId; });
      var complete = (saved.progress[c.id] || []).indexOf(resourceId) !== -1;
      var li = node('li'); li.dataset.resourceId = resourceId;
      if (!quizMode) {
        var check = node('input'); check.type = 'checkbox'; check.checked = complete; check.setAttribute('aria-label', r.title + 'を完了');
        check.addEventListener('change', function () { markStep(resourceId, check.checked); }); li.append(check);
      } else li.append(node('span', 'quiz-step-state', complete ? '✓' : String(index + 1)));
      var text = node('div', 'course-step-content');
      text.append(node('span', 'step-number', 'STEP ' + String(index + 1).padStart(2, '0')), node('h3', '', r.title), node('p', '', r.description));
      if (model.safeUrl(r.url)) { var a = node('a', 'step-link', '資料を開く ↗'); a.href = model.safeUrl(r.url); a.target = '_blank'; a.rel = 'noopener noreferrer'; text.append(a); }
      else text.append(node('span', 'step-link sample-label', 'サンプル · リンク未設定'));
      if (quizMode) {
        var quiz = c.checks[resourceId], quizBlock = node('fieldset', 'quiz-question');
        quizBlock.append(node('legend', '', quiz.question));
        var options = node('div', 'quiz-options');
        quiz.options.forEach(function (option, optionIndex) {
          var label = node('label'); var radio = node('input'); radio.type = 'radio'; radio.name = c.id + '-' + resourceId; radio.value = String(optionIndex); radio.disabled = complete;
          label.append(radio, document.createTextNode(option)); options.append(label);
        });
        var feedback = node('p', 'quiz-feedback', complete ? '正解済み · このステップは完了です。' : '選択肢を選んで回答を確認してください。'); feedback.setAttribute('role', 'status');
        var answer = button(complete ? '完了' : '回答を確認', 'primary-button quiz-answer-button', function () {
          var selected = options.querySelector('input:checked');
          if (!selected) { feedback.textContent = '回答を選択してください。'; return; }
          if (Number(selected.value) !== quiz.answer) { feedback.textContent = 'もう一度、資料の内容を確認して回答してみましょう。'; feedback.dataset.result = 'incorrect'; return; }
          markStep(resourceId, true); feedback.textContent = '正解です。このステップが完了しました。'; feedback.dataset.result = 'correct'; answer.disabled = true; answer.textContent = '完了'; li.querySelector('.quiz-step-state').textContent = '✓'; options.querySelectorAll('input').forEach(function (radio) { radio.disabled = true; });
        }); answer.disabled = complete;
        quizBlock.append(options, answer, feedback); text.append(quizBlock);
      }
      li.append(text); list.append(li);
    });
    body.append(list); openDialog('content-dialog');
  }
  function showGuide() { var body = dialogContent('このポータルの使い方', 'WELCOME TO TSUMUGU'); [['探す', '検索窓に資料名やタグを入力し、カテゴリと資料種別で絞り込めます。'], ['ためる', '資料のしおりアイコンで、よく使うリンクをブックマークに保存できます。'], ['順番に学ぶ', '「学習コースを作成」から資料を選び、上下ボタンで順序を指定できます。本人チェック、またはステップごとの確認問題に正解する方法で完了を記録します。読了チェックは自己申告で、確認問題も読了や視聴を自動で証明するものではありません。'], ['共有する', '「リンクを追加」から社内資料のURLを登録できます。このサンプルでは登録内容はこのブラウザ内に保存され、他の利用者には共有されません。']].forEach(function (item) { body.append(node('h3', 'guide-heading', item[0]), node('p', 'detail-description', item[1])); }); body.append(node('p', 'form-note', '認証・部門全員でのデータ共有には、サーバーとアクセス管理の追加が必要です。')); openDialog('content-dialog'); }
  ['add-button', 'sidebar-add', 'rail-add'].forEach(function (id) { $(id).addEventListener('click', function () { $('add-form').reset(); $('form-error').hidden = true; openDialog('add-dialog'); }); });
  function renderCategoryOptions() {
    $('add-category').replaceChildren();
    data.categories.forEach(function (c) { var option = node('option', '', c.name); option.value = c.id; $('add-category').append(option); });
  }
  renderCategoryOptions();
  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { b.closest('dialog').close(); }); });
  document.querySelectorAll('dialog').forEach(function (dialog) { dialog.addEventListener('click', function (event) { if (event.target === dialog) { var rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }); });
  $('add-form').addEventListener('submit', function (event) { event.preventDefault(); var form = new FormData(event.target); var url = model.safeUrl(String(form.get('url'))); var title = String(form.get('title')).trim(); if (!url || !title) { $('form-error').textContent = !title ? 'タイトルを入力してください。' : 'http または https の有効なURLを入力してください。認証情報を含むURLは登録できません。'; $('form-error').hidden = false; return; } var now = new Date(); var date = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0'); saved.resources.unshift({ id: 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), title: title, url: url, category: String(form.get('category')), type: String(form.get('type')), description: String(form.get('description')).trim(), tags: String(form.get('tags')).split(/[,、]/).map(function (tag) { return tag.trim().replace(/^#\s*/, '').slice(0, 30); }).filter(Boolean).slice(0, 10), updated: date, owner: '自分が追加' }); persist(); $('add-dialog').close(); navigate('library'); toast('リンクを追加しました'); });
  $('search').addEventListener('input', function () { state.query = this.value; if (state.section === 'home' || state.section === 'courses') state.section = 'library'; render(); });
  $('sort').addEventListener('change', function () { state.sort = this.value; renderResources(); });
  $('grid-view').append(icon('grid')); $('list-view').append(icon('list'));
  $('grid-view').addEventListener('click', function () { state.layout = 'grid'; renderResources(); }); $('list-view').addEventListener('click', function () { state.layout = 'list'; renderResources(); });
  $('view-all').addEventListener('click', function () { navigate('library'); }); $('reset-filters').addEventListener('click', function () { navigate(state.section === 'bookmarks' ? 'bookmarks' : 'library'); }); $('hero-course').addEventListener('click', function () { navigate('courses'); }); $('onboarding-button').addEventListener('click', function () { var first = courses()[0]; if (first) showCourse(first.id); }); $('guide-button').addEventListener('click', showGuide);
  render();
  if (catalogRecovered) toast('保存された一覧を読み込めなかったため、配置ファイルのデータを表示しています。');
  else if (storageRecovered) toast('保存データを読み込めなかったため、初期表示に戻しました。新しい操作は保存できます。');
})();
