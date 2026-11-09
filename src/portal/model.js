(function (root) {
  'use strict';
  function safeUrl(value) {
    if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return null;
    try {
      var url = new URL(value.trim());
      return /^(http|https):$/.test(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch (_) { return null; }
  }
  function filterResources(resources, filters) {
    var words = (filters.query || '').normalize('NFKC').toLocaleLowerCase('ja').trim().split(/\s+/).filter(Boolean);
    return resources.filter(function (resource) {
      var text = [resource.title, resource.description, resource.owner].concat(resource.tags).join(' ').normalize('NFKC').toLocaleLowerCase('ja');
      return (!filters.category || filters.category === 'all' || resource.category === filters.category) &&
        (!filters.type || filters.type === 'all' || resource.type === filters.type) &&
        (!filters.bookmarksOnly || filters.bookmarks.indexOf(resource.id) !== -1) &&
        words.every(function (word) { return text.indexOf(word) !== -1; });
    }).sort(function (a, b) { return filters.sort === 'title' ? a.title.localeCompare(b.title, 'ja') : b.updated.localeCompare(a.updated); });
  }
  function validSavedResource(item, categories) {
    return item && typeof item.id === 'string' && item.id.indexOf('user-') === 0 && typeof item.title === 'string' && item.title.length > 0 && item.title.length <= 100 &&
      typeof item.description === 'string' && item.description.length <= 300 && categories.indexOf(item.category) !== -1 && ['Wiki', '資料', '動画', 'Web', '手順書'].indexOf(item.type) !== -1 &&
      Array.isArray(item.tags) && item.tags.length <= 10 && item.tags.every(function (tag) { return typeof tag === 'string' && tag.length <= 30; }) &&
      typeof item.updated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.updated) && typeof item.owner === 'string' && !!safeUrl(item.url);
  }
  function validSavedCourse(item, resourceIds, reservedIds) {
    return !!(item && typeof item.id === 'string' && /^user-course-[a-zA-Z0-9-]+$/.test(item.id) && reservedIds.indexOf(item.id) === -1 &&
      typeof item.title === 'string' && item.title.trim().length > 0 && item.title.length <= 100 &&
      typeof item.description === 'string' && item.description.length <= 300 && Array.isArray(item.steps) && item.steps.length > 0 &&
      item.steps.length <= resourceIds.length && new Set(item.steps).size === item.steps.length &&
      item.steps.every(function (id) { return typeof id === 'string' && resourceIds.indexOf(id) !== -1; }) &&
      (item.confirmation === 'self' || item.confirmation === 'quiz') &&
      (item.confirmation !== 'quiz' || (item.checks && typeof item.checks === 'object' && item.steps.every(function (id) { return validQuiz(item.checks[id]); }))));
  }
  function validQuiz(check) {
    return !!(check && typeof check.question === 'string' && check.question.trim().length > 0 && check.question.length <= 300 &&
      Array.isArray(check.options) && check.options.length === 3 && check.options.every(function (option) { return typeof option === 'string' && option.trim().length > 0 && option.length <= 200; }) &&
      new Set(check.options.map(function (option) { return option.trim(); })).size === 3 && Number.isInteger(check.answer) && check.answer >= 0 && check.answer <= 2);
  }
  root.PortalModel = { safeUrl: safeUrl, filterResources: filterResources, validSavedResource: validSavedResource, validSavedCourse: validSavedCourse };
})(typeof window !== 'undefined' ? window : globalThis);
