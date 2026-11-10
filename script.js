/* ============================================================
   WP — студия дизайна. Скрипты: слайдер, параллакс, меню, мелочи.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Слайдер в хиро ---------- */

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var currentNum = document.querySelector(".pager-num.is-current");
  var lastNum = document.querySelector(".pager-num:not(.is-current)");
  var pager = document.querySelector(".pager");

  var SLIDE_TIME = 6000;   // длительность слайда, мс
  var state = { index: 0, start: 0, paused: false };

  function show(index) {
    state.index = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === state.index);
    });

    currentNum.textContent = String(state.index + 1).padStart(2, "0");
    state.start = performance.now();
  }

  function tick(now) {
    if (!state.paused && now - state.start >= SLIDE_TIME) {
      show(state.index + 1);
    }
    requestAnimationFrame(tick);
  }

  function goTo(index) {
    show(index);
  }

  // клики по цифрам: 01 возвращает первый слайд, 03 — последний
  Array.prototype.forEach.call(document.querySelectorAll(".pager-num"), function (num) {
    num.addEventListener("click", function () {
      goTo(parseInt(num.dataset.slide, 10));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(state.index - 1);
    if (e.key === "ArrowRight") show(state.index + 1);
  });

  pager.addEventListener("pointerenter", function () { state.paused = true; });
  pager.addEventListener("pointerleave", function () {
    state.paused = false;
    state.start = performance.now();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      state.paused = true;
    } else if (!pager.matches(":hover")) {
      state.paused = false;
      state.start = performance.now();
    }
  });

  if (reducedMotion) state.paused = true; // без автопрокрутки, только руками

  state.start = performance.now();
  requestAnimationFrame(tick);

  /* ---------- Параллакс знака в круге ---------- */

  var mark = document.querySelector(".disc-mark");
  var hero = document.querySelector(".card.hero");

  if (mark && !reducedMotion && window.matchMedia("(hover: hover)").matches) {
    var targetX = 0, targetY = 0, curX = 0, curY = 0, rafActive = false;

    function ease() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      mark.style.setProperty("--px", curX.toFixed(2) + "px");
      mark.style.setProperty("--py", curY.toFixed(2) + "px");
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        requestAnimationFrame(ease);
      } else {
        rafActive = false;
      }
    }

    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 18;
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 12;
      if (!rafActive) { rafActive = true; requestAnimationFrame(ease); }
    });
  }

  /* ---------- Бургер-меню ---------- */

  var burger = document.querySelector(".burger");
  var head = document.querySelector(".hero-head");

  burger.addEventListener("click", function () {
    var open = head.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });

  Array.prototype.forEach.call(document.querySelectorAll(".nav a"), function (link) {
    link.addEventListener("click", function () {
      head.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && head.classList.contains("open")) {
      head.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Появление секций при скролле ---------- */

  var revealed = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealed.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 70) + "ms";
      io.observe(el);
    });
  } else {
    revealed.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Кнопка «Скопировать» ---------- */

  var toast = document.querySelector(".toast");
  var toastTimer = null;

  Array.prototype.forEach.call(document.querySelectorAll(".copy-btn"), function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;

      function done() {
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); });
      } else {
        fallback(text);
      }

      function fallback(value) {
        var area = document.createElement("textarea");
        area.value = value;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* тишина */ }
        document.body.removeChild(area);
      }
    });
  });

  /* ---------- Год в подвале ---------- */

  document.getElementById("year").textContent = String(new Date().getFullYear());

})();
