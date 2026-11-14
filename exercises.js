/* ═══════════════════════════════════════════════════
   🎯 التدريبات المجانية — البيانات والمنطق
   ═══════════════════════════════════════════════════ */
"use strict";

/* ترتيب الصفوف الدراسي (من الأدنى للأعلى) */
var GRADES_ORDER = [
  "الأول الابتدائي",
  "الثاني الابتدائي",
  "الثالث الابتدائي",
  "الرابع الابتدائي",
  "الخامس الابتدائي",
  "السادس الابتدائي",
  "الأول الاعدادي",
  "الثاني الاعدادي",
  "الثالث الاعدادي",
  "الأول الثانوي",
  "الثاني الثانوي",
  "الثالث الثانوي"
];

/* ═══════════════════════════════════════════════════
   التدريبات
   ═══════════════════════════════════════════════════ */
var EXERCISES = [
  {
    id: "math-basics",
    title: "العمليات الحسابية الأساسية",
    desc: "جمع وطرح وقسمة بأمثلة من الحياة اليومية.",
    icon: "➕",
    subject: "رياضيات",
    grades: ["الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي"],
    difficulty: "سهل",
    minutes: 5,
    questions: [
      {
        q: "ما ناتج 25 + 14؟",
        options: ["37", "39", "41"],
        answer: 1,
        explanation: "نجمع الآحاد: 5 + 4 = 9، ثم العشرات: 2 + 1 = 3، فيكون الناتج 39."
      },
      {
        q: "ما ناتج 47 − 19؟",
        options: ["28", "32", "38"],
        answer: 0,
        explanation: "19 + 28 = 47، إذن الناتج 28."
      },
      {
        q: "ما ناتج 8 × 6؟",
        options: ["42", "48", "54"],
        answer: 1,
        explanation: "8 × 6 = 48، ويمكنك حسابها كـ 8 × 5 = 40 ثم نضيف 8."
      },
      {
        q: "ما ناتج 36 ÷ 4؟",
        options: ["8", "9", "12"],
        answer: 1,
        explanation: "4 × 9 = 36، إذن 36 ÷ 4 = 9."
      },
      {
        q: "أحمد عنده 24 قلمًا ووزّعها على 4 أصدقاء بالتساوي. كم قلمًا أخذ كل صديق؟",
        options: ["5", "6", "8"],
        answer: 1,
        explanation: "24 ÷ 4 = 6، فكل صديق أخذ 6 أقلام."
      }
    ]
  },
  {
    id: "multiplication",
    title: "جدول الضرب",
    desc: "اختبر حفظك لجدول الضرب من 1 إلى 12.",
    icon: "✖️",
    subject: "رياضيات",
    grades: ["الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي"],
    difficulty: "سهل",
    minutes: 4,
    questions: [
      {
        q: "ما ناتج 7 × 3؟",
        options: ["21", "24", "27"],
        answer: 0,
        explanation: "7 × 3 = 21، أي 7 + 7 + 7."
      },
      {
        q: "ما ناتج 9 × 9؟",
        options: ["72", "81", "90"],
        answer: 1,
        explanation: "9 × 9 = 81، وهي من أشهر نتائج جدول الضرب."
      },
      {
        q: "ما ناتج 6 × 8؟",
        options: ["42", "46", "48"],
        answer: 2,
        explanation: "6 × 8 = 48، وتساوي أيضًا 8 × 6."
      },
      {
        q: "ما ناتج 5 × 12؟",
        options: ["50", "55", "60"],
        answer: 2,
        explanation: "5 × 12 = 60، لأن 5 × 10 = 50 ثم نضيف 5 × 2 = 10."
      },
      {
        q: "ما العدد الذي إذا ضربته في 4 كان الناتج 36؟",
        options: ["8", "9", "12"],
        answer: 1,
        explanation: "نقسم 36 على 4 فيكون 9، وللتحقق: 9 × 4 = 36."
      }
    ]
  },
  {
    id: "fractions",
    title: "الكسور والأعداد العشرية",
    desc: "مقارنة الكسور وتحويلها إلى أعداد عشرية.",
    icon: "½",
    subject: "رياضيات",
    grades: ["الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي", "الأول الاعدادي"],
    difficulty: "متوسط",
    minutes: 6,
    questions: [
      {
        q: "أي الكسور التالية يكافئ 1/2؟",
        options: ["2/3", "3/6", "4/6"],
        answer: 1,
        explanation: "3/6 تساوي 1/2 لأن البسط والمقام يقبلان القسمة على 3."
      },
      {
        q: "ما ناتج 1/4 + 2/4؟",
        options: ["3/8", "3/4", "2/8"],
        answer: 1,
        explanation: "المقامات متساوية، فنجمع البسوط: 1 + 2 = 3، فيكون الناتج 3/4."
      },
      {
        q: "العدد العشري 0.5 يساوي الكسر:",
        options: ["1/5", "1/2", "1/4"],
        answer: 1,
        explanation: "0.5 = نصف الواحد، أي 1/2."
      },
      {
        q: "كم يساوي 3/4 من العدد 20؟",
        options: ["10", "15", "18"],
        answer: 1,
        explanation: "20 ÷ 4 = 5، ثم 5 × 3 = 15."
      },
      {
        q: "أي الكسور التالية هو الأكبر؟",
        options: ["2/3", "3/5", "1/2"],
        answer: 0,
        explanation: "2/3 ≈ 0.67، و3/5 = 0.6، و1/2 = 0.5، إذن 2/3 هو الأكبر."
      }
    ]
  },
  {
    id: "matter",
    title: "حالات المادة",
    desc: "الصلب والسائل والغازي، والتحولات بينها.",
    icon: "💧",
    subject: "علوم",
    grades: ["الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي"],
    difficulty: "سهل",
    minutes: 5,
    questions: [
      {
        q: "الماء في درجة حرارة الغرفة يكون:",
        options: ["صلبًا", "سائلًا", "غازيًا"],
        answer: 1,
        explanation: "الماء في الحالة العادية سائل، ويتحول إلى ثلج بالتبريد أو بخار بالتسخين."
      },
      {
        q: "تحوّل السائل إلى غاز يُسمى:",
        options: ["التجمد", "التبخر", "التكاثف"],
        answer: 1,
        explanation: "التبخر هو تحول السائل إلى غاز، مثل تبخر الماء عند التسخين."
      },
      {
        q: "بخار الماء عندما يبرد ويتحول إلى قطرات ماء تُسمى العملية:",
        options: ["التبخر", "التكاثف", "الانصهار"],
        answer: 1,
        explanation: "التكاثف هو تحول الغاز إلى سائل، ولهذا تتكون قطرات الماء على الكوب البارد."
      },
      {
        q: "أي الحالات التالية له شكل وحجم ثابتان؟",
        options: ["الصلب", "السائل", "الغاز"],
        answer: 0,
        explanation: "الجسم الصلب له شكل وحجم ثابتان، أما السائل فحجمه ثابت وشكله متغير."
      },
      {
        q: "يتحول الثلج إلى ماء عند درجة حرارة:",
        options: ["0 درجة مئوية", "50 درجة مئوية", "100 درجة مئوية"],
        answer: 0,
        explanation: "الثلج ينصهر عند 0 درجة مئوية، والماء يغلي عند 100 درجة مئوية."
      }
    ]
  },
  {
    id: "arabic-grammar",
    title: "المفرد والجمع والمؤنث",
    desc: "تدريب على المفرد والمثنى والجمع والمذكر والمؤنث.",
    icon: "📖",
    subject: "لغة عربية",
    grades: ["الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي"],
    difficulty: "سهل",
    minutes: 5,
    questions: [
      {
        q: "جمع كلمة «تلميذ» هو:",
        options: ["تلاميذ", "تلميذات", "تلميذون"],
        answer: 0,
        explanation: "«تلاميذ» جمع تكسير لكلمة تلميذ، و«تلميذون» جمع مذكر سالم."
      },
      {
        q: "مؤنث كلمة «المعلم» هو:",
        options: ["المعلمة", "المعلمين", "المعلمات"],
        answer: 0,
        explanation: "المؤنث من المعلم هو المعلمة، أما المعلمات فهي جمع مؤنث."
      },
      {
        q: "جمع كلمة «قصة» هو:",
        options: ["قصص", "قصات", "قصصات"],
        answer: 0,
        explanation: "«قصص» جمع تكسير لكلمة قصة."
      },
      {
        q: "المثنى من كلمة «كتاب» هو:",
        options: ["كتابان", "كتب", "كتيب"],
        answer: 0,
        explanation: "المثنى يدل على اثنين، فيكون «كتابان» في حالة الرفع."
      },
      {
        q: "ضدّ كلمة «كبير» هو:",
        options: ["طويل", "صغير", "واسع"],
        answer: 1,
        explanation: "الكبير عكس الصغير، أما الطويل فعكسه قصير."
      }
    ]
  },
  {
    id: "english-basics",
    title: "كلمات إنجليزية أساسية",
    desc: "معاني الكلمات والجمع وأفعال الكون.",
    icon: "🔤",
    subject: "إنجليزي",
    grades: ["الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي"],
    difficulty: "سهل",
    minutes: 4,
    questions: [
      {
        q: "ما معنى كلمة Book؟",
        options: ["قلم", "كتاب", "دفتر"],
        answer: 1,
        explanation: "Book تعني كتابًا، أما Pen فتعني قلمًا."
      },
      {
        q: "اختر الترجمة الصحيحة لكلمة «مدرسة»:",
        options: ["School", "House", "Street"],
        answer: 0,
        explanation: "School تعني مدرسة، وHouse تعني منزلًا، وStreet تعني شارعًا."
      },
      {
        q: "ما جمع كلمة Pen؟",
        options: ["Pens", "Penes", "Pense"],
        answer: 0,
        explanation: "نضيف حرف s إلى معظم الأسماء للجمع، فتصبح Pens."
      },
      {
        q: "أكمل: I ___ a student.",
        options: ["am", "is", "are"],
        answer: 0,
        explanation: "مع الضمير I نستخدم am: أنا طالب = I am a student."
      },
      {
        q: "ما عكس كلمة Big؟",
        options: ["Tall", "Small", "Long"],
        answer: 1,
        explanation: "Big تعني كبير، وعكسها Small أي صغير."
      }
    ]
  },
  {
    id: "islamic-info",
    title: "معلومات إسلامية",
    desc: "أركان الإسلام والإيمان وبعض العبادات.",
    icon: "🕌",
    subject: "تربية دينية",
    grades: ["الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي"],
    difficulty: "سهل",
    minutes: 4,
    questions: [
      {
        q: "كم عدد أركان الإسلام؟",
        options: ["أربعة", "خمسة", "ستة"],
        answer: 1,
        explanation: "أركان الإسلام خمسة: الشهادتان، والصلاة، والزكاة، وصوم رمضان، وحج البيت."
      },
      {
        q: "ما أول سورة في القرآن الكريم؟",
        options: ["البقرة", "الفاتحة", "الناس"],
        answer: 1,
        explanation: "سورة الفاتحة هي أول سورة في المصحف، وتُقرأ في كل ركعة."
      },
      {
        q: "كم عدد ركعات صلاة الفجر؟",
        options: ["ركعتان", "ثلاث", "أربع"],
        answer: 0,
        explanation: "صلاة الفجر ركعتان، ويُسنّ قبلها ركعتان من السنة."
      },
      {
        q: "شهر الصيام في الإسلام هو:",
        options: ["شعبان", "رمضان", "رجب"],
        answer: 1,
        explanation: "يصوم المسلمون شهر رمضان من الفجر إلى المغرب."
      },
      {
        q: "كم عدد أركان الإيمان؟",
        options: ["خمسة", "ستة", "سبعة"],
        answer: 1,
        explanation: "أركان الإيمان ستة، وأركان الإسلام خمسة."
      }
    ]
  },
  {
    id: "computer-basics",
    title: "أساسيات الحاسب",
    desc: "مكونات الحاسب ووحدات القياس والبرامج.",
    icon: "💻",
    subject: "حاسب وتكنولوجيا",
    grades: ["الخامس الابتدائي", "السادس الابتدائي", "الأول الاعدادي", "الثاني الاعدادي"],
    difficulty: "متوسط",
    minutes: 5,
    questions: [
      {
        q: "بماذا تُقاس سرعة المعالج؟",
        options: ["الجيجاهرتز", "الجيجابايت", "البكسل"],
        answer: 0,
        explanation: "تُقاس سرعة المعالج بالجيجاهرتز، أما الجيجابايت فوحدة سعة تخزين."
      },
      {
        q: "أي مما يلي يُعدّ وحدة إدخال؟",
        options: ["الشاشة", "لوحة المفاتيح", "الطابعة"],
        answer: 1,
        explanation: "لوحة المفاتيح وحدة إدخال، أما الشاشة والطابعة فوحدتا إخراج."
      },
      {
        q: "1 كيلوبايت يساوي:",
        options: ["1024 بايت", "100 بايت", "1024 ميجابايت"],
        answer: 0,
        explanation: "1 كيلوبايت = 1024 بايت، و1 ميجابايت = 1024 كيلوبايت."
      },
      {
        q: "أي البرامج يُستخدم لتصفح الإنترنت؟",
        options: ["Word", "Chrome", "Excel"],
        answer: 1,
        explanation: "Chrome متصفح إنترنت، أما Word وExcel فبرامج مكتبية."
      },
      {
        q: "ما وظيفة الذاكرة العشوائية RAM؟",
        options: ["التخزين الدائم", "التخزين المؤقت أثناء التشغيل", "الطباعة"],
        answer: 1,
        explanation: "RAM ذاكرة مؤقتة تُستخدم أثناء تشغيل الجهاز وتُفرَّغ عند إغلاقه."
      }
    ]
  }
];

/* ═══════════════════════════════════════════════════
   الحالة والدوال المساعدة
   ═══════════════════════════════════════════════════ */

var state = {
  grade: "all",
  quiz: null,
  index: 0,
  correct: 0,
  answers: [],
  locked: false
};

var bestScores = {};

function $(id) { return document.getElementById(id); }

function lsGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch (e) {}
}

function lsGetJson(key) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function lsSetJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

function escHtml(text) {
  var d = document.createElement("div");
  d.textContent = String(text);
  return d.innerHTML;
}

var toastTimer = null;

function showToast(msg) {
  var el = $("exToast");
  if (!el) { return; }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
}

/* ═══════════════════════════════════════════════════
   المظهر
   ═══════════════════════════════════════════════════ */

function getStoredThemeMode() {
  var mode = lsGet("theme");
  return (mode === "light" || mode === "dark" || mode === "system") ? mode : "system";
}

function systemPrefersDark() {
  return !!(window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function isDarkNow() {
  var mode = getStoredThemeMode();
  return mode === "dark" || (mode === "system" && systemPrefersDark());
}

function applyTheme() {
  var dark = isDarkNow();
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");

  var icon = $("themeIcon");
  if (icon) { icon.textContent = dark ? "☀️" : "🌙"; }

  var btn = $("themeBtn");
  if (btn) {
    btn.setAttribute("aria-pressed", String(dark));
    btn.title = dark ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الغامق";
    btn.setAttribute("aria-label", btn.title);
  }

  var meta = $("themeColorMeta");
  if (meta) { meta.setAttribute("content", dark ? "#0e1620" : "#128C7E"); }
}

function toggleTheme() {
  var dark = document.documentElement.getAttribute("data-theme") === "dark";
  lsSet("theme", dark ? "light" : "dark");
  applyTheme();
}

/* ═══════════════════════════════════════════════════
   عرض قائمة التدريبات
   ═══════════════════════════════════════════════════ */

function quizGrades(quiz) {
  return quiz.grades || [];
}

function gradesInUse() {
  var found = {};
  EXERCISES.forEach(function (ex) {
    quizGrades(ex).forEach(function (g) { found[g] = true; });
  });
  return GRADES_ORDER.filter(function (g) { return found[g] === true; });
}

function renderFilters() {
  var box = $("gradeFilters");
  var grades = gradesInUse();
  var html = '<button type="button" class="chip" data-grade="all" aria-pressed="' +
    (state.grade === "all") + '">كل الصفوف</button>';

  grades.forEach(function (g) {
    html += '<button type="button" class="chip" data-grade="' + escHtml(g) +
      '" aria-pressed="' + (state.grade === g) + '">' + escHtml(g) + "</button>";
  });

  box.innerHTML = html;
}

function renderStats() {
  var questions = 0;
  EXERCISES.forEach(function (ex) { questions += ex.questions.length; });

  $("exStats").innerHTML =
    '<span class="ex-stat"><b>' + EXERCISES.length + "</b> تدريب</span>" +
    '<span class="ex-stat"><b>' + questions + "</b> سؤال</span>" +
    '<span class="ex-stat">🎁 مجاني بالكامل</span>';
}

function gradeLabel(quiz) {
  var g = quizGrades(quiz);
  if (g.length === 0) { return "كل الصفوف"; }
  if (g.length === 1) { return g[0]; }
  return g[0] + " وأعلى";
}

function renderCatalog() {
  var list = $("quizList");
  var items = EXERCISES.filter(function (ex) {
    return state.grade === "all" || quizGrades(ex).indexOf(state.grade) !== -1;
  });

  if (items.length === 0) {
    list.innerHTML =
      '<div class="empty-state">' +
      '<span class="big" aria-hidden="true">🔍</span>' +
      "<p>لا توجد تدريبات لهذا الصف حتى الآن</p>" +
      "</div>";
    return;
  }

  var html = "";
  items.forEach(function (ex) {
    var best = bestScores[ex.id];
    html +=
      '<article class="quiz-card-item">' +
        '<div class="quiz-card-top">' +
          '<div class="quiz-card-icon" aria-hidden="true">' + ex.icon + "</div>" +
          '<div class="quiz-card-title">' + escHtml(ex.title) + "</div>" +
        "</div>" +
        '<p class="quiz-card-desc">' + escHtml(ex.desc) + "</p>" +
        '<div class="badges">' +
          '<span class="badge subject">' + escHtml(ex.subject) + "</span>" +
          '<span class="badge">' + escHtml(gradeLabel(ex)) + "</span>" +
          '<span class="badge">' + escHtml(ex.difficulty) + "</span>" +
          (best && typeof best.best === "number"
            ? '<span class="badge best">أفضل نتيجة ' + best.best + "%</span>"
            : "") +
        "</div>" +
        '<div class="quiz-card-foot">' +
          '<span class="quiz-meta">⏱️ ' + ex.minutes + " دقائق · " +
            ex.questions.length + " أسئلة</span>" +
          '<button type="button" class="btn-start" data-start="' + escHtml(ex.id) + '">ابدأ التدريب</button>' +
        "</div>" +
      "</article>";
  });

  list.innerHTML = html;
}

/* ═══════════════════════════════════════════════════
   تشغيل التدريب
   ═══════════════════════════════════════════════════ */

function showView(which) {
  $("catalogView").hidden = which !== "catalog";
  $("quizView").hidden = which !== "quiz";
  $("resultView").hidden = which !== "result";
  window.scrollTo(0, 0);
}

function startQuiz(id) {
  var quiz = null;
  EXERCISES.forEach(function (ex) { if (ex.id === id) { quiz = ex; } });
  if (!quiz) { return; }

  state.quiz = quiz;
  state.index = 0;
  state.correct = 0;
  state.answers = [];
  state.locked = false;

  showView("quiz");
  renderQuestion();
}

function renderQuestion() {
  var quiz = state.quiz;
  var q = quiz.questions[state.index];
  state.locked = false;

  $("qCounter").textContent = "سؤال " + (state.index + 1) + " من " + quiz.questions.length;
  $("qScore").textContent = state.correct + " إجابة صحيحة";

  var percent = Math.round((state.index / quiz.questions.length) * 100);
  $("qBar").style.width = percent + "%";
  $("qBar").parentNode.setAttribute("aria-valuenow", String(percent));

  $("qText").textContent = q.q;

  var html = "";
  q.options.forEach(function (opt, i) {
    html +=
      '<button type="button" class="option" data-opt="' + i + '">' +
        '<span class="marker">' + (i + 1) + "</span>" +
        "<span>" + escHtml(opt) + "</span>" +
      "</button>";
  });
  $("qOptions").innerHTML = html;

  var fb = $("qFeedback");
  fb.className = "quiz-feedback";
  fb.innerHTML = "";

  var next = $("qNext");
  next.hidden = true;
  next.textContent = (state.index === quiz.questions.length - 1)
    ? "عرض النتيجة 🎯"
    : "السؤال التالي ←";

  $("qText").setAttribute("tabindex", "-1");
  $("qText").focus({ preventScroll: true });
}

function answerQuestion(optIndex) {
  if (state.locked) { return; }
  state.locked = true;

  var quiz = state.quiz;
  var q = quiz.questions[state.index];
  var buttons = $("qOptions").querySelectorAll(".option");
  var isRight = optIndex === q.answer;

  if (isRight) { state.correct += 1; }
  state.answers.push({ qIndex: state.index, choice: optIndex, right: isRight });

  buttons.forEach(function (btn, i) {
    btn.disabled = true;
    if (i === q.answer) { btn.classList.add("correct"); }
    if (i === optIndex && !isRight) { btn.classList.add("wrong"); }
  });

  $("qScore").textContent = state.correct + " إجابة صحيحة";

  var fb = $("qFeedback");
  fb.className = "quiz-feedback show " + (isRight ? "ok" : "no");
  fb.innerHTML =
    "<b>" + (isRight ? "✅ إجابة صحيحة" : "❌ إجابة غير صحيحة") + "</b>" +
    '<span class="explain">' + escHtml(q.explanation) + "</span>";

  var next = $("qNext");
  next.hidden = false;
  next.focus({ preventScroll: true });
}

function nextQuestion() {
  var quiz = state.quiz;
  if (state.index < quiz.questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  var quiz = state.quiz;
  var total = quiz.questions.length;
  var percent = Math.round((state.correct / total) * 100);

  var best = bestScores[quiz.id] || { best: 0, attempts: 0 };
  best.attempts = (best.attempts || 0) + 1;
  if (percent > (best.best || 0)) { best.best = percent; }
  bestScores[quiz.id] = best;
  lsSetJson("quizBest", bestScores);

  showView("result");

  var ring = $("resultRing");
  ring.style.setProperty("--p", String(percent));
  $("resultPercent").textContent = percent + "%";

  var title = "أحسنت! 🎉";
  var sub = "أجبت إجابة صحيحة عن " + state.correct + " من " + total + " أسئلة.";
  if (percent === 100) {
    title = "علامة كاملة! 🏆";
    sub = "إجاباتك كلها صحيحة، استمر على هذا المستوى.";
  } else if (percent >= 80) {
    title = "نتيجة ممتازة 👏";
  } else if (percent >= 50) {
    title = "نتيجة جيدة 💪";
    sub = "راجع الأسئلة التي أخطأت فيها ثم أعد المحاولة.";
  } else {
    title = "يحتاج مراجعة 📚";
    sub = "لا تقلق، اقرأ الشرح بالأسفل ثم أعد المحاولة.";
  }
  $("resultTitle").textContent = title;
  $("resultSub").textContent = sub;

  $("resultStats").innerHTML =
    '<span class="ex-stat">✅ صحيحة <b>' + state.correct + "</b></span>" +
    '<span class="ex-stat">❌ خاطئة <b>' + (total - state.correct) + "</b></span>" +
    '<span class="ex-stat">🏅 أفضل نتيجة <b>' + best.best + "%</b></span>";

  var review = "";
  state.answers.forEach(function (ans) {
    if (ans.right) { return; }
    var q = quiz.questions[ans.qIndex];
    review +=
      '<div class="review-item">' +
        '<span class="rq">' + escHtml(q.q) + "</span>" +
        '<span class="ra">الإجابة الصحيحة: ' + escHtml(q.options[q.answer]) + "</span>" +
        '<div class="rx">' + escHtml(q.explanation) + "</div>" +
      "</div>";
  });

  $("resultReview").innerHTML = review;

  $("resultTitle").setAttribute("tabindex", "-1");
  $("resultTitle").focus({ preventScroll: true });
}

function retryQuiz() {
  if (state.quiz) { startQuiz(state.quiz.id); }
}

function exitQuiz() {
  state.quiz = null;
  showView("catalog");
  renderCatalog();
}

function backToCatalog() {
  state.quiz = null;
  showView("catalog");
  renderCatalog();
}

/* ═══════════════════════════════════════════════════
   التشغيل
   ═══════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {

  bestScores = lsGetJson("quizBest") || {};

  applyTheme();
  renderStats();
  renderFilters();
  renderCatalog();

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        if (getStoredThemeMode() === "system") { applyTheme(); }
      });
  }

  $("gradeFilters").addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) { return; }
    state.grade = btn.getAttribute("data-grade");
    renderFilters();
    renderCatalog();
  });

  $("quizList").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-start]");
    if (!btn) { return; }
    startQuiz(btn.getAttribute("data-start"));
  });

  $("qOptions").addEventListener("click", function (e) {
    var btn = e.target.closest(".option");
    if (!btn) { return; }
    answerQuestion(Number(btn.getAttribute("data-opt")));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.quiz) { exitQuiz(); }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
});
