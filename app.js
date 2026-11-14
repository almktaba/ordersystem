/*jshint esversion:6*/
/*global STORE_CONFIG*/
"use strict";

/* ═══════════════════════════════════════════════
   متغيرات الحالة
   ═══════════════════════════════════════════════ */
var storeData        = null;
var allProducts      = [];
var filteredProducts = [];
var cart             = [];
var orderHistory     = [];
var confirmCallback  = null;
var selectedGrades   = [];
var deferredInstallPrompt = null;
var installModalOpen = false;

/* ═══════════════════════════════════════════════
   قائمة الصفوف الدراسية (من الأدنى للأعلى)
   ═══════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════
   دوال مساعدة
   ═══════════════════════════════════════════════ */

function fmt(n) {
  return Number(n).toFixed(2);
}

function escHtml(text) {
  var d = document.createElement("div");
  d.textContent = String(text);
  return d.innerHTML;
}

function showToast(msg, type) {
  var t    = type || "success";
  var wrap = document.getElementById("toastWrap");
  var el   = document.createElement("div");
  el.className   = "toast " + t;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(function () {
    if (el.parentNode) { el.parentNode.removeChild(el); }
  }, 3300);
}

function debounce(fn, ms) {
  var timer;
  return function () {
    var args    = arguments;
    var context = this;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(context, args); }, ms);
  };
}

function cartTotal() {
  return cart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
}

function getNow() {
  var now = new Date();
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var day = pad(now.getDate());
  var mon = pad(now.getMonth() + 1);
  var yr  = now.getFullYear();
  var h   = now.getHours();
  var min = pad(now.getMinutes());
  var ap  = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return {
    date: day + "/" + mon + "/" + yr,
    time: pad(h) + ":" + min + " " + ap
  };
}

/* ═══════════════════════════════════════════════
   localStorage — دوال آمنة
   ═══════════════════════════════════════════════ */

function lsGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch (e) {}
}

function lsRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

function lsGetJson(key) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) { return null; }
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function lsSetJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

/* ═══════════════════════════════════════════════
   🌙 المظهر — فاتح / غامق / حسب النظام
   ═══════════════════════════════════════════════ */

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

  var icon = document.getElementById("themeIcon");
  if (icon) { icon.textContent = dark ? "☀️" : "🌙"; }

  var btn = document.getElementById("themeBtn");
  if (btn) {
    btn.setAttribute("aria-pressed", String(dark));
    btn.title = dark ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الغامق";
    btn.setAttribute("aria-label", btn.title);
  }

  var meta = document.getElementById("themeColorMeta");
  if (meta) { meta.setAttribute("content", dark ? "#0e1620" : "#128C7E"); }
}

function toggleTheme() {
  var dark = document.documentElement.getAttribute("data-theme") === "dark";
  lsSet("theme", dark ? "light" : "dark");
  applyTheme();
  showToast(dark ? "تم تفعيل المظهر الفاتح ☀️" : "تم تفعيل المظهر الغامق 🌙", "info");
}

function initTheme() {
  applyTheme();
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        if (getStoredThemeMode() === "system") { applyTheme(); }
      });
  }
}

/* ═══════════════════════════════════════════════
   📲 تثبيت التطبيق على الهاتف (PWA)
   ═══════════════════════════════════════════════ */

function isStandalone() {
  return (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
}

function isIOSDevice() {
  var ua = navigator.userAgent || "";
  return /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function updateInstallUI() {
  var installed = isStandalone();

  var menuItem = document.getElementById("installMenuItem");
  if (menuItem) {
    menuItem.style.display = installed ? "none" : "";
    menuItem.hidden = installed;
  }

  renderOnboardingExtra();

  /* لو النافذة مفتوحة ووصل حدث التثبيت، نحدّث محتواها فورًا */
  if (installModalOpen) { renderInstallModalContent(); }
}

function installStepsHtml() {
  var steps = isIOSDevice()
    ? [
        "افتح الموقع في متصفح سفاري",
        "اضغط زر المشاركة ⬆️ في الأسفل",
        "اختر «إضافة إلى الشاشة الرئيسية»",
        "اضغط «إضافة» وستجد الأيقونة على شاشتك"
      ]
    : [
        "افتح الموقع في متصفح كروم",
        "اضغط قائمة المتصفح ⋮ في الأعلى",
        "اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»",
        "اضغط «تثبيت» وستجد الأيقونة على شاشتك"
      ];

  var html = '<ol class="install-steps">';
  var i;
  for (i = 0; i < steps.length; i++) {
    html +=
      '<li><span class="istep-num">' + (i + 1) + "</span>" +
      "<span>" + escHtml(steps[i]) + "</span></li>";
  }
  html += "</ol>";
  return html;
}

function installHintShort() {
  return isIOSDevice()
    ? "من سفاري: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»."
    : "من كروم: اضغط قائمة المتصفح ⋮ ثم «تثبيت التطبيق».";
}

function installApp() {
  if (isStandalone()) {
    showToast("التطبيق مثبّت على جهازك بالفعل ✅", "info");
    return;
  }

  /* مفيش حدث تثبيت متاح → نعرض الخطوات اليدوية */
  if (!deferredInstallPrompt) {
    showInstallModal(true);
    return;
  }

  var promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;

  closeInstallModal();

  try {
    promptEvent.prompt();
  } catch (err) {
    showInstallModal(true);
    return;
  }

  promptEvent.userChoice.then(function (choice) {
    if (choice && choice.outcome === "accepted") {
      showToast("تم تثبيت التطبيق بنجاح 🎉", "success");
    } else {
      showToast("يمكنك التثبيت في أي وقت من قائمة المساعدة", "info");
    }
    updateInstallUI();
  });
}

/* محتوى نافذة التثبيت — يتبدّل تلقائيًا حسب إمكانية التثبيت بضغطة زر */
function renderInstallModalContent() {
  var body      = document.getElementById("installBody");
  var accept    = document.getElementById("installNowBtn");
  var installed = isStandalone();
  var oneClick  = !installed && !!deferredInstallPrompt;

  if (!body) { return; }

  if (installed) {
    body.innerHTML =
      '<p style="line-height:1.9;">✅ التطبيق مثبّت على جهازك بالفعل، وتجده على الشاشة الرئيسية باسم <b>المكتبة</b>.</p>' +
      '<p class="install-note">لو حذفت الأيقونة، تقدر تعيد التثبيت من قائمة المساعدة في أي وقت.</p>';
  } else if (oneClick) {
    /* متاح التثبيت بضغطة واحدة → بدون أي خطوات */
    body.innerHTML =
      '<p style="line-height:1.9; text-align:center;">كل اللي محتاجه ضغطة واحدة على زر <b>«تثبيت الآن»</b>، وبعدها اضغط <b>«تثبيت»</b> في نافذة المتصفح.</p>' +
      '<p class="install-note">التطبيق المثبّت يفتح أسرع، ويعمل حتى مع ضعف الإنترنت.</p>';
  } else {
    /* المتصفح مش بيسمح بالتثبيت المباشر → نعرض الخطوات */
    body.innerHTML =
      '<p style="line-height:1.8;">لتثبيت المكتبة على شاشتك الرئيسية اتبع الخطوات:</p>' +
      installStepsHtml() +
      '<p class="install-note">التطبيق المثبّت يفتح أسرع، ويعمل حتى مع ضعف الإنترنت.</p>';
  }

  if (accept) { accept.style.display = oneClick ? "" : "none"; }
}

function showInstallModal(force) {
  closeHelpMenu();

  /* لو التثبيت متاح بضغطة زر → نفتح نافذة المتصفح الأصلية على طول بدون نافذة الخطوات */
  if (!force && !isStandalone() && deferredInstallPrompt) {
    installApp();
    return;
  }

  installModalOpen = true;
  renderInstallModalContent();

  document.getElementById("installModal").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeInstallModal() {
  var modal = document.getElementById("installModal");
  if (!modal) { return; }
  installModalOpen = false;
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

/* ═══════════════════════════════════════════════
   Feature 1 — نظام تحديث المنتجات (Auto Update)
   ═══════════════════════════════════════════════ */

function checkProductsVersion() {
  var currentVer = (STORE_CONFIG && STORE_CONFIG.version)
    ? String(STORE_CONFIG.version)
    : null;

  if (!currentVer) { return; }

  var storedVer = lsGet("productsVersion");

  if (!storedVer) {
    lsSet("productsVersion", currentVer);
    return;
  }

  if (storedVer === currentVer) { return; }

  lsRemove("cart");
  cart = [];
  lsSet("productsVersion", currentVer);

  showToast("تم تحديث قائمة المنتجات", "info");
}

/* ═══════════════════════════════════════════════
   تحميل البيانات
   ═══════════════════════════════════════════════ */

function loadProducts() {
  var grid = document.getElementById("productsGrid");

  grid.innerHTML =
    '<div class="loading"><div class="spinner"></div><p>جاري التحميل...</p></div>';

  if (typeof STORE_CONFIG === "undefined"        ||
      !STORE_CONFIG.storeName                    ||
      !STORE_CONFIG.currency                     ||
      !Array.isArray(STORE_CONFIG.products)) {

    document.getElementById("alertBar").textContent =
      "تعذر تحميل ملف products.js - تاكد من وجوده في نفس المجلد";
    document.getElementById("alertBar").classList.add("show");

    grid.innerHTML =
      '<div class="no-results">' +
      '<span class="big-emoji">⚠️</span>' +
      "<p>لا يمكن تشغيل النظام بدون ملف المنتجات</p>" +
      "</div>";
    return;
  }

  storeData        = STORE_CONFIG;
  allProducts      = STORE_CONFIG.products;
  filteredProducts = allProducts.slice();

  checkProductsVersion();

  loadCart();
  loadHistory();
  loadSelectedGrades();

  initUI();
  initOnboarding();
}

/* ═══════════════════════════════════════════════
   تهيئة الواجهة
   ═══════════════════════════════════════════════ */

function initUI() {
  document.getElementById("storeName").textContent = storeData.storeName;
  document.title = storeData.storeName;
  document.getElementById("footerText").textContent =
    storeData.storeName + " - نظام الطلبيات - " + new Date().getFullYear();

  updateCartBadge();
  updateHistoryBadge();
  updateCustomerAreaBadge();
  updateInstallUI();

  applyGradeFilter();
}

/* ═══════════════════════════════════════════════
   دالة مساعدة — استخراج tags المنتج
   ═══════════════════════════════════════════════ */
function getProductTags(p) {
  if (Array.isArray(p.tags) && p.tags.length > 0) { return p.tags; }
  if (p.tag && typeof p.tag === "string" && p.tag.trim() !== "") { return [p.tag]; }
  return [];
}

/* ═══════════════════════════════════════════════
   استخراج الصفوف الدراسية من المنتجات
   ═══════════════════════════════════════════════ */
function buildGradesList() {
  var found = {};
  var i, j, tags;

  for (i = 0; i < allProducts.length; i++) {
    tags = getProductTags(allProducts[i]);
    for (j = 0; j < tags.length; j++) {
      found[tags[j]] = true;
    }
  }

  return GRADES_ORDER.filter(function (g) {
    return found[g] === true;
  });
}

/* ═══════════════════════════════════════════════
   حفظ وتحميل الصفوف المختارة
   ═══════════════════════════════════════════════ */
function saveSelectedGrades() {
  lsSetJson("selectedGrades", selectedGrades);
}

function loadSelectedGrades() {
  var saved = lsGetJson("selectedGrades");
  if (saved && Array.isArray(saved)) {
    selectedGrades = saved;
  } else {
    selectedGrades = [];
  }
}

/* ═══════════════════════════════════════════════
   فلترة المنتجات بناءً على الصفوف المختارة + البحث
   ═══════════════════════════════════════════════ */
function applyGradeFilter() {
  var searchEl = document.getElementById("searchInput");
  var q        = searchEl ? searchEl.value.trim().toLowerCase() : "";
  var words    = q.split(/\s+/).filter(function (w) { return w.length > 0; });

  filteredProducts = allProducts.filter(function (p) {

    /* فلتر الصفوف الدراسية */
    if (selectedGrades.length > 0) {
      var tags  = getProductTags(p);
      var match = false;
      var i, j;
      for (i = 0; i < tags.length; i++) {
        for (j = 0; j < selectedGrades.length; j++) {
          if (tags[i] === selectedGrades[j]) {
            match = true;
            break;
          }
        }
        if (match) { break; }
      }
      if (!match) { return false; }
    }

    /* Smart Search — AND-based */
    if (words.length > 0) {
      var name = p.name.toLowerCase();
      var k;
      for (k = 0; k < words.length; k++) {
        if (name.indexOf(words[k]) === -1) { return false; }
      }
    }

    return true;
  });

  renderProducts();
}

/* ═══════════════════════════════════════════════
   منطقة العميل — Customer Area
   ═══════════════════════════════════════════════ */

function toggleCustomerArea() {
  var panel = document.getElementById("customerPanel");
  if (panel.classList.contains("open")) {
    closeCustomerArea();
  } else {
    closeCart();
    renderCustomerArea();
    panel.classList.add("open");
    document.getElementById("overlay").classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeCustomerArea() {
  document.getElementById("customerPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  document.body.style.overflow = "";
}

function renderCustomerArea() {
  var grades = buildGradesList();
  var body   = document.getElementById("customerBody");
  var footer = document.getElementById("customerFooter");

  var gradesHtml = "";
  var i;

  for (i = 0; i < grades.length; i++) {
    var g          = grades[i];
    var isSelected = selectedGrades.indexOf(g) !== -1;
    gradesHtml +=
      '<button class="grade-btn' + (isSelected ? " selected" : "") + '" ' +
        'onclick="toggleGrade(this, \'' + escHtml(g) + '\')">' +
        escHtml(g) +
      '</button>';
  }

  body.innerHTML =
    '<div class="customer-section">' +
      '<div class="customer-section-title">📚 اختر الصف الدراسي</div>' +
      '<div class="customer-section-hint">يمكنك اختيار صف واحد أو أكثر — الفلترة فورية</div>' +
      '<div class="grades-wrap" id="gradesWrap">' +
        gradesHtml +
      '</div>' +
    '</div>' +
    '<div class="customer-section" id="customerHistorySection">' +
      '<div class="customer-section-title">📋 الطلبيات السابقة</div>' +
      renderHistoryInCustomer() +
    '</div>';

  updateCustomerFooter();
}

function renderHistoryInCustomer() {
  if (orderHistory.length === 0) {
    return '<div class="panel-empty" style="padding:20px 0;">' +
           '<span class="empty-icon" style="font-size:2rem;">📋</span>' +
           '<p>لا توجد طلبيات سابقة</p>' +
           '</div>';
  }

  var html  = '<div class="customer-history-list">';
  var limit = Math.min(orderHistory.length, 5);
  var i;

  for (i = 0; i < limit; i++) {
    var order = orderHistory[i];
    html +=
      '<div class="customer-order-item">' +
        '<div class="customer-order-head">' +
          '<span class="customer-order-name">' + escHtml(order.buyerName) + '</span>' +
          '<span class="customer-order-total">' +
            fmt(order.total) + ' ' + escHtml(order.currency) +
          '</span>' +
        '</div>' +
        '<div class="customer-order-meta">' +
          escHtml(order.date) + ' — ' + escHtml(order.time) +
        '</div>' +
        '<div class="customer-order-actions">' +
          '<button class="btn-order-action btn-order-resend" ' +
            'onclick="resendOrder(' + i + ')">📤 إعادة إرسال</button>' +
          '<button class="btn-order-action btn-order-img" ' +
            'onclick="downloadImage(' + i + ')">🖼️ صورة</button>' +
          '<button class="btn-order-action btn-order-del" ' +
            'onclick="deleteOrderFromCustomer(' + i + ')">🗑️ حذف</button>' +
        '</div>' +
      '</div>';
  }

  if (orderHistory.length > 5) {
    html +=
      '<button class="btn-show-all-history" onclick="showFullHistory()">' +
        '📋 عرض كل الطلبيات (' + orderHistory.length + ')' +
      '</button>';
  }

  html += '</div>';
  return html;
}

/* اختيار/إلغاء صف — فلترة فورية */
function toggleGrade(btn, grade) {
  var idx = selectedGrades.indexOf(grade);
  if (idx === -1) {
    selectedGrades.push(grade);
    btn.classList.add("selected");
  } else {
    selectedGrades.splice(idx, 1);
    btn.classList.remove("selected");
  }
  saveSelectedGrades();
  updateCustomerAreaBadge();
  updateCustomerFooter();

  /* فلترة فورية */
  applyGradeFilter();
}

function updateCustomerFooter() {
  var footer = document.getElementById("customerFooter");
  if (!footer) { return; }

  if (selectedGrades.length > 0) {
    footer.innerHTML =
      '<div class="customer-selected-info">' +
        '✅ تم اختيار ' + selectedGrades.length + ' صف دراسي' +
        ' — عرض ' + filteredProducts.length + ' منتج' +
      '</div>' +
      '<button class="btn-clear-grades" onclick="clearGrades()">' +
        '✕ إلغاء الاختيار وعرض الكل' +
      '</button>';
  } else {
    footer.innerHTML =
      '<div class="customer-selected-info" style="color:#888;">' +
        'لم يتم اختيار أي صف — يتم عرض كل المنتجات (' + allProducts.length + ')' +
      '</div>';
  }
  footer.style.display = "block";
}

function clearGrades() {
  selectedGrades = [];
  saveSelectedGrades();
  updateCustomerAreaBadge();

  var btns = document.querySelectorAll(".grade-btn");
  var i;
  for (i = 0; i < btns.length; i++) {
    btns[i].classList.remove("selected");
  }

  applyGradeFilter();
  updateCustomerFooter();
}

function updateCustomerAreaBadge() {
  var badge = document.getElementById("customerBadge");
  if (!badge) { return; }
  if (selectedGrades.length > 0) {
    badge.textContent = selectedGrades.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function deleteOrderFromCustomer(idx) {
  showConfirm({
    icon:    "🗑️",
    title:   "حذف الطلبية",
    msg:     "هل تريد حذف هذه الطلبية نهائياً؟",
    yesText: "نعم احذفها",
    onYes:   function () {
      orderHistory.splice(idx, 1);
      saveHistory();
      updateHistoryBadge();
      var section = document.getElementById("customerHistorySection");
      if (section) {
        section.innerHTML =
          '<div class="customer-section-title">📋 الطلبيات السابقة</div>' +
          renderHistoryInCustomer();
      }
      showToast("تم حذف الطلبية", "info");
    }
  });
}

function showFullHistory() {
  closeCustomerArea();
  setTimeout(function () { toggleHistory(); }, 350);
}

/* ═══════════════════════════════════════════════
   عرض المنتجات
   ═══════════════════════════════════════════════ */

function renderProducts() {
  var grid = document.getElementById("productsGrid");
  var info = document.getElementById("resultsInfo");

  if (filteredProducts.length === 0) {
    grid.innerHTML =
      '<div class="no-results">' +
      '<span class="big-emoji">😕</span>' +
      "<p>لا توجد نتائج مطابقة</p>" +
      "</div>";
    if (info) {
      info.textContent = "عرض 0 من اصل " + allProducts.length + " منتج";
    }
    return;
  }

  if (info) {
    if (filteredProducts.length === allProducts.length) {
      info.textContent = "عرض " + allProducts.length + " منتج";
    } else {
      info.textContent =
        "عرض " + filteredProducts.length +
        " من اصل " + allProducts.length + " منتج";
    }
  }

  var parts = [];
  var i, product, idx;

  for (i = 0; i < filteredProducts.length; i++) {
    product = filteredProducts[i];
    idx     = allProducts.indexOf(product);

    parts.push(
      '<div class="product-card" id="card-' + idx + '">' +
        '<div class="product-name">'  + escHtml(product.name)  + '</div>' +
        '<div class="product-price">' + fmt(product.price) +
          ' ' + escHtml(storeData.currency) + '</div>' +
        '<div class="product-controls">' +
          '<div class="qty-wrapper">' +
            '<button class="qty-btn" aria-label="تقليل الكمية" onclick="chQty(' + idx + ', -1)">-</button>' +
            '<input class="qty-input" type="number" aria-label="الكمية" ' +
              'id="qty-' + idx + '" value="1" min="1" max="999">' +
            '<button class="qty-btn" aria-label="زيادة الكمية" onclick="chQty(' + idx + ', 1)">+</button>' +
          '</div>' +
          '<button class="add-to-cart-btn" onclick="addToCart(' + idx + ')">' +
            'اضف للسلة' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  grid.innerHTML = parts.join("");
}

/* ═══════════════════════════════════════════════
   البحث
   ═══════════════════════════════════════════════ */

var doSearch = debounce(function () {
  applyGradeFilter();
}, 300);

function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("searchClear").classList.remove("show");
  applyGradeFilter();
  document.getElementById("searchInput").focus();
}

/* ═══════════════════════════════════════════════
   ازرار الكمية في البطاقات
   ═══════════════════════════════════════════════ */

function chQty(idx, delta) {
  var input = document.getElementById("qty-" + idx);
  if (!input) { return; }
  var val = (parseInt(input.value, 10) || 1) + delta;
  if (val < 1)   { val = 1; }
  if (val > 999) { val = 999; }
  input.value = val;
}

/* ═══════════════════════════════════════════════
   ادارة السلة
   ═══════════════════════════════════════════════ */

function addToCart(idx) {
  var product  = allProducts[idx];
  if (!product) { return; }

  var qtyInput = document.getElementById("qty-" + idx);
  var quantity = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

  var existing = null;
  var i;
  for (i = 0; i < cart.length; i++) {
    if (cart[i].name === product.name) {
      existing = cart[i];
      break;
    }
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ name: product.name, price: product.price, quantity: quantity });
  }

  saveCart();
  updateCartBadge();

  if (qtyInput) { qtyInput.value = 1; }

  var card = document.getElementById("card-" + idx);
  if (card) {
    card.classList.add("flash");
    setTimeout(function () { card.classList.remove("flash"); }, 650);
  }

  showToast("تمت اضافة " + product.name, "success");
}

function removeFromCart(idx) {
  if (idx < 0 || idx >= cart.length) { return; }
  var name = cart[idx].name;
  cart.splice(idx, 1);
  saveCart();
  updateCartBadge();
  renderCartBody();
  showToast("تم حذف " + name, "info");
}

function updateQty(idx, delta) {
  if (idx < 0 || idx >= cart.length) { return; }
  cart[idx].quantity += delta;
  if (cart[idx].quantity < 1) {
    removeFromCart(idx);
    return;
  }
  saveCart();
  updateCartBadge();
  renderCartBody();
}

function saveCart() {
  lsSetJson("cart", cart);
}

function loadCart() {
  var saved = lsGetJson("cart");
  if (saved && Array.isArray(saved)) {
    cart = saved;
  } else {
    cart = [];
  }
}

function updateCartBadge() {
  var badge  = document.getElementById("cartBadge");
  var header = document.getElementById("cartTotalHeader");
  var count  = cart.length;

  badge.textContent = count;
  if (count === 0) {
    badge.classList.add("hidden");
  } else {
    badge.classList.remove("hidden");
  }

  header.textContent =
    fmt(cartTotal()) + " " + (storeData ? storeData.currency : "");
}

function clearCart() {
  showConfirm({
    icon:    "🗑️",
    title:   "تفريغ السلة",
    msg:     "هل تريد تفريغ السلة بالكامل؟",
    yesText: "نعم",
    onYes:   function () {
      cart = [];
      saveCart();
      updateCartBadge();
      renderCartBody();
      showToast("تم تفريغ السلة", "info");
    }
  });
}

/* ═══════════════════════════════════════════════
   عرض لوحة السلة
   ═══════════════════════════════════════════════ */

function renderCartBody() {
  var body   = document.getElementById("cartBody");
  var footer = document.getElementById("cartFooter");

  if (cart.length === 0) {
    body.innerHTML =
      '<div class="panel-empty">' +
      '<span class="empty-icon">🛒</span>' +
      "<p>السلة فارغة</p>" +
      "</div>";
    footer.innerHTML     = "";
    footer.style.display = "none";
    return;
  }

  var parts = [];
  var i, item, sub;

  for (i = 0; i < cart.length; i++) {
    item = cart[i];
    sub  = item.price * item.quantity;
    parts.push(
      '<div class="cart-item">' +
        '<button class="cart-item-del" onclick="removeFromCart(' + i + ')">✕</button>' +
        '<div class="cart-item-name">'  + escHtml(item.name)  + '</div>' +
        '<div class="cart-item-price">السعر: ' +
          fmt(item.price) + ' ' + escHtml(storeData.currency) +
        '</div>' +
        '<div class="cart-item-row">' +
          '<div class="qty-mini">' +
            '<button class="qty-mini-btn" onclick="updateQty(' + i + ', -1)">-</button>' +
            '<div class="qty-mini-val">' + item.quantity + '</div>' +
            '<button class="qty-mini-btn" onclick="updateQty(' + i + ', 1)">+</button>' +
          '</div>' +
          '<div class="cart-item-subtotal">' +
            fmt(sub) + ' ' + escHtml(storeData.currency) +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  body.innerHTML = parts.join("");

  footer.innerHTML =
    '<div class="cart-summary">' +
      '<span>عدد الاصناف</span>' +
      '<span>' + cart.length + ' صنف</span>' +
    '</div>' +
    '<div class="cart-grand-total">' +
      '<span class="label">الاجمالي الكلي</span>' +
      '<span class="amount">' +
        fmt(cartTotal()) + ' ' + escHtml(storeData.currency) +
      '</span>' +
    '</div>' +
    '<div class="cart-actions">' +
      '<button class="btn-whatsapp" onclick="showCheckout()">' +
        '📤 ارسال الطلبية عبر واتساب' +
      '</button>' +
      '<button class="btn-danger-outline" onclick="clearCart()">🗑️ تفريغ السلة</button>' +
    '</div>';

  footer.style.display = "block";
}

/* ═══════════════════════════════════════════════
   فتح واغلاق اللوحات
   ═══════════════════════════════════════════════ */

function toggleCart() {
  var panel = document.getElementById("cartPanel");
  if (panel.classList.contains("open")) {
    closeCart();
  } else {
    closeCustomerArea();
    closeHistory();
    renderCartBody();
    panel.classList.add("open");
    document.getElementById("overlay").classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  document.body.style.overflow = "";
}

function toggleHistory() {
  var panel = document.getElementById("historyPanel");
  if (panel.classList.contains("open")) {
    closeHistory();
  } else {
    closeCart();
    closeCustomerArea();
    renderHistory();
    panel.classList.add("open");
    document.getElementById("overlay").classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeHistory() {
  document.getElementById("historyPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  document.body.style.overflow = "";
}

function closeAllPanels() {
  closeCart();
  closeHistory();
  closeCustomerArea();
}

/* ═══════════════════════════════════════════════
   Modal بيانات المشتري
   ═══════════════════════════════════════════════ */

function showCheckout() {
  if (cart.length === 0) {
    showToast("السلة فارغة", "error");
    return;
  }

  if (!storeData.whatsapp || storeData.whatsapp.trim() === "") {
    showToast("لم يتم تحديد رقم واتساب", "error");
    return;
  }

  closeCart();

  document.getElementById("buyerName").value  = "";
  document.getElementById("buyerPhone").value = "";
  document.getElementById("buyerNotes").value = "";
  document.getElementById("nameErr").classList.remove("show");
  document.getElementById("phoneErr").classList.remove("show");
  document.getElementById("buyerName").classList.remove("input-err");
  document.getElementById("buyerPhone").classList.remove("input-err");

  setTimeout(function () {
    document.getElementById("checkoutModal").classList.add("show");
    document.body.style.overflow = "hidden";
    document.getElementById("buyerName").focus();
  }, 350);
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("show");
  document.body.style.overflow = "";
}

/* ═══════════════════════════════════════════════
   بناء الرسالة
   ═══════════════════════════════════════════════ */

function buildMessage(order) {
  var line = "-------------------";
  var msg  = "";

  msg += line + "\n";
  msg += storeData.storeName + "\n";
  msg += "طلبية جديدة\n";
  msg += line + "\n\n";

  msg += "الاسم: "   + order.buyerName  + "\n";
  msg += "الهاتف: "  + order.buyerPhone + "\n";
  msg += "التاريخ: " + order.date       + "\n";
  msg += "الوقت: "   + order.time       + "\n\n";

  msg += line + "\n";
  msg += "تفاصيل الطلبية:\n";
  msg += line + "\n\n";

  var i;
  for (i = 0; i < order.items.length; i++) {
    var item = order.items[i];
    var sub  = item.price * item.quantity;
    msg += (i + 1) + ". " + item.name + "\n";
    msg += "   " + item.quantity + " x " + fmt(item.price) +
           " = " + fmt(sub) + " " + order.currency + "\n\n";
  }

  msg += line + "\n";
  msg += "الاجمالي: " + fmt(order.total) + " " + order.currency + "\n";
  msg += line;

  if (order.notes && order.notes.trim() !== "") {
    msg += "\n\nملاحظات: " + order.notes;
  }

  return msg;
}

/* ═══════════════════════════════════════════════
   فتح واتساب
   ═══════════════════════════════════════════════ */

function openWhatsApp(msg) {
  var wa = storeData.whatsapp.trim();

  if (wa.indexOf("http") === 0) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(function () {
        showToast("تم نسخ الرسالة - الصقها في المجموعة", "success");
      }).catch(function () {
        showToast("افتح المجموعة والصق الرسالة يدويا", "warning");
      });
    } else {
      showToast("افتح المجموعة والصق الرسالة يدويا", "warning");
    }
    window.open(wa, "_blank");
  } else {
    var cleanPhone = wa.replace(/\D/g, "");
    var encoded    = encodeURIComponent(msg);
    window.open("https://wa.me/" + cleanPhone + "?text=" + encoded, "_blank");
  }
}

/* ═══════════════════════════════════════════════
   ارسال الطلبية
   ═══════════════════════════════════════════════ */

function sendToWhatsApp() {
  var nameEl  = document.getElementById("buyerName");
  var phoneEl = document.getElementById("buyerPhone");
  var notesEl = document.getElementById("buyerNotes");

  var name  = nameEl.value.trim();
  var phone = phoneEl.value.trim();
  var notes = notesEl.value.trim();

  var hasError = false;

  if (!name) {
    nameEl.classList.add("input-err");
    document.getElementById("nameErr").classList.add("show");
    hasError = true;
  } else {
    nameEl.classList.remove("input-err");
    document.getElementById("nameErr").classList.remove("show");
  }

  if (!phone) {
    phoneEl.classList.add("input-err");
    document.getElementById("phoneErr").classList.add("show");
    hasError = true;
  } else {
    phoneEl.classList.remove("input-err");
    document.getElementById("phoneErr").classList.remove("show");
  }

  if (hasError) {
    showToast("يرجى ملء الاسم والهاتف", "error");
    if (!name) { nameEl.focus(); } else { phoneEl.focus(); }
    return;
  }

  var dt    = getNow();
  var order = {
    storeName:  storeData.storeName,
    buyerName:  name,
    buyerPhone: phone,
    notes:      notes,
    date:       dt.date,
    time:       dt.time,
    total:      cartTotal(),
    currency:   storeData.currency,
    items:      cart.map(function (item) {
      return { name: item.name, price: item.price, quantity: item.quantity };
    })
  };

  orderHistory.unshift(order);
  saveHistory();
  updateHistoryBadge();

  cart = [];
  saveCart();
  updateCartBadge();
  closeCheckout();

  var msg = buildMessage(order);
  openWhatsApp(msg);
}

/* ═══════════════════════════════════════════════
   اعادة ارسال طلبية سابقة
   ═══════════════════════════════════════════════ */

function resendOrder(idx) {
  var order = orderHistory[idx];
  if (!order) { return; }
  var msg = buildMessage(order);
  openWhatsApp(msg);
}

/* ═══════════════════════════════════════════════
   تصدير صورة PNG
   ═══════════════════════════════════════════════ */

function downloadImage(idx) {
  var order = orderHistory[idx];
  if (!order) { return; }

  var canvas  = document.createElement("canvas");
  var W       = 800;
  var padding = 30;
  var y       = padding;

  var extraH = order.notes ? 70 : 0;
  var totalH = 200 + order.items.length * 42 + extraH + 60;
  canvas.width  = W;
  canvas.height = totalH;

  var ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, totalH);

  ctx.fillStyle = "#128C7E";
  ctx.fillRect(0, 0, W, 80);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font      = "bold 26px Arial";
  ctx.fillText(storeData.storeName, W / 2, 38);
  ctx.font = "15px Arial";
  ctx.fillText("فاتورة طلبية", W / 2, 62);

  y = 100;

  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(padding, y, W - padding * 2, 70);

  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "right";
  ctx.font      = "bold 15px Arial";
  ctx.fillText("العميل: " + order.buyerName, W - padding - 5, y + 22);

  ctx.font      = "13px Arial";
  ctx.fillStyle = "#555555";
  if (order.buyerPhone) {
    ctx.fillText("الهاتف: " + order.buyerPhone, W - padding - 5, y + 42);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#555555";
  ctx.fillText("التاريخ: " + order.date, padding + 5, y + 22);
  ctx.fillText("الوقت: "  + order.time,  padding + 5, y + 42);

  y += 80;

  ctx.fillStyle = "#f0f2f5";
  ctx.fillRect(padding, y, W - padding * 2, 36);

  ctx.fillStyle = "#666666";
  ctx.font      = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText("#",        padding + 18,     y + 23);
  ctx.textAlign = "right";
  ctx.fillText("المنتج",   W - padding - 10, y + 23);
  ctx.textAlign = "center";
  ctx.fillText("الكمية",   W / 2 + 60,       y + 23);
  ctx.fillText("السعر",    W / 2 - 30,       y + 23);
  ctx.textAlign = "left";
  ctx.fillText("الاجمالي", padding + 40,     y + 23);

  y += 36;

  var j;
  for (j = 0; j < order.items.length; j++) {
    var item  = order.items[j];
    var sub   = item.price * item.quantity;
    var rowBg = j % 2 === 0 ? "#ffffff" : "#f8f9fa";

    ctx.fillStyle = rowBg;
    ctx.fillRect(padding, y, W - padding * 2, 40);

    ctx.fillStyle = "#aaaaaa";
    ctx.font      = "13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(String(j + 1), padding + 18, y + 25);

    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "right";
    ctx.fillText(item.name, W - padding - 10, y + 25);

    ctx.textAlign = "center";
    ctx.fillText(String(item.quantity), W / 2 + 60, y + 25);
    ctx.fillText(fmt(item.price),       W / 2 - 30, y + 25);

    ctx.fillStyle = "#128C7E";
    ctx.font      = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(fmt(sub) + " " + order.currency, padding + 40, y + 25);

    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(padding,     y + 40);
    ctx.lineTo(W - padding, y + 40);
    ctx.stroke();

    y += 40;
  }

  y += 6;

  ctx.fillStyle = "#128C7E";
  ctx.fillRect(padding, y, W - padding * 2, 48);

  ctx.fillStyle = "#ffffff";
  ctx.font      = "bold 16px Arial";
  ctx.textAlign = "right";
  ctx.fillText("الاجمالي الكلي", W - padding - 10, y + 30);

  ctx.textAlign = "left";
  ctx.font      = "bold 20px Arial";
  ctx.fillText(fmt(order.total) + " " + order.currency, padding + 10, y + 30);

  y += 58;

  if (order.notes) {
    ctx.fillStyle = "#fff9e6";
    ctx.fillRect(padding, y, W - padding * 2, 44);

    ctx.fillStyle = "#f39c12";
    ctx.fillRect(padding, y, 5, 44);

    ctx.fillStyle  = "#7d6608";
    ctx.font       = "13px Arial";
    ctx.textAlign  = "right";
    ctx.fillText("ملاحظات: " + order.notes, W - padding - 10, y + 28);
    y += 54;
  }

  ctx.fillStyle  = "#aaaaaa";
  ctx.font       = "11px Arial";
  ctx.textAlign  = "center";
  ctx.fillText("نظام الطلبيات - " + storeData.storeName, W / 2, y + 22);

  canvas.toBlob(function (blob) {
    var url  = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.download =
      "طلبية_" + order.buyerName +
      "_" + order.date.replace(/\//g, "-") + ".png";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل الصورة بنجاح", "success");
  }, "image/png");
}

/* ═══════════════════════════════════════════════
   سجل الطلبيات
   ═══════════════════════════════════════════════ */

function saveHistory() {
  lsSetJson("orderHistory", orderHistory);
}

function loadHistory() {
  var saved = lsGetJson("orderHistory");
  if (saved && Array.isArray(saved)) {
    orderHistory = saved;
  } else {
    orderHistory = [];
  }
}

function updateHistoryBadge() {
  var badge = document.getElementById("historyBadge");
  if (!badge) { return; }
  badge.textContent = orderHistory.length;
  if (orderHistory.length === 0) {
    badge.classList.add("hidden");
  } else {
    badge.classList.remove("hidden");
  }
}

function deleteOrder(idx) {
  showConfirm({
    icon:    "🗑️",
    title:   "حذف الطلبية",
    msg:     "هل تريد حذف هذه الطلبية نهائيا؟",
    yesText: "نعم احذفها",
    onYes:   function () {
      orderHistory.splice(idx, 1);
      saveHistory();
      updateHistoryBadge();
      renderHistory();
      showToast("تم حذف الطلبية", "info");
    }
  });
}

function clearAllHistory() {
  showConfirm({
    icon:    "🗑️",
    title:   "مسح كل السجل",
    msg:     "سيتم حذف جميع الطلبيات السابقة نهائيا.",
    yesText: "نعم امسح الكل",
    onYes:   function () {
      orderHistory = [];
      saveHistory();
      updateHistoryBadge();
      renderHistory();
      showToast("تم مسح السجل", "info");
    }
  });
}

/* ═══════════════════════════════════════════════
   عرض لوحة السجل الكاملة
   ═══════════════════════════════════════════════ */

function renderHistory() {
  var body   = document.getElementById("historyBody");
  var footer = document.getElementById("historyFooter");

  if (orderHistory.length === 0) {
    body.innerHTML =
      '<div class="panel-empty">' +
      '<span class="empty-icon">📋</span>' +
      "<p>لا توجد طلبيات سابقة</p>" +
      "</div>";
    footer.innerHTML     = "";
    footer.style.display = "none";
    return;
  }

  var parts = [];
  var i;

  for (i = 0; i < orderHistory.length; i++) {
    var order    = orderHistory[i];
    var rowsHTML = "";
    var j;

    for (j = 0; j < order.items.length; j++) {
      var item = order.items[j];
      var sub  = item.price * item.quantity;
      rowsHTML +=
        "<tr>" +
          "<td style='text-align:center;color:#888;'>" + (j + 1) + "</td>" +
          "<td>" + escHtml(item.name) + "</td>" +
          "<td style='text-align:center;'>" + item.quantity + "</td>" +
          "<td style='text-align:center;'>" + fmt(item.price) + "</td>" +
          "<td style='text-align:center;font-weight:700;color:#128C7E;'>" +
            fmt(sub) + " " + escHtml(order.currency) +
          "</td>" +
        "</tr>";
    }

    var notesHTML = "";
    if (order.notes) {
      notesHTML =
        '<div class="order-notes">📝 ملاحظات: ' + escHtml(order.notes) + "</div>";
    }

    var metaPhone = order.buyerPhone ? " - " + escHtml(order.buyerPhone) : "";

    parts.push(
      '<div class="order-card">' +
        '<div class="order-card-head">' +
          "<div>" +
            '<div class="order-buyer-name">' + escHtml(order.buyerName) + "</div>" +
            '<div class="order-meta">' +
              metaPhone +
              " - " + escHtml(order.date) +
              " - " + escHtml(order.time) +
            "</div>" +
          "</div>" +
          '<div class="order-total">' +
            fmt(order.total) + " " + escHtml(order.currency) +
          "</div>" +
        "</div>" +
        '<div class="order-card-body">' +
          '<table class="order-table">' +
            "<thead><tr>" +
              "<th>#</th><th>المنتج</th><th>الكمية</th>" +
              "<th>السعر</th><th>الاجمالي</th>" +
            "</tr></thead>" +
            "<tbody>" + rowsHTML + "</tbody>" +
          "</table>" +
          notesHTML +
          '<div class="order-card-actions">' +
            '<button class="btn-order-action btn-order-resend" ' +
              'onclick="resendOrder(' + i + ')">📤 اعادة ارسال</button>' +
            '<button class="btn-order-action btn-order-img" ' +
              'onclick="downloadImage(' + i + ')">🖼️ تحميل صورة</button>' +
            '<button class="btn-order-action btn-order-del" ' +
              'onclick="deleteOrder(' + i + ')">🗑️ حذف</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  body.innerHTML = parts.join("");

  footer.innerHTML =
    '<button class="btn-danger-outline" onclick="clearAllHistory()">' +
    "🗑️ مسح كل الطلبيات السابقة" +
    "</button>";
  footer.style.display = "block";
}

/* ═══════════════════════════════════════════════
   مسح جميع البيانات
   ═══════════════════════════════════════════════ */

function confirmClearAllData() {
  showConfirm({
    icon:    "🗑️",
    title:   "مسح جميع البيانات",
    msg:     "سيتم حذف السلة وجميع الطلبيات المحفوظة نهائيا.",
    yesText: "نعم امسح كل شيء",
    onYes:   function () {
      lsRemove("cart");
      lsRemove("orderHistory");
      cart         = [];
      orderHistory = [];
      updateCartBadge();
      updateHistoryBadge();
      renderCartBody();
      renderHistory();
      showToast("تم مسح جميع البيانات", "info");
    }
  });
}

/* ═══════════════════════════════════════════════
   Modal تاكيد
   ═══════════════════════════════════════════════ */

function showConfirm(opts) {
  document.getElementById("cfmIcon").textContent  = opts.icon    || "⚠️";
  document.getElementById("cfmTitle").textContent = opts.title   || "تاكيد";
  document.getElementById("cfmMsg").textContent   = opts.msg     || "";
  document.getElementById("cfmYes").textContent   = opts.yesText || "نعم";
  confirmCallback = opts.onYes || null;
  document.getElementById("confirmOverlay").classList.add("show");
}

function closeConfirm() {
  document.getElementById("confirmOverlay").classList.remove("show");
  confirmCallback = null;
}

/* ═══════════════════════════════════════════════
   Onboarding — أول زيارة
   بعد انتهاء/تخطي الجولة → تفتح منطقة العميل
   ═══════════════════════════════════════════════ */

var ONBOARDING_STEPS = [
  {
    icon:  "👤",
    title: "منطقة العميل",
    desc:  "اضغط على زر «منطقتي» واختار الصف الدراسي لابنك أو بنتك عشان تشوف كتبه بس"
  },
  {
    icon:  "🛒",
    title: "اضف المنتجات للسلة",
    desc:  "لما تلاقي الكتاب اللي عايزه، اضغط «اضف للسلة» وهيتحفظ ليك"
  },
  {
    icon:  "📤",
    title: "ابعت طلبك على واتساب",
    desc:  "افتح السلة من الزر اللي في أعلى الشاشة، ثم اضغط «ارسال الطلبية» وهيفتح واتساب تلقائيًا"
  },
  {
    icon:  "📲",
    title: "ثبّت التطبيق على شاشتك",
    desc:  "أضف المكتبة إلى الشاشة الرئيسية لتفتحها بضغطة واحدة وتعمل بسرعة حتى مع ضعف الإنترنت",
    install: true
  }
];

var onboardingCurrentStep = 0;

function initOnboarding() {
  var done = lsGet("onboardingDone");
  if (done === "1") { return; }
  setTimeout(function () { showOnboarding(0); }, 800);
}

function showOnboarding(stepIndex) {
  onboardingCurrentStep = stepIndex || 0;
  renderOnboardingStep();
  var overlay = document.getElementById("onboardingOverlay");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function renderOnboardingStep() {
  var step   = ONBOARDING_STEPS[onboardingCurrentStep];
  var total  = ONBOARDING_STEPS.length;
  var isLast = onboardingCurrentStep === total - 1;

  document.getElementById("obIcon").textContent  = step.icon;
  document.getElementById("obTitle").textContent = step.title;
  document.getElementById("obDesc").textContent  = step.desc;

  renderOnboardingExtra();

  var dotsHtml = "";
  var i;
  for (i = 0; i < total; i++) {
    dotsHtml +=
      '<span class="ob-dot' + (i === onboardingCurrentStep ? " active" : "") + '"></span>';
  }
  document.getElementById("obDots").innerHTML = dotsHtml;

  var nextBtn = document.getElementById("obNextBtn");
  nextBtn.textContent = isLast ? "🚀 ابدأ الآن" : "التالي ←";

  var skipBtn = document.getElementById("obSkipBtn");
  skipBtn.style.visibility = isLast ? "hidden" : "visible";
}

/* زر/تنبيه التثبيت داخل خطوة الجولة التعريفية */
function renderOnboardingExtra() {
  var extra = document.getElementById("obExtra");
  if (!extra) { return; }

  var step = ONBOARDING_STEPS[onboardingCurrentStep];
  if (!step || !step.install) {
    extra.innerHTML = "";
    return;
  }

  if (isStandalone()) {
    extra.innerHTML =
      '<div class="ob-install-hint">✅ التطبيق مثبّت على جهازك بالفعل</div>';
  } else if (deferredInstallPrompt) {
    extra.innerHTML =
      '<button type="button" class="ob-install-btn" onclick="installApp()">📲 تثبيت الآن</button>';
  } else {
    extra.innerHTML =
      '<div class="ob-install-hint">' + escHtml(installHintShort()) + "</div>";
  }
}

function nextOnboardingStep() {
  var total = ONBOARDING_STEPS.length;
  if (onboardingCurrentStep < total - 1) {
    onboardingCurrentStep += 1;
    renderOnboardingStep();
  } else {
    finishOnboarding();
  }
}

function skipOnboarding() {
  finishOnboarding();
}

function finishOnboarding() {
  lsSet("onboardingDone", "1");
  var overlay = document.getElementById("onboardingOverlay");
  overlay.classList.remove("show");
  document.body.style.overflow = "";

  /* بعد إغلاق الجولة → فتح منطقة العميل لاختيار الصفوف */
  setTimeout(function () {
    toggleCustomerArea();
  }, 400);
}

function replayOnboarding() {
  closeHelpMenu();
  lsRemove("onboardingDone");
  setTimeout(function () { showOnboarding(0); }, 200);
}

/* ═══════════════════════════════════════════════
   دليل المستخدم (User Guide)
   ═══════════════════════════════════════════════ */

var GUIDE_STEPS = [
  {
    icon: "👤",
    text: "اضغط على زر «منطقتي» واختار الصف الدراسي لابنك أو بنتك عشان تشوف كتبه بس"
  },
  {
    icon: "📦",
    text: "اختار المنتج اللي عايزه من القائمة — لو عايز أكتر من نسخة غير الرقم جنبه"
  },
  {
    icon: "🛒",
    text: "اضغط «اضف للسلة» — هيظهر رقم وإجمالي السلة في الزر الأخضر اللي في أعلى الشاشة"
  },
  {
    icon: "👆",
    text: "اضغط على زر السلة الأخضر في أعلى الشاشة عشان تفتح قائمة مشترياتك"
  },
  {
    icon: "📤",
    text: "اضغط «ارسال الطلبية عبر واتساب» — هيفتح فورم صغير تكتب فيه بياناتك"
  },
  {
    icon: "✍️",
    text: "اكتب اسمك ورقم هاتفك في الخانات — الاسم والهاتف مطلوبين عشان نعرف نتواصل معاك"
  },
  {
    icon: "💬",
    text: "اضغط «إرسال الطلبية» — واتساب هيفتح وهتلاقي رسالة جاهزة بكل تفاصيل طلبك، بس اضغط إرسال وخلاص!"
  },
  {
    icon: "🎯",
    text: "من زر «تدريبات» في أعلى الشاشة تفتح صفحة التدريبات المجانية، وتحل الاختبار وتشوف نتيجتك فورًا"
  },
  {
    icon: "📲",
    text: "لتثبيت التطبيق على شاشتك: من زر المساعدة ❓ اختر «تثبيت التطبيق» واتبع الخطوات"
  }
];

function showGuide() {
  closeHelpMenu();

  var stepsHtml = "";
  var i;
  for (i = 0; i < GUIDE_STEPS.length; i++) {
    stepsHtml +=
      '<div class="guide-step">' +
        '<div class="guide-step-num">' + (i + 1) + "</div>" +
        '<div class="guide-step-icon">' + GUIDE_STEPS[i].icon + "</div>" +
        '<div class="guide-step-text">'  + escHtml(GUIDE_STEPS[i].text) + "</div>" +
      "</div>";
  }

  document.getElementById("guideSteps").innerHTML = stepsHtml;
  document.getElementById("guideModal").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeGuide() {
  document.getElementById("guideModal").classList.remove("show");
  document.body.style.overflow = "";
}

/* ═══════════════════════════════════════════════
   زر المساعدة (Help FAB)
   ═══════════════════════════════════════════════ */

function toggleHelpMenu() {
  var menu = document.getElementById("helpMenu");
  if (menu.classList.contains("show")) {
    closeHelpMenu();
  } else {
    menu.classList.add("show");
  }
}

function closeHelpMenu() {
  var menu = document.getElementById("helpMenu");
  if (menu) { menu.classList.remove("show"); }
}

/* ═══════════════════════════════════════════════
   تشغيل التطبيق وربط الأحداث
   ═══════════════════════════════════════════════ */

/* التقاط حدث التثبيت من المتصفح (يُسجّل مبكرًا حتى لا يفوتنا الحدث) */
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  updateInstallUI();
});

window.addEventListener("appinstalled", function () {
  deferredInstallPrompt = null;
  updateInstallUI();
  showToast("تم تثبيت التطبيق بنجاح 🎉", "success");
});

document.addEventListener("DOMContentLoaded", function () {

  initTheme();
  loadProducts();

  /* تسجيل عامل الخدمة لتشغيل التطبيق دون اتصال */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  document.getElementById("searchInput").addEventListener("input", function () {
    var clearBtn = document.getElementById("searchClear");
    if (this.value.length > 0) {
      clearBtn.classList.add("show");
    } else {
      clearBtn.classList.remove("show");
    }
    doSearch();
  });

  document.getElementById("checkoutModal").addEventListener("click", function (e) {
    if (e.target === this) { closeCheckout(); }
  });

  document.getElementById("installModal").addEventListener("click", function (e) {
    if (e.target === this) { closeInstallModal(); }
  });

  document.getElementById("cfmYes").addEventListener("click", function () {
    if (typeof confirmCallback === "function") { confirmCallback(); }
    closeConfirm();
  });

  document.addEventListener("keydown", function (e) {
    var key = e.key;

    if (key === "Escape") {
      if (document.getElementById("onboardingOverlay").classList.contains("show")) {
        finishOnboarding();
      } else if (document.getElementById("guideModal").classList.contains("show")) {
        closeGuide();
      } else if (document.getElementById("installModal").classList.contains("show")) {
        closeInstallModal();
      } else if (document.getElementById("helpMenu").classList.contains("show")) {
        closeHelpMenu();
      } else if (document.getElementById("checkoutModal").classList.contains("show")) {
        closeCheckout();
      } else if (document.getElementById("confirmOverlay").classList.contains("show")) {
        closeConfirm();
      } else if (document.getElementById("customerPanel").classList.contains("open")) {
        closeCustomerArea();
      } else if (document.getElementById("cartPanel").classList.contains("open")) {
        closeCart();
      } else if (document.getElementById("historyPanel").classList.contains("open")) {
        closeHistory();
      }
    }

    if (key === "Enter") {
      var modal = document.getElementById("checkoutModal");
      if (modal.classList.contains("show") && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        sendToWhatsApp();
      }
    }
  });

  document.getElementById("buyerName").addEventListener("input", function () {
    this.classList.remove("input-err");
    document.getElementById("nameErr").classList.remove("show");
  });

  document.getElementById("buyerPhone").addEventListener("input", function () {
    this.classList.remove("input-err");
    document.getElementById("phoneErr").classList.remove("show");
  });

  document.addEventListener("click", function (e) {
    var menu    = document.getElementById("helpMenu");
    var fabHelp = document.getElementById("fabHelp");
    if (!menu || !fabHelp) { return; }
    if (!menu.contains(e.target) && !fabHelp.contains(e.target)) {
      closeHelpMenu();
    }
  });

});