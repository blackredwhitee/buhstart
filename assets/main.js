/* Доверительная Бухгалтерия — site interactivity (vanilla JS, no build step).
   Every feature is gated on the presence of its markup, so one file serves
   every page. */
(function () {
  'use strict';

  /* ---------- Mobile burger menu ---------- */
  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    var openMenu = function () { menu.hidden = false; document.body.style.overflow = 'hidden'; syncBar(); };
    var closeMenu = function () { menu.hidden = true; document.body.style.overflow = ''; syncBar(); };
    burger.addEventListener('click', openMenu);
    menu.querySelectorAll('[data-close-menu]').forEach(function (el) {
      el.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Sticky bottom bar (appears after 200px scroll, mobile only) ---------- */
  var bar = document.getElementById('stickyBar');
  function syncBar() {
    if (!bar) return;
    var show = window.scrollY > 200 && (!menu || menu.hidden);
    bar.classList.toggle('is-visible', show);
  }
  if (bar) {
    window.addEventListener('scroll', syncBar, { passive: true });
    syncBar();
  }

  /* ---------- Footer accordion (mobile) ---------- */
  var footerCols = document.querySelectorAll('.footer-col');
  var mq = window.matchMedia('(max-width: 767px)');
  function applyFooter() {
    var mobile = mq.matches;
    footerCols.forEach(function (col) {
      var body = col.querySelector('.footer-col__body');
      var mark = col.querySelector('.footer-col__mark');
      if (!body) return;
      if (mobile) {
        var open = col.hasAttribute('data-open');
        body.classList.toggle('is-collapsed', !open);
        if (mark) mark.textContent = open ? '−' : '+';
      } else {
        body.classList.remove('is-collapsed');
      }
    });
  }
  footerCols.forEach(function (col) {
    var head = col.querySelector('.footer-col__head');
    if (!head) return;
    head.addEventListener('click', function () {
      if (!mq.matches) return;
      if (col.hasAttribute('data-open')) col.removeAttribute('data-open');
      else col.setAttribute('data-open', '');
      applyFooter();
    });
  });
  if (footerCols.length) {
    applyFooter();
    mq.addEventListener('change', applyFooter);
  }

  /* ---------- Demo forms (name/phone/... -> success) ---------- */
  document.querySelectorAll('[data-form]').forEach(function (wrap) {
    var submit = wrap.querySelector('[data-submit]');
    var card = wrap.querySelector('[data-form-card]');
    var success = wrap.querySelector('[data-form-success]');
    if (!submit || !card || !success) return;
    submit.addEventListener('click', function () {
      var ok = true;
      wrap.querySelectorAll('[data-required]').forEach(function (inp) {
        if (!inp.value.trim()) { ok = false; inp.style.borderColor = '#C0392B'; }
      });
      if (!ok) return;
      card.style.display = 'none';
      success.style.display = '';
    });
  });

  /* ---------- FAQ accordions ---------- */
  document.querySelectorAll('[data-faq]').forEach(function (item) {
    var q = item.querySelector('[data-faq-q]');
    var a = item.querySelector('[data-faq-a]');
    var mark = item.querySelector('[data-faq-mark]');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = a.style.display !== 'none';
      a.style.display = open ? 'none' : '';
      if (mark) mark.textContent = open ? '+' : '−';
    });
  });

  /* ---------- Blog tag filter ---------- */
  var tagBar = document.querySelector('[data-tagbar]');
  if (tagBar) {
    var cards = document.querySelectorAll('[data-post-tag]');
    tagBar.querySelectorAll('[data-tag]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.getAttribute('data-tag');
        tagBar.querySelectorAll('[data-tag]').forEach(function (b) {
          var on = b === btn;
          b.style.background = on ? '#F07828' : '#fff';
          b.style.borderColor = on ? '#F07828' : '#E8E8E8';
          b.style.color = on ? '#fff' : '#3D3D3D';
        });
        cards.forEach(function (c) {
          c.style.display = (tag === 'Все' || c.getAttribute('data-post-tag') === tag) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Service detail (usluga.html?s=slug) ---------- */
  var uslugaRoot = document.getElementById('usluga-root');
  if (uslugaRoot) renderUsluga(uslugaRoot);

  /* ---------- Calculator quiz ---------- */
  var calc = document.getElementById('calc');
  if (calc) renderCalculator(calc);

  /* =========================================================
     Service detail rendering
     ========================================================= */
  function renderUsluga(root) {
    var data = JSON.parse(document.getElementById('usluga-data').textContent);
    var order = ['bukhgalterskie-uslugi', 'strahovka', 'audit', 'upravlencheskii-uchet', 'marketplace'];
    var params = new URLSearchParams(location.search);
    var slug = data[params.get('s')] ? params.get('s') : 'bukhgalterskie-uslugi';
    var svc = data[slug];
    document.title = svc.name + ' — Доверительная Бухгалтерия';

    var includes = svc.includes.map(function (i) {
      return '<div style="display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid #E8E8E8;border-radius:8px;padding:14px 18px">' +
        '<span style="color:#2D7A4F;font-weight:800;flex-shrink:0">✓</span>' +
        '<span style="font-size:14px;line-height:1.5;color:#3D3D3D">' + esc(i) + '</span></div>';
    }).join('');

    var audience = svc.audience.map(function (p) {
      return '<div style="border:1px solid #E8E8E8;border-radius:10px;padding:22px;border-top:3px solid #F07828">' +
        '<div style="font-size:16px;font-weight:600;margin-bottom:8px">' + esc(p.who) + '</div>' +
        '<div style="font-size:13px;line-height:1.6;color:#6B6B6B">' + esc(p.why) + '</div></div>';
    }).join('');

    var plans = svc.plans.map(function (pl) {
      return '<div style="background:#fff;border-radius:10px;padding:26px">' +
        '<div style="font-size:14px;font-weight:600;color:#F07828;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px">' + esc(pl.name) + '</div>' +
        '<div style="font-size:28px;font-weight:800;margin-bottom:12px">' + esc(pl.price) + '</div>' +
        '<div style="font-size:13px;line-height:1.6;color:#6B6B6B">' + esc(pl.desc) + '</div></div>';
    }).join('');

    var faq = svc.faq.map(function (f, i) {
      var open = i === 0;
      return '<div data-faq style="border-bottom:1px solid #E8E8E8">' +
        '<button data-faq-q style="width:100%;background:none;border:none;padding:18px 0;display:flex;justify-content:space-between;align-items:center;gap:16px;cursor:pointer;font-family:inherit;text-align:left">' +
        '<span style="font-size:16px;font-weight:600;color:#1A1A1A">' + esc(f.q) + '</span>' +
        '<span data-faq-mark style="color:#F07828;font-size:20px;font-weight:600;flex-shrink:0">' + (open ? '−' : '+') + '</span></button>' +
        '<div data-faq-a style="padding:0 0 18px;font-size:14px;line-height:1.7;color:#6B6B6B;' + (open ? '' : 'display:none') + '">' + esc(f.a) + '</div></div>';
    }).join('');

    root.innerHTML =
      '<section class="m-hero" style="max-width:1100px;margin:0 auto;padding:60px 24px 64px;display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center">' +
        '<div>' +
          '<div style="font-size:13px;color:#6B6B6B;margin-bottom:16px"><a href="index.html" class="hv-orange" style="color:#6B6B6B;text-decoration:none">Главная</a> / <a href="uslugi.html" class="hv-orange" style="color:#6B6B6B;text-decoration:none">Услуги</a> / ' + esc(svc.name) + '</div>' +
          '<h1 style="margin:0 0 16px;font-size:44px;font-weight:800;letter-spacing:-0.02em;line-height:1.15">' + esc(svc.name) + '</h1>' +
          '<p style="margin:0 0 30px;font-size:18px;color:#6B6B6B;line-height:1.6">' + esc(svc.lead) + '</p>' +
          '<div class="m-btns" style="display:flex;gap:14px;flex-wrap:wrap">' +
            '<a href="calculator.html" class="btn btn--primary hv-primary" style="font-size:16px;height:52px;padding:0 26px">Рассчитать стоимость</a>' +
            '<a href="#forma" class="btn hv-btn-dark" style="border:1.5px solid #3D3D3D;color:#3D3D3D;font-size:16px;height:52px;padding:0 26px">Записаться на консультацию</a>' +
          '</div>' +
        '</div>' +
        '<div class="m-heroimg" style="height:320px">' + imgSlot('Фото команды за работой', 'width:100%;height:320px') + '</div>' +
      '</section>' +

      '<section style="background:#F5F5F5;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8">' +
        '<div style="max-width:1100px;margin:0 auto;padding:72px 24px">' +
          '<h2 style="margin:0 0 32px;font-size:32px;font-weight:800;letter-spacing:-0.02em">Что входит в услугу</h2>' +
          '<div class="m-1col" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 32px">' + includes + '</div>' +
        '</div>' +
      '</section>' +

      '<section style="max-width:1100px;margin:0 auto;padding:72px 24px">' +
        '<h2 style="margin:0 0 32px;font-size:32px;font-weight:800;letter-spacing:-0.02em">Для кого подходит</h2>' +
        '<div class="m-1col t-2col" style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">' + audience + '</div>' +
      '</section>' +

      '<section style="background:#3D3D3D">' +
        '<div style="max-width:1100px;margin:0 auto;padding:64px 24px">' +
          '<h2 style="margin:0 0 8px;font-size:32px;font-weight:800;letter-spacing:-0.02em;color:#fff">Стоимость</h2>' +
          '<p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6)">' + esc(svc.priceNote) + '</p>' +
          '<div class="m-1col t-2col" style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">' + plans + '</div>' +
        '</div>' +
      '</section>' +

      '<section style="max-width:760px;margin:0 auto;padding:72px 24px">' +
        '<h2 style="margin:0 0 28px;font-size:32px;font-weight:800;letter-spacing:-0.02em">Частые вопросы</h2>' + faq +
      '</section>' +

      '<section id="forma" style="background:#F5F5F5;border-top:1px solid #E8E8E8">' +
        '<div style="max-width:640px;margin:0 auto;padding:72px 24px;text-align:center">' +
          '<h2 style="margin:0 0 10px;font-size:32px;font-weight:800;letter-spacing:-0.02em">Обсудить задачу</h2>' +
          '<p style="margin:0 0 28px;font-size:15px;color:#6B6B6B">Оставьте контакты — перезвоним в течение 2 часов в рабочее время.</p>' +
          '<div data-form>' +
            '<div data-form-success style="display:none;background:#fff;border-radius:12px;padding:40px;border:1px solid #E8E8E8">' +
              '<div style="width:56px;height:56px;border-radius:50%;background:#2D7A4F;color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px">✓</div>' +
              '<div style="font-size:18px;font-weight:700">Заявка отправлена — мы свяжемся с вами.</div>' +
            '</div>' +
            '<div data-form-card style="background:#fff;border-radius:12px;padding:28px;border:1px solid #E8E8E8;display:flex;flex-direction:column;gap:14px;text-align:left">' +
              '<input data-required placeholder="Имя" class="fc-input" style="height:48px;border:1px solid #D6D2CB;border-radius:6px;padding:0 14px;font-size:15px;font-family:inherit"/>' +
              '<input data-required placeholder="Телефон" class="fc-input" style="height:48px;border:1px solid #D6D2CB;border-radius:6px;padding:0 14px;font-size:15px;font-family:inherit"/>' +
              '<textarea placeholder="Вопрос (необязательно)" class="fc-input" style="min-height:80px;border:1px solid #D6D2CB;border-radius:6px;padding:12px 14px;font-size:15px;font-family:inherit;resize:vertical"></textarea>' +
              '<button data-submit class="hv-submit" style="height:52px;background:#F07828;color:#fff;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 120ms ease">Отправить</button>' +
              '<div style="font-size:11px;color:#9E9A94;text-align:center">Нажимая кнопку, вы соглашаетесь на <a href="soglasie.html" style="color:#9E9A94">обработку персональных данных</a></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';

    wireDynamic(root);
  }

  /* =========================================================
     Calculator quiz
     ========================================================= */
  function renderCalculator(root) {
    var STEPS = [
      { key: 'entity', q: 'Какая у вас форма собственности?', opts: ['ИП', 'ООО'] },
      { key: 'zero', q: 'Нужна ли только нулевая отчётность?', opts: ['Да, деятельности нет', 'Нет, бизнес работает'] },
      { key: 'tax', q: 'Какая система налогообложения?', opts: ['УСН 6%', 'УСН 15%', 'ОСНО', 'АУСН', 'Патент', 'Ещё не выбрал(а)'] },
      { key: 'niche', q: 'Чем занимается бизнес?', opts: ['Услуги', 'Розничная торговля', 'Оптовая торговля', 'Маркетплейсы', 'Производство', 'Строительство', 'Общепит', 'Другое'] },
      { key: 'ops', q: 'Сколько операций в месяц?', opts: ['До 30', '30–100', '100–300', 'Больше 300'] },
      { key: 'staff', q: 'Сколько сотрудников?', opts: ['Нет', '1–5', '6–15', '16 и больше'] },
      { key: 'hr', q: 'Нужен ли кадровый учёт?', opts: ['Да', 'Нет', 'Не знаю'] },
      { key: 'mgmt', q: 'Нужен ли управленческий учёт?', opts: ['Да', 'Нет', 'Не знаю'] },
      { key: 'ved', q: 'Есть ли внешнеэкономическая деятельность?', opts: ['Да', 'Нет'] }
    ];
    var N = STEPS.length;
    var state = { step: 0, answers: {} };

    function buildRecs() {
      var a = state.answers, recs = [];
      if (a.zero === 'Да, деятельности нет') {
        recs.push('Нулевая отчётность (' + (a.entity || 'ИП') + ')');
        recs.push('Налоговое консультирование');
        return recs;
      }
      recs.push('Бухгалтерское обслуживание' + (a.tax && a.tax !== 'Ещё не выбрал(а)' ? ' (' + a.tax + ')' : ''));
      if (a.tax === 'Ещё не выбрал(а)') recs.push('Налоговое консультирование — подбор системы');
      if (a.staff && a.staff !== 'Нет' || a.hr === 'Да') recs.push('Кадровый учёт');
      if (a.mgmt === 'Да') recs.push('Управленческий учёт');
      if (a.ved === 'Да') recs.push('ВЭД / Валютные расчёты');
      if (a.entity === 'ООО') recs.push('Обслуживание ООО');
      return recs;
    }

    function render() {
      var done = state.step >= N;
      if (!done) {
        var cur = STEPS[state.step];
        var pct = Math.round((state.step / N) * 100) + '%';
        var opts = cur.opts.map(function (label) {
          var sel = state.answers[cur.key] === label;
          return '<button class="hv-opt js-opt" data-label="' + esc(label) + '" style="min-height:52px;width:100%;box-sizing:border-box;padding:16px 20px;border:1.5px solid ' + (sel ? '#F07828' : '#E8E8E8') + ';background:' + (sel ? '#FEF0E6' : '#fff') + ';border-radius:10px;font-size:16px;font-weight:600;font-family:inherit;cursor:pointer;text-align:left;color:#1A1A1A;transition:all 120ms ease">' + esc(label) + '</button>';
        }).join('');
        root.innerHTML =
          '<div class="m-sticky"><div style="height:6px;background:#F5F5F5;border-radius:3px;overflow:hidden">' +
            '<div style="height:100%;background:#F07828;border-radius:3px;transition:width 250ms ease;width:' + pct + '"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;color:#6B6B6B;padding-top:8px">' +
              '<span>Шаг ' + (state.step + 1) + ' из 9</span><span>' + pct + '</span></div></div>' +
          '<div style="height:24px"></div>' +
          '<h2 style="margin:0 0 28px;font-size:26px;font-weight:700;letter-spacing:-0.01em">' + esc(cur.q) + '</h2>' +
          '<div class="m-1col" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' + opts + '</div>' +
          (state.step > 0 ? '<button class="js-back hv-orange" style="margin-top:28px;background:none;border:none;color:#6B6B6B;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;padding:8px 0">← Назад</button>' : '');
        root.querySelectorAll('.js-opt').forEach(function (b) {
          b.addEventListener('click', function () {
            state.answers[cur.key] = b.getAttribute('data-label');
            state.step += 1;
            render();
          });
        });
        var back = root.querySelector('.js-back');
        if (back) back.addEventListener('click', function () { state.step -= 1; render(); });
      } else {
        var recs = buildRecs().map(function (r) {
          return '<div style="display:flex;gap:12px;align-items:center;background:#fff;border:1px solid #E8E8E8;border-radius:8px;padding:16px 18px">' +
            '<span style="color:#2D7A4F;font-weight:800">✓</span>' +
            '<span style="font-size:16px;font-weight:600">' + esc(r) + '</span></div>';
        }).join('');
        root.innerHTML =
          '<div style="background:#F5F5F5;border:1px solid #E8E8E8;border-radius:12px;padding:36px">' +
            '<div style="font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#F07828;margin-bottom:12px">Результат подбора</div>' +
            '<h2 style="margin:0 0 22px;font-size:28px;font-weight:800;letter-spacing:-0.01em">Для вашей ситуации подойдут:</h2>' +
            '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">' + recs + '</div>' +
            '<p style="margin:0 0 28px;font-size:13px;color:#6B6B6B">Точный расчёт стоимости — на консультации с бухгалтером.</p>' +
            '<div data-form>' +
              '<div data-form-success style="display:none;background:#fff;border-radius:10px;padding:32px;text-align:center;border:1px solid #E8E8E8">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:#2D7A4F;color:#fff;font-size:24px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">✓</div>' +
                '<div style="font-size:17px;font-weight:700">Спасибо! Бухгалтер свяжется с вами с точным расчётом.</div>' +
              '</div>' +
              '<div data-form-card style="display:flex;flex-direction:column;gap:12px">' +
                '<input data-required placeholder="Имя" class="fc-input" style="height:48px;border:1px solid #D6D2CB;border-radius:6px;padding:0 14px;font-size:15px;font-family:inherit"/>' +
                '<input data-required placeholder="Телефон" class="fc-input" style="height:48px;border:1px solid #D6D2CB;border-radius:6px;padding:0 14px;font-size:15px;font-family:inherit"/>' +
                '<button data-submit class="hv-submit" style="height:52px;background:#F07828;color:#fff;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 120ms ease">Получить точный расчёт</button>' +
                '<div style="font-size:11px;color:#9E9A94;text-align:center">Нажимая кнопку, вы соглашаетесь на <a href="soglasie.html" style="color:#9E9A94">обработку персональных данных</a></div>' +
              '</div>' +
            '</div>' +
            '<button class="js-restart hv-orange" style="margin-top:20px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Пройти заново</button>' +
          '</div>';
        wireDynamic(root);
        var restart = root.querySelector('.js-restart');
        if (restart) restart.addEventListener('click', function () {
          state = { step: 0, answers: {} };
          render();
        });
      }
    }
    render();
  }

  /* Re-wire forms inside a dynamically-rendered subtree. */
  function wireDynamic(scope) {
    scope.querySelectorAll('[data-form]').forEach(function (wrap) {
      var submit = wrap.querySelector('[data-submit]');
      var card = wrap.querySelector('[data-form-card]');
      var success = wrap.querySelector('[data-form-success]');
      if (!submit || !card || !success) return;
      submit.addEventListener('click', function () {
        var ok = true;
        wrap.querySelectorAll('[data-required]').forEach(function (inp) {
          if (!inp.value.trim()) { ok = false; inp.style.borderColor = '#C0392B'; }
        });
        if (!ok) return;
        card.style.display = 'none';
        success.style.display = '';
      });
    });
    scope.querySelectorAll('[data-faq]').forEach(function (item) {
      var q = item.querySelector('[data-faq-q]');
      var a = item.querySelector('[data-faq-a]');
      var mark = item.querySelector('[data-faq-mark]');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var open = a.style.display !== 'none';
        a.style.display = open ? 'none' : '';
        if (mark) mark.textContent = open ? '+' : '−';
      });
    });
  }

  function imgSlot(caption, extra) {
    return '<div class="img-slot img-slot--rounded" style="' + extra + '">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
      '<span>' + esc(caption) + '</span></div>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
})();
