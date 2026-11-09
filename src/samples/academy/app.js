(function () {
  'use strict';
  var key = 'tsumugu-sample-academy-v1';
  var $ = function (id) { return document.getElementById(id); };
  var courses = [
    { id: 'c1', title: 'チームの一員になる', description: '新しいチームでの最初の一週間を、安心して始めるために。', audience: '新しく参加した方へ', tag: 'オンボーディング', color: 'cobalt', icon: '↗', lessons: [
      { resource: 'r1', short: 'チームを知る', title: 'チームの目的と相談先を知る', lead: '仕事を始める前に、私たちが何を目指し、誰と協力するのかを知りましょう。', paragraphs: ['チームハンドブックは、共通の目的、メンバーの役割、連絡方法を確認するための入口です。最初に全体を読み、担当する仕事がチームの目標にどうつながるかを考えてみましょう。', '進め方に迷ったら、ハンドブックに書かれた相談先に確認します。質問と回答を記録しておくと、あとから参加する人の助けにもなります。'], takeaway: 'ひとりで抱えず、相談先を確かめる。', question: '仕事の進め方で迷ったとき、どうしますか？', options: ['チームの相談先に確認する', '誰にも確認せず進める', '質問は記録に残さない'], answer: 0 },
      { resource: 'r2', short: '準備を整える', title: '仕事を始める環境を整える', lead: '必要なアカウントとツールを、チェックリストに沿って準備します。', paragraphs: ['最初に必要なアカウントとアクセス権を一覧にします。申請先、承認者、利用開始日を確認してから申請しましょう。使えるようになったものからチェックすると、準備の状況がわかります。', 'チームが指定したツールと手順を利用します。うまく動かない場合は、表示されたエラーと試したことを記録して相談すると、状況を共有しやすくなります。'], takeaway: '準備は一覧化し、承認された手順で進める。', question: '必要なアクセス権は、どのように準備しますか？', options: ['同僚のアカウントを借りる', '申請先と承認者を確認して申請する', '権限の確認は仕事の後に回す'], answer: 1 },
      { resource: 'r3', short: '安心して働く', title: '情報を共有する前に確かめる', lead: '便利に共有するためにも、資料の取り扱いと共有範囲を確認しましょう。', paragraphs: ['資料を送る前に、内容の機密区分と共有先を確認します。リンクを知っている全員が閲覧できる設定にする前に、意図した人だけが見られる状態かを確かめましょう。', '誤送信や不審なメッセージに気づいたら、チームが定めた窓口に早めに相談します。自分だけで判断して隠したり、機密情報を含む画面を広く転送したりしないようにします。'], takeaway: '共有の前に、内容・相手・閲覧権限を確認する。', question: '社内資料のリンクを共有する前に、何を確認しますか？', options: ['リンクの見た目だけ', '資料の文字数だけ', '機密区分と共有先、閲覧権限'], answer: 2 }
    ] },
    { id: 'c2', title: '開発の基本を身につける', description: '環境構築からコードレビュー、リリースまでをひとつの流れで。', audience: '開発メンバー向け', tag: '技術・開発', color: 'lavender', icon: '⌘', lessons: [
      { resource: 'r7', short: '環境をつくる', title: '再現できる開発環境をつくる', lead: '同じ手順で環境を作れることが、チームで開発する最初の一歩です。', paragraphs: ['必要なツールのバージョンと導入手順を確認し、手順書どおりに準備します。動いたかどうかは、指定されたサンプルを実行して確かめましょう。', '環境固有の変更が必要だった場合は、何を変えたかを記録します。認証情報は手順書やコードに直接書かず、チームで指定された管理方法を利用します。'], takeaway: '手順・バージョン・動作確認をそろえる。', question: '環境構築が終わったら、次に何をしますか？', options: ['指定されたサンプルで動作確認する', 'バージョンの記録を消す', '認証情報をコードに書く'], answer: 0 },
      { resource: 'r6', short: '変更を伝える', title: '意図が伝わるコードレビュー', lead: '変更の理由と確認したことを、レビューする人に伝えましょう。', paragraphs: ['変更の説明には、解決したい問題、変更後の振る舞い、確認した内容を書きます。小さな単位に分けると、読み手が意図を理解しやすくなります。', 'レビューでは人ではなく変更内容に焦点を当てます。理由や具体例を添えると、受け取った人が次に何をすればよいかを判断できます。'], takeaway: '何を変えたかと、なぜ変えたかをセットにする。', question: 'レビュー依頼に含めると役立つものは？', options: ['変更量の数字だけ', '問題・変更後の振る舞い・確認内容', '説明なしのファイル一覧'], answer: 1 },
      { resource: 'r8', short: '安全に届ける', title: 'リリース前後の確認をそろえる', lead: '公開する瞬間だけでなく、その前後の準備も含めて考えます。', paragraphs: ['リリース前にはテスト結果、関係者への連絡、作業担当をチェックします。問題が起きた場合の切り戻し手順を用意し、判断する人を明らかにしましょう。', 'リリース後は、想定した動作と監視項目を確認します。作業結果と気づいた点を記録し、次回のチェックリストの改善につなげます。'], takeaway: '公開前の準備と、公開後の確認をひと続きにする。', question: 'リリース計画に含めるべきものは？', options: ['公開時刻だけ', '公開の告知だけ', '事前確認・切り戻し・公開後の確認'], answer: 2 }
    ] },
    { id: 'c3', title: '知識を伝える力を育てる', description: '自分の気づきを、次の人が使えるチームの知識へ。', audience: 'すべてのメンバーへ', tag: 'ナレッジ共有', color: 'amber', icon: '✳', lessons: [
      { resource: 'r9', short: '読み手を考える', title: '読み手から逆算して書く', lead: '伝えたいことを並べる前に、読み手が何を知りたいかを考えます。', paragraphs: ['最初に「誰が」「何をできるようになる資料か」を一文にします。必要な前提を示し、手順は作業する順番に並べましょう。', '画面名やボタン名は実際の表記に合わせます。実施後にどうなれば成功かを添えると、読み手が自分で結果を確認できます。'], takeaway: '対象者・目的・成功した状態を先に決める。', question: '手順書を書き始めるとき、まず決めることは？', options: ['対象者と、できるようになること', '装飾の色だけ', 'ページ数の多さ'], answer: 0 },
      { resource: 'r10', short: '見つけやすくする', title: '知識の入口を整える', lead: '内容が役立っても、見つからなければ使ってもらえません。', paragraphs: ['資料には内容がわかるタイトルを付け、カテゴリとタグで整理します。読み手が検索しそうな言葉を説明文に入れると、探す手がかりになります。', '同じ内容の資料を増やしすぎず、元となる資料へのリンクをまとめます。所有者と更新日を示すと、内容について相談したり、古さを判断したりできます。'], takeaway: 'タイトル・分類・更新情報で、探す手がかりをつくる。', question: '資料を見つけやすくするために役立つものは？', options: ['意味のない連番だけのタイトル', '内容がわかるタイトルとカテゴリ・タグ', '更新日の削除'], answer: 1 },
      { resource: 'r12', short: '学びをつなげる', title: '振り返りを次の改善に変える', lead: '振り返りは、次に試す行動を決めるための時間です。', paragraphs: ['うまくいったことと困ったことを、具体的な事実から共有します。人を責めるのではなく、進め方や仕組みのどこを変えられるかを考えましょう。', '改善案は、次に試す小さな行動にします。担当者と確認するタイミングを決めると、提案を実行と次の学びにつなげられます。'], takeaway: '小さな改善に、担当と確認のタイミングを添える。', question: '振り返りで改善案を決めた後は？', options: ['記録だけして終わる', '誰かが対応するのを待つ', '担当者と確認するタイミングを決める'], answer: 2 }
    ] }
  ];
  var record = { completed: {}, lastCourse: 'c1', lastLesson: 0 };
  var activeCourse = null, activeIndex = 0, storageAvailable = true;
  function findCourse(id) { return courses.find(function (course) { return course.id === id; }); }
  try {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { raw = null; }
    if (raw && typeof raw === 'object') {
      courses.forEach(function (course) { var entries = raw.completed && raw.completed[course.id]; if (Array.isArray(entries)) record.completed[course.id] = Array.from(new Set(entries.filter(function (index) { return Number.isInteger(index) && index >= 0 && index < course.lessons.length; }))); });
      if (findCourse(raw.lastCourse)) record.lastCourse = raw.lastCourse;
      if (Number.isInteger(raw.lastLesson) && raw.lastLesson >= 0 && raw.lastLesson < 3) record.lastLesson = raw.lastLesson;
    }
    localStorage.setItem(key + '-probe', '1'); localStorage.removeItem(key + '-probe');
  } catch (_) { storageAvailable = false; $('storage-warning').hidden = false; }
  function save() { if (storageAvailable) try { localStorage.setItem(key, JSON.stringify(record)); } catch (_) { storageAvailable = false; $('storage-warning').hidden = false; } }
  function node(tag, className, text) { var element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
  function completed(course) { return record.completed[course.id] || []; }
  function courseButton(course, title, className) { var button = node('button', className, title); button.type = 'button'; button.dataset.courseId = course.id; return button; }
  function renderCatalog() {
    var query = $('academy-search').value.normalize('NFKC').toLocaleLowerCase('ja').trim();
    var matches = courses.filter(function (course) { return [course.title, course.description, course.audience, course.tag].concat(course.lessons.map(function (lesson) { return lesson.title; })).join(' ').normalize('NFKC').toLocaleLowerCase('ja').indexOf(query) !== -1; });
    $('course-grid').replaceChildren();
    matches.forEach(function (course, index) {
      var count = completed(course).length;
      var card = node('article', 'course-card ' + course.color);
      var cover = node('div', 'course-cover');
      var coverTop = node('div', 'cover-top'); coverTop.append(node('span', '', course.tag), node('span', 'cover-symbol', course.icon));
      var route = node('div', 'cover-route'); course.lessons.forEach(function (_, i) { route.append(node('span', completed(course).indexOf(i) !== -1 ? 'is-complete' : '', String(i + 1).padStart(2, '0'))); });
      cover.append(coverTop, route, node('span', 'cover-caption', 'ONE STEP AT A TIME'));
      var body = node('div', 'course-card-body'); body.append(node('p', 'card-audience', course.audience)); var heading = node('h3'); heading.append(courseButton(course, course.title, 'course-title')); body.append(heading, node('p', 'card-description', course.description));
      var meta = node('div', 'card-meta'); meta.append(node('span', '', '3 レッスン'), node('span', '', '約 15 分'), node('span', '', '入門')); body.append(meta);
      var progress = node('progress', 'card-progress'); progress.max = 3; progress.value = count; progress.setAttribute('aria-label', course.title + 'の進捗');
      var bottom = node('div', 'card-bottom'); bottom.append(node('span', '', count + ' / 3 完了'), courseButton(course, count === 3 ? 'もう一度見る ↗' : count ? 'つづきから →' : '学習をはじめる →', 'card-start'));
      body.append(progress, bottom); card.append(cover, body); $('course-grid').append(card);
    });
    $('course-count').textContent = matches.length + ' コース'; $('empty-state').hidden = matches.length > 0;
    $('total-completed').textContent = String(courses.reduce(function (sum, course) { return sum + completed(course).length; }, 0));
    document.querySelectorAll('.journey-step').forEach(function (button) { var done = completed(courses[0]).indexOf(Number(button.dataset.lessonIndex)) !== -1; button.classList.toggle('is-complete', done); button.querySelector('.journey-node').textContent = done ? '✓' : String(Number(button.dataset.lessonIndex) + 1).padStart(2, '0'); });
  }
  function showCatalog() { $('workspace-view').hidden = true; $('catalog-view').hidden = false; $('catalog-nav').classList.add('active'); $('catalog-nav').setAttribute('aria-current', 'page'); $('continue-nav').classList.remove('active'); $('continue-nav').removeAttribute('aria-current'); renderCatalog(); }
  function showCourse(id, index) {
    activeCourse = findCourse(id); if (!activeCourse) return;
    activeIndex = Number.isInteger(index) ? index : activeCourse.lessons.findIndex(function (_, i) { return completed(activeCourse).indexOf(i) === -1; });
    if (activeIndex < 0 || activeIndex >= activeCourse.lessons.length) activeIndex = 0;
    $('catalog-view').hidden = true; $('workspace-view').hidden = false;
    $('catalog-nav').classList.remove('active'); $('catalog-nav').removeAttribute('aria-current'); $('continue-nav').classList.add('active'); $('continue-nav').setAttribute('aria-current', 'page');
    renderLesson(); $('workspace-title').setAttribute('tabindex', '-1'); $('workspace-title').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function renderLesson() {
    var course = activeCourse, lesson = course.lessons[activeIndex], done = completed(course).indexOf(activeIndex) !== -1;
    record.lastCourse = course.id; record.lastLesson = activeIndex; save();
    $('workspace-title').textContent = course.title; $('workspace-description').textContent = course.description; $('workspace-course-label').textContent = course.tag;
    $('course-progress-label').textContent = completed(course).length + ' / 3 完了'; $('course-progress').value = completed(course).length;
    $('lesson-tree').replaceChildren(); course.lessons.forEach(function (item, index) { var li = node('li'); var button = node('button', 'lesson-button' + (index === activeIndex ? ' active' : '')); button.type = 'button'; button.dataset.index = String(index); if (index === activeIndex) button.setAttribute('aria-current', 'step'); var complete = completed(course).indexOf(index) !== -1; button.append(node('span', 'lesson-number' + (complete ? ' is-complete' : ''), complete ? '✓' : String(index + 1).padStart(2, '0'))); var text = node('span', 'lesson-button-copy'); text.append(node('small', '', 'LESSON ' + String(index + 1).padStart(2, '0')), node('strong', '', item.short), node('span', '', complete ? '学習済み' : index === activeIndex ? '学習中' : '約 5 分')); button.append(text); button.addEventListener('click', function () { activeIndex = index; renderLesson(); }); li.append(button); $('lesson-tree').append(li); });
    $('lesson-counter').textContent = 'LESSON ' + String(activeIndex + 1).padStart(2, '0') + ' / 03'; $('lesson-title').textContent = lesson.title; $('lesson-lead').textContent = lesson.lead;
    $('lesson-content').replaceChildren(); lesson.paragraphs.forEach(function (text) { $('lesson-content').append(node('p', '', text)); }); var point = node('div', 'lesson-takeaway'); point.append(node('span', '', 'このレッスンのポイント'), node('strong', '', lesson.takeaway)); $('lesson-content').append(point);
    $('source-reference').replaceChildren(); var resource = window.PORTAL_DATA && window.PORTAL_DATA.resources.find(function (entry) { return entry.id === lesson.resource; });
    $('source-reference').append(node('span', 'source-label', '参照元の掲載例：' + (resource ? resource.title : lesson.title)));
    if (resource && typeof resource.url === 'string' && /^https?:\/\//.test(resource.url)) { var link = node('a', '', '参考資料を開く ↗'); link.href = resource.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; $('source-reference').append(link); }
    else $('source-reference').append(node('span', 'source-note', '元資料のリンクは未設定です。上の本文は、学習操作を試すためのサンプル教材です。'));
    $('quiz-question').textContent = lesson.question; $('quiz-options').replaceChildren(); lesson.options.forEach(function (text, index) { var label = node('label'); var radio = node('input'); radio.type = 'radio'; radio.name = 'lesson-answer'; radio.value = String(index); radio.disabled = done; radio.checked = done && index === lesson.answer; label.append(radio, node('span', '', text)); $('quiz-options').append(label); });
    $('check-answer').disabled = done; $('check-answer').textContent = done ? '✓ このレッスンは完了' : '回答を確認する'; $('quiz-feedback').textContent = done ? '正解済みです。いつでも教材を見直せます。' : ''; $('quiz-feedback').dataset.result = done ? 'correct' : '';
    $('previous-lesson').disabled = activeIndex === 0; $('next-lesson').textContent = activeIndex === 2 ? 'コース一覧へ →' : '次のレッスン →'; $('lesson-position').textContent = (activeIndex + 1) + ' / 3';
  }
  $('check-answer').addEventListener('click', function () { var choice = $('quiz-options').querySelector('input:checked'); if (!choice) { $('quiz-feedback').textContent = '回答を選んでから確認してください。'; $('quiz-feedback').dataset.result = 'notice'; return; } var lesson = activeCourse.lessons[activeIndex]; if (Number(choice.value) !== lesson.answer) { $('quiz-feedback').textContent = 'もう一度、本文のポイントを確かめてみましょう。'; $('quiz-feedback').dataset.result = 'incorrect'; return; } var entries = completed(activeCourse).slice(); if (entries.indexOf(activeIndex) === -1) entries.push(activeIndex); record.completed[activeCourse.id] = entries; save(); renderLesson(); $('quiz-feedback').textContent = '正解です！この一歩が、あなたの力になりました。'; });
  $('previous-lesson').addEventListener('click', function () { if (activeIndex > 0) { activeIndex--; renderLesson(); } });
  $('next-lesson').addEventListener('click', function () { if (activeIndex < 2) { activeIndex++; renderLesson(); } else { showCatalog(); window.scrollTo({ top: 0, behavior: 'instant' }); } });
  document.addEventListener('click', function (event) { var button = event.target.closest('[data-course-id]'); if (!button) return; var index = button.dataset.lessonIndex; showCourse(button.dataset.courseId, index === undefined ? undefined : Number(index)); });
  $('academy-search').addEventListener('input', renderCatalog); $('clear-search').addEventListener('click', function () { $('academy-search').value = ''; renderCatalog(); $('academy-search').focus(); });
  $('catalog-nav').addEventListener('click', showCatalog); $('back-to-catalog').addEventListener('click', showCatalog); $('continue-nav').addEventListener('click', function () { showCourse(record.lastCourse, record.lastLesson); });
  $('about-button').addEventListener('click', function () { $('about-dialog').showModal(); }); $('close-about').addEventListener('click', function () { $('about-dialog').close(); });
  $('about-dialog').addEventListener('click', function (event) { if (event.target !== this) return; var rect = this.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close(); });
  renderCatalog();
})();
