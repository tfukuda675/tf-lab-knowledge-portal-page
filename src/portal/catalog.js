/* JSONカタログの検証・正規化。DOM、保存先、通信には依存しません。 */
(function (root) {
  'use strict';
  var icons = ['home', 'grid', 'list', 'clipboard', 'book', 'bookmark', 'compass', 'code', 'video', 'file', 'globe', 'arrow'];
  var colors = ['teal', 'blue', 'violet', 'orange'];
  var types = ['Wiki', '資料', '動画', 'Web', '手順書'];
  var reserved = new Set(Object.getOwnPropertyNames(Object.prototype).concat(['__proto__', 'prototype']));
  function object(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === null || (Object.getPrototypeOf(prototype) === null && Object.prototype.hasOwnProperty.call(prototype, 'constructor') && typeof prototype.constructor === 'function' && Function.prototype.toString.call(prototype.constructor) === Function.prototype.toString.call(Object));
  }
  function safeUrl(value) {
    if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return null;
    try { var url = new URL(value.trim()); return /^(http|https):$/.test(url.protocol) && !url.username && !url.password ? url.href : null; } catch (_) { return null; }
  }
  function realDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var date = new Date(value + 'T00:00:00Z'); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function validate(raw) {
    var errors = [];
    function error(message) { if (errors.length < 30) errors.push(message); }
    var ancestors = new Set(), visited = 0;
    function scan(value, path, depth) {
      if (!value || typeof value !== 'object') return;
      if (++visited > 40000) { error('データの構造が大きすぎます。不要な項目を減らしてください。'); return; }
      if (depth > 20 || ancestors.has(value)) { error(path + ': 入れ子が深すぎるか循環しています。'); return; }
      if (!Array.isArray(value) && !object(value)) { error(path + ': JSONのオブジェクトを指定してください。'); return; }
      ancestors.add(value);
      Object.keys(value).forEach(function (key) {
        if (reserved.has(key)) error(path + ': 予約された項目名「' + key + '」は使えません。');
        else if (visited <= 40000) scan(value[key], path + '.' + key, depth + 1);
      });
      ancestors.delete(value);
    }
    if (!object(raw)) return { ok: false, catalog: null, errors: ['カタログ全体をJSONオブジェクトで指定してください。'] };
    scan(raw, 'catalog', 0);
    if (raw.schemaVersion !== undefined && raw.schemaVersion !== 1) error('schemaVersion: 対応する値は1です。');
    function text(value, path, max, empty, fallback) {
      if (value === undefined && fallback !== undefined) value = fallback;
      if (typeof value !== 'string') { error(path + ': 文字列を指定してください。'); return ''; }
      var normalized = value.trim();
      if ((!empty && !normalized) || normalized.length > max) error(path + ': ' + (empty ? '0' : '1') + '～' + max + '文字で指定してください。');
      return normalized;
    }
    function identifier(value, path) {
      if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(value) || reserved.has(value)) { error(path + ': IDは予約語以外の半角英数字・_・-で1～100文字にしてください。'); return ''; }
      return value;
    }
    function choice(value, path, choices, fallback) {
      if (value === undefined) value = fallback;
      if (choices.indexOf(value) === -1) { error(path + ': ' + choices.join(' / ') + ' から指定してください。'); return fallback; }
      return value;
    }
    function array(value, path, min, max) {
      if (!Array.isArray(value)) { error(path + ': 配列を指定してください。'); return []; }
      if (value.length < min || value.length > max) error(path + ': 件数を' + min + '～' + max + '件にしてください。');
      return value.slice(0, max);
    }
    function record(value, path) { if (!object(value)) { error(path + ': オブジェクトを指定してください。'); return {}; } return value; }
    function uniqueId(id, seen, path) { if (id && seen.has(id)) error(path + ': ID「' + id + '」が重複しています。'); if (id) seen.add(id); }
    var categoryIds = new Set(), resourceIds = new Set(), courseIds = new Set();
    var categories = array(raw.categories, 'categories', 1, 50).map(function (value, index) {
      var path = 'categories[' + index + ']', item = record(value, path), id = identifier(item.id, path + '.id');
      if (id === 'all') error(path + '.id: 「all」は画面の絞り込みに使う予約値です。'); uniqueId(id, categoryIds, path);
      return { id: id, name: text(item.name, path + '.name', 100, false), icon: choice(item.icon, path + '.icon', icons, 'book'), color: choice(item.color, path + '.color', colors, 'teal'), description: text(item.description, path + '.description', 300, true, '') };
    });
    var resources = array(raw.resources, 'resources', 0, 5000).map(function (value, index) {
      var path = 'resources[' + index + ']', item = record(value, path), id = identifier(item.id, path + '.id'); uniqueId(id, resourceIds, path);
      var cat = identifier(item.category, path + '.category'); if (!categoryIds.has(cat)) error(path + '.category: 存在するカテゴリIDを指定してください。');
      var url = item.url === null ? null : safeUrl(item.url); if (item.url !== null && !url) error(path + '.url: null または認証情報を含まないhttp/https URLを指定してください。');
      if (!realDate(item.updated)) error(path + '.updated: 実在する日付をYYYY-MM-DDで指定してください。');
      if (item.type === undefined) error(path + '.type: 資料の種類を指定してください。');
      return { id: id, title: text(item.title, path + '.title', 100, false), description: text(item.description, path + '.description', 300, true), category: cat, type: choice(item.type, path + '.type', types, '資料'), tags: array(item.tags, path + '.tags', 0, 10).map(function (tag, tagIndex) { return text(tag, path + '.tags[' + tagIndex + ']', 30, false); }), updated: typeof item.updated === 'string' ? item.updated : '', owner: text(item.owner, path + '.owner', 100, true), url: url };
    });
    var courses = array(raw.courses, 'courses', 0, 500).map(function (value, index) {
      var path = 'courses[' + index + ']', item = record(value, path), id = identifier(item.id, path + '.id'); uniqueId(id, courseIds, path);
      var steps = array(item.steps, path + '.steps', 1, 5000).map(function (step, stepIndex) {
        var resourceId = identifier(step, path + '.steps[' + stepIndex + ']'); if (!resourceIds.has(resourceId)) error(path + '.steps: 資料ID「' + resourceId + '」が見つかりません。'); return resourceId;
      });
      if (new Set(steps).size !== steps.length) error(path + '.steps: 同じ資料を重複して指定しないでください。');
      var confirmation = choice(item.confirmation, path + '.confirmation', ['self', 'quiz'], 'self'), checks = {};
      if (confirmation === 'quiz') {
        var source = record(item.checks, path + '.checks');
        steps.forEach(function (resourceId) {
          var checkPath = path + '.checks.' + resourceId, check = record(source[resourceId], checkPath);
          var options = array(check.options, checkPath + '.options', 3, 3).map(function (option, optionIndex) { return text(option, checkPath + '.options[' + optionIndex + ']', 200, false); });
          if (new Set(options).size !== 3) error(checkPath + '.options: 異なる3つの選択肢を指定してください。');
          if (!Number.isInteger(check.answer) || check.answer < 0 || check.answer > 2) error(checkPath + '.answer: 正解の位置を0・1・2のいずれかで指定してください。');
          if (resourceId) checks[resourceId] = { question: text(check.question, checkPath + '.question', 300, false), options: options, answer: Number.isInteger(check.answer) ? check.answer : 0 };
        });
      }
      return { id: id, title: text(item.title, path + '.title', 100, false), description: text(item.description, path + '.description', 300, true), label: text(item.label, path + '.label', 100, false, '学習コース'), duration: text(item.duration, path + '.duration', 100, false, '自分のペースで'), color: choice(item.color, path + '.color', colors, 'teal'), icon: choice(item.icon, path + '.icon', icons, 'book'), steps: steps, confirmation: confirmation, checks: checks };
    });
    return { ok: errors.length === 0, catalog: errors.length ? null : { schemaVersion: 1, categories: categories, resources: resources, courses: courses }, errors: errors };
  }
  function toDataScript(catalog) {
    var result = validate(catalog); if (!result.ok) throw new Error(result.errors.join('\n'));
    var encoded = JSON.stringify(JSON.stringify(result.catalog)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return '/* JSONから生成した共通カタログです。 */\nwindow.PORTAL_DATA = JSON.parse(' + encoded + ');\n';
  }
  function retainProgress(beforeCatalog, afterCatalog, progress) {
    var before = validate(beforeCatalog), after = validate(afterCatalog), retained = {};
    if (!before.ok || !after.ok || !object(progress)) return retained;
    var oldCourses = new Map(before.catalog.courses.map(function (c) { return [c.id, c]; }));
    var oldResources = new Map(before.catalog.resources.map(function (r) { return [r.id, r]; }));
    var newResources = new Map(after.catalog.resources.map(function (r) { return [r.id, r]; }));
    after.catalog.courses.forEach(function (course) {
      var prior = oldCourses.get(course.id);
      if (!prior || JSON.stringify(prior) !== JSON.stringify(course) || !course.steps.every(function (id) { return JSON.stringify(oldResources.get(id)) === JSON.stringify(newResources.get(id)); })) return;
      if (Object.prototype.hasOwnProperty.call(progress, course.id) && Array.isArray(progress[course.id])) retained[course.id] = Array.from(new Set(progress[course.id].filter(function (id) { return course.steps.indexOf(id) !== -1; })));
    });
    return retained;
  }
  root.PortalCatalog = { validate: validate, toDataScript: toDataScript, retainProgress: retainProgress };
})(typeof window !== 'undefined' ? window : globalThis);
