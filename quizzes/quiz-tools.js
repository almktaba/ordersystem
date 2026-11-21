/* أدوات الاختبار المشتركة: المؤقت، المشاركة، وبطاقة الطلب بعد النتيجة.
   تُحمَل في quiz.html (وتُحمَل أيضًا في index.html دون تشغيل تلقائي). */
(function () {
  'use strict';
  function init() {
    var main = document.querySelector('main[data-quiz-page="1"]');
    if (!main || main.getAttribute('data-quiz-tools-ready') === '1') { return; }
    main.setAttribute('data-quiz-tools-ready', '1');

var main = document.querySelector('main');
  if (!main) return;
  var css = document.createElement('style');
  css.textContent = '.quiz-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 12px}' +
    '.timer{margin:0;font-weight:800;font-size:15px;padding:6px 12px;border:2px solid var(--edge);border-radius:999px;background:var(--surface2);color:var(--ink)}' +
    '.timer.low{background:var(--badbg);color:var(--bad);border-color:var(--bad)}' +
    '.share-btn{min-height:40px;padding:6px 12px;font:inherit;font-weight:800;border:2px solid var(--edge);border-radius:12px;background:var(--sun);color:var(--ons);cursor:pointer;margin-inline-start:auto}' +
    '.quiz-share-backdrop{position:fixed;inset:0;z-index:200;display:flex;align-items:flex-end;justify-content:center;background:rgba(6,8,28,.66);padding:12px}' +
    '.quiz-share-panel{width:100%;max-width:460px;padding:22px 18px;background:var(--surface);color:var(--ink);border:2.5px solid var(--edge);border-radius:24px;box-shadow:0 4px 0 var(--edge)}' +
    '.quiz-share-panel h2{font-family:"Lalezar","Cairo",sans-serif;font-weight:400;font-size:24px;margin:0 0 2px}' +
    '.quiz-share-hint{color:var(--muted);font-weight:600;font-size:14px;margin:0 0 14px}' +
    '.quiz-share-apps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '.quiz-share-app{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;background:var(--surface2);color:var(--ink);text-decoration:none;border:2px solid var(--line);border-radius:14px;font:700 15px Cairo,sans-serif;cursor:pointer;text-align:start}' +
    '.quiz-share-app span:first-child{flex:none;width:28px;text-align:center;font-size:20px;line-height:1}' +
    '.quiz-share-close{width:100%;min-height:44px;margin-top:14px;font:800 15px Cairo,sans-serif;color:var(--ink);background:transparent;border:2px solid var(--line);border-radius:12px;cursor:pointer}';
  document.head.appendChild(css);
  var tools = document.createElement('div');
  tools.className = 'quiz-tools';
  var timer = document.createElement('p');
  timer.className = 'timer';
  timer.id = 'quiz-timer';
  timer.setAttribute('role', 'timer');
  timer.hidden = true;
  var share = document.createElement('button');
  share.type = 'button';
  share.className = 'share-btn';
  share.textContent = 'مشاركة الاختبار';
  share.setAttribute('aria-label', 'مشاركة رابط الاختبار');
  tools.appendChild(timer);
  tools.appendChild(share);
  var sub = main.querySelector('.sub');
  main.insertBefore(tools, sub ? sub.nextSibling : document.getElementById('stage'));

  function openShareSheet(data) {
    var u = encodeURIComponent(data.url);
    var tx = encodeURIComponent(data.text);
    var apps = [
      ['واتساب', '💬', 'https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + data.url)],
      ['فيسبوك', '📘', 'https://www.facebook.com/sharer/sharer.php?u=' + u],
      ['تيليجرام', '✈️', 'https://t.me/share/url?url=' + u + '&text=' + tx],
      ['إكس', '𝕏', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + tx],
      ['البريد الإلكتروني', '✉️', 'mailto:?subject=' + tx + '&body=' + u]
    ];
    var back = document.createElement('div');
    back.className = 'quiz-share-backdrop';
    back.setAttribute('role', 'dialog');
    back.setAttribute('aria-modal', 'true');
    back.setAttribute('aria-label', 'مشاركة الاختبار');
    var panel = document.createElement('div');
    panel.className = 'quiz-share-panel';
    panel.innerHTML =
      '<h2 id="quiz-share-title" tabindex="-1">مشاركة الاختبار</h2>' +
      '<p class="quiz-share-hint">اختر التطبيق لإرسال رابط المكتبة والاختبار</p>' +
      '<div class="quiz-share-apps"></div>' +
      '<button type="button" class="quiz-share-close">إغلاق</button>';
    var list = panel.querySelector('.quiz-share-apps');
    apps.forEach(function (a) {
      var link = document.createElement('a');
      link.className = 'quiz-share-app';
      link.href = a[2]; link.target = '_blank'; link.rel = 'noopener';
      link.innerHTML = '<span aria-hidden="true">' + a[1] + '</span><span>' + a[0] + '</span>';
      list.appendChild(link);
    });
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'quiz-share-app';
    copy.innerHTML = '<span aria-hidden="true">🔗</span><span>نسخ الرابط</span>';
    copy.addEventListener('click', async function () {
      var ok = false;
      try { await navigator.clipboard.writeText(data.url); ok = true; } catch (e) {}
      if (!ok) {
        var ta = document.createElement('textarea');
        ta.value = data.url;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch (e) {}
        ta.remove();
      }
      var label = copy.querySelector('span:last-child');
      if (label) { label.textContent = ok ? 'تم نسخ الرابط' : 'تعذّر النسخ'; }
    });
    list.appendChild(copy);
    back.appendChild(panel);
    document.body.appendChild(back);
    panel.querySelector('.quiz-share-close').addEventListener('click', function () { back.remove(); });
    back.addEventListener('click', function (e) { if (e.target === back) { back.remove(); } });
    panel.querySelector('#quiz-share-title').focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var back = document.querySelector('.quiz-share-backdrop');
      if (back) { back.remove(); }
    }
  });

  share.addEventListener('click', async function () {
    var qp0 = new URLSearchParams(location.search);
    var quizId = qp0.get('quiz') || qp0.get('id') || window.__quizId || '';
    var appUrl = new URL('../index.html', location.href);
    appUrl.search = '';
    appUrl.hash = 'quizzes/' + encodeURIComponent(quizId);
    var url = appUrl.href;
    var data = { title: document.title, text: 'جرّب هذا الاختبار في المكتبة: ' + document.title, url: url };
    if (navigator.share) {
      try { await navigator.share(data); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    openShareSheet(data);
  });

  var left = 0, tick = null, mins = 0, promo = null;
  function paint() {
    var m = Math.floor(left / 60), s = left % 60;
    timer.textContent = '⏱ ' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    timer.classList.toggle('low', left <= 30);
  }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  function startTimer() {
    if (!(mins > 0)) { return; }
    stop();
    left = Math.round(mins * 60);
    timer.hidden = false;
    paint();
    tick = setInterval(function () {
      left--;
      if (left <= 0) {
        stop();
        timer.textContent = '⏱ 00:00';
        if (typeof window.finish === 'function') {
          window.finish();
          var h = document.querySelector('.result h2');
          if (h) { h.textContent = 'انتهى الوقت!'; }
        }
        return;
      }
      paint();
    }, 1000);
  }
  function norm(s) {
    return String(s || '').replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase().trim();
  }
  function buildPromo(grade) {
    var base = new URL('../index.html', location.href);
    base.search = '';
    base.hash = '';
    var url = base.href + '#notebooks?q=' + encodeURIComponent('بنك اسئلة ابجد') +
      '&grade=' + encodeURIComponent(grade) + '&scope=all';
    return { grade: grade, url: url };
  }
  function addPromo() {
    if (!promo || document.querySelector('.order-cta')) return;
    var result = document.querySelector('.result');
    if (!result) return;
    var card = document.createElement('section');
    card.className = 'order-cta';
    card.innerHTML =
      '<h3>الملزمة المطبوعة جاهزة</h3>' +
      '<p>بنك أسئلة أبجد ملزمة كبيرة فيها أسئلة كتير، والأسئلة اللي تدرّبت عليها جزء صغير منها. شوف ملازم صفك واطلبها مطبوعة من المكتبة.</p>' +
      '<p class="cta-note">مطبوعة ومتوفرة الآن</p>' +
      '<a class="btn" href="#">اطلبها الان</a>';
    var link = card.querySelector('a');
    link.href = promo.url;
    link.target = '_top';
    link.rel = 'noopener';
    result.appendChild(card);
  }
  var origFinish = window.finish;
  if (typeof origFinish === 'function') {
    window.finish = function () {
      stop();
      var out = origFinish.apply(this, arguments);
      addPromo();
      var again = document.querySelector('.again');
      if (again) {
        again.addEventListener('click', function () {
          if (typeof window.__quizReset === 'function') window.__quizReset();
          setTimeout(startTimer, 0);
        }, { once: true });
      }
      return out;
    };
  }

  function getCatalog() {
    if (window.__quizCatalog) { return Promise.resolve(window.__quizCatalog); }
    return fetch('../data/quizzes.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  var qp = new URLSearchParams(location.search);
  var forced = Number(qp.get('minutes'));
  var qid = qp.get('quiz') || qp.get('id') || window.__quizId || '';
  if (forced > 0) { mins = forced; startTimer(); }

  getCatalog()
    .then(function (j) { window.__quizCatalog = j; return j; })
    .then(function (j) {
      var list = (j && j.quizzes) || [];
      var found = (qid && list.filter(function (x) { return x && x.id === qid; })[0]) || null;
      if (!(forced > 0)) {
        mins = found && Number(found.minutes) > 0 ? Number(found.minutes) : 0;
        startTimer();
      }
      var grade = found && found.grade;
      if (Array.isArray(grade)) grade = grade[0];
      return grade ? String(grade) : '';
    })
    .then(function (grade) {
      if (!grade) return null;
      return fetch('../data/products.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (p) {
          var products = (p && p.products) || [];
          var needle = norm('بنك اسئلة ابجد');
          var ok = products.some(function (x) {
            if (!x || x.available === false) return false;
            var g = x.grade;
            var gradeOk = g === grade || (Array.isArray(g) && g.indexOf(grade) !== -1) ||
              (Array.isArray(x.grades) && x.grades.indexOf(grade) !== -1);
            return gradeOk && norm(x.name).indexOf(needle) !== -1;
          });
          return ok ? buildPromo(grade) : null;
        });
    })
    .then(function (p) { promo = p; addPromo(); })
    .catch(function () {});
  }

  window.QuizTools = { init: init };
})();
