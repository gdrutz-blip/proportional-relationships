/*
 * Shared code for every game at Zuri's Smoothie Truck.
 * - Random helpers and a rotating name list (never "Theo").
 * - Answer parsing: accepts 1.2, 1.20, $1.20, 1,20 and 7¢.
 * - Progress saved in localStorage on this device only.
 * - A round engine: instant feedback, a hint after one wrong try,
 *   the worked solution after a second wrong try.
 */
(function () {
  'use strict';

  // ---------- Names ----------
  var NAMES = [
    'Amara', 'Priya', 'Mateo', 'Aiyana', 'Kenji', 'Fatima', 'Noah', 'Leila',
    'Diego', 'Mei', 'Omar', 'Sofia', 'Arjun', 'Chloé', 'Kwame', 'Ana',
    'Hiro', 'Nadia', 'Malik', 'Elena', 'Tariq', 'Grace', 'Samir', 'Yusuf',
    'Maya', 'Ravi', 'Isabelle', 'Dev', 'Zainab', 'Lucas', 'Talia', 'Jonah',
    'Ayesha', 'Marcus', 'Lina', 'Owen', 'Esi', 'Gabriel', 'Hana', 'Mohammed'
  ].filter(function (n) { return !/^theo/i.test(n); }); // the brief says never use "Theo"

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /** Returns a function that hands out names with no repeats until the list runs out. */
  function namePicker() {
    var queue = [];
    return function () {
      if (!queue.length) queue = shuffle(NAMES);
      return queue.pop();
    };
  }

  // ---------- Numbers and answers ----------
  /**
   * Turns what a student typed into a number, or null if it isn't one.
   * Accepts: 1.2  1.20  $1.20  1.20$  .5  1,20 (decimal comma)  1,200  7¢  7 cents
   */
  function parseAnswer(raw) {
    if (raw == null) return null;
    var s = String(raw).trim().toLowerCase().replace(/\s+/g, '');
    if (!s) return null;
    var cents = false;
    if (/(¢|cents?)$/.test(s)) {
      cents = true;
      s = s.replace(/(¢|cents?)$/, '');
    }
    s = s.replace(/^\$/, '').replace(/\$$/, '');
    s = s.replace(/^(-?\d+),(\d{1,2})$/, '$1.$2');   // 1,20 → 1.20
    s = s.replace(/,(?=\d{3}(?:\D|$))/g, '');        // 1,200 → 1200
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    var n = parseFloat(s);
    if (cents) n = n / 100;
    return n;
  }

  /** Exact match (with a tiny floating-point tolerance), so 1.2 and 1.20 are the same. */
  function same(a, b) {
    return a != null && b != null && Math.abs(a - b) < 1e-6;
  }

  /** Close match, used only to spot common mistakes for feedback. */
  function near(a, b, rel) {
    if (a == null || b == null) return false;
    return Math.abs(a - b) <= Math.max(0.005, Math.abs(b) * (rel || 0.02));
  }

  /** Money for display. Round to the cent only when showing a final answer. */
  function money(n) {
    var neg = n < 0;
    var s = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−$' : '$') + s;
  }

  /** A plain number for display with no trailing zeros: 0.75, 1.5, 6. */
  function num(n) {
    return String(parseFloat(n.toFixed(6)));
  }

  // ---------- Progress (this device only) ----------
  var KEY = 'zuri-truck-u3-progress';
  function loadProgress() {
    try {
      var data = JSON.parse(window.localStorage.getItem(KEY));
      return data && typeof data === 'object' ? data : {};
    } catch (e) {
      return {};
    }
  }
  function saveResult(gameId, stars) {
    var data = loadProgress();
    var prev = data[gameId] || {};
    data[gameId] = {
      done: true,
      best: Math.max(prev.best || 0, stars),
      plays: (prev.plays || 0) + 1
    };
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage blocked: still playable */ }
    return data[gameId];
  }
  function resetProgress() {
    try { window.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  // ---------- Small DOM helpers ----------
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function starsText(n, max) {
    var s = '';
    for (var i = 0; i < max; i++) s += i < n ? '★' : '☆';
    return s;
  }

  // ---------- Pictures used in hints ----------
  /**
   * A double number line drawn as SVG.
   * o.points:   [{ p: 0..1, top: '$0', bottom: '0' }]  (a label of '?' is highlighted)
   * o.ops:      [{ p: 0..1, text: '÷ 6' }]              (written between the two lines)
   * o.segments: [{ from: 0..1, to: 0..1, text: '25%', cls: 't25' }] (blocks between the lines)
   * o.label:    text for screen readers; o.caption: text under the picture
   */
  function numberLine(o) {
    var L = 36, R = 290;
    function X(p) { return +(L + p * (R - L)).toFixed(1); }
    function text(x, y, s, cls) {
      return '<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="middle">' + s + '</text>';
    }
    function cls(s) { return s === '?' ? 'dnl-ask' : 'dnl-text'; }
    var s = '<line class="dnl-line" x1="18" y1="40" x2="322" y2="40"/>' +
      '<line class="dnl-line" x1="18" y1="88" x2="322" y2="88"/>';
    (o.segments || []).forEach(function (g, i) {
      var x1 = X(g.from), x2 = X(g.to);
      s += '<rect class="dnl-seg ' + (g.cls || (i % 2 ? 'alt' : '')) + '" x="' + x1 + '" y="47" width="' + (x2 - x1) + '" height="34" rx="3"/>';
      if (g.text && x2 - x1 >= 30) s += text((x1 + x2) / 2, 69, g.text, 'dnl-segtext');
    });
    (o.points || []).forEach(function (pt) {
      var x = X(pt.p);
      s += '<line class="dnl-tick" x1="' + x + '" y1="33" x2="' + x + '" y2="47"/>' +
        '<line class="dnl-tick" x1="' + x + '" y1="81" x2="' + x + '" y2="95"/>';
      if (pt.top != null) s += text(x, 24, pt.top, cls(pt.top));
      if (pt.bottom != null) s += text(x, 114, pt.bottom, cls(pt.bottom));
    });
    (o.ops || []).forEach(function (op) { s += text(X(op.p), 69, op.text, 'dnl-op'); });
    return '<figure class="dnl"><svg viewBox="0 0 340 124" role="img" aria-label="' + (o.label || 'Double number line') + '">' +
      s + '</svg>' + (o.caption ? '<figcaption>' + o.caption + '</figcaption>' : '') + '</figure>';
  }

  /** A stacked fraction, e.g. frac('2 cups', '5 smoothies'). */
  function frac(top, bottom) {
    return '<span class="frac"><span class="frac-top">' + top + '</span><span class="frac-bottom">' + bottom + '</span></span>';
  }

  /** Reads every input in a list. Returns { values } or { incomplete: message }. */
  function readInputs(inputs, example) {
    var values = [];
    for (var i = 0; i < inputs.length; i++) {
      var raw = inputs[i].value;
      if (!raw.trim()) return { incomplete: 'Fill in every box before you check.' };
      var v = parseAnswer(raw);
      if (v === null) return { incomplete: 'Type each answer as a number, like ' + (example || '12') + '.' };
      values.push(v);
    }
    return { values: values };
  }

  /** Shows ✓ or ✗ on an input and its mark span (if it has one). */
  function markInput(input, ok) {
    input.classList.toggle('right', ok);
    input.classList.toggle('wrong', !ok);
    var mark = input.id && document.getElementById('mark-' + input.id);
    if (mark) {
      mark.textContent = ok ? '✓ Right' : '✗ Check this one';
      mark.className = 'mark ' + (ok ? 'right' : 'wrong');
    }
  }

  /** Makes a group of buttons act like radio buttons. Calls onPick(index). */
  function pickGroup(buttons, onPick) {
    Array.prototype.forEach.call(buttons, function (btn, i) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(buttons, function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        onPick(i);
      });
    });
  }

  function disableAll(root) {
    Array.prototype.forEach.call(root.querySelectorAll('input, button'), function (e) { e.disabled = true; });
  }

  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }

  /** Rounds away floating-point noise (0.1 + 0.2 → 0.3) without rounding real digits. */
  function clean(n) { return parseFloat(n.toFixed(9)); }

  // ---------- Round engine ----------
  var PRAISE = ['Nice work!', 'Yes!', 'Correct!', 'You got it!', 'Great thinking!', 'Spot on!'];

  /**
   * cfg = {
   *   id: 'best-buy', questions: 6,
   *   makeQuestion(index, nextName) → question object:
   *     render(container)       draw the question
   *     check() → { incomplete: 'message' } (no try used)
   *             | { ok: true, message } | { ok: false, message }
   *     hint() → HTML string     shown after the first wrong try
   *     solution() → HTML string shown after the second wrong try
   *     lock()                   disable inputs when the question is over
   * }
   */
  function runRound(cfg) {
    var total = cfg.questions || 6;
    var $ = function (id) { return document.getElementById(id); };
    var els = {
      play: $('play'), summary: $('summary'), form: $('qform'),
      question: $('question'), feedback: $('feedback'),
      check: $('check'), next: $('next'),
      progress: $('progress'), progressLabel: $('progress-label'), score: $('score')
    };
    var index, points, tries, q, finished, firstTry, nextName;

    function setFeedback(kind, html) {
      els.feedback.className = 'feedback ' + kind;
      els.feedback.innerHTML = html;
    }

    function updateScore() {
      els.score.textContent = 'Points: ' + points;
    }

    function start() {
      index = 0; points = 0; firstTry = 0;
      nextName = namePicker();
      els.summary.hidden = true;
      els.play.hidden = false;
      els.progress.max = total;
      updateScore();
      showQuestion();
    }

    function showQuestion() {
      tries = 0; finished = false;
      q = cfg.makeQuestion(index, nextName);
      U3.current = q; // lets automated tests read the question; the game does not use it
      els.question.innerHTML = '';
      q.render(els.question);
      setFeedback('', '');
      els.check.hidden = false;
      els.next.hidden = true;
      els.progress.value = index;
      els.progressLabel.textContent = 'Question ' + (index + 1) + ' of ' + total;
      var first = els.question.querySelector('input, button');
      if (first && index > 0) first.focus({ preventScroll: true });
    }

    function onCheck(evt) {
      evt.preventDefault();
      if (finished) { goNext(); return; }
      var r = q.check();
      if (r.incomplete) {
        setFeedback('info', r.incomplete);
        return;
      }
      tries++;
      if (r.ok) {
        points += tries === 1 ? 2 : 1;
        if (tries === 1) firstTry++;
        setFeedback('good', '<p><strong>' + pick(PRAISE) + '</strong> ' + (r.message || '') + '</p>');
        endQuestion();
      } else if (tries === 1) {
        setFeedback('try',
          '<p><strong>Not quite.</strong> ' + (r.message || '') + '</p>' +
          '<div class="hint"><h2>Hint</h2>' + q.hint() + '</div>' +
          '<p class="small">Fix your answer and press Check again.</p>');
      } else {
        setFeedback('show',
          '<p><strong>Let’s look at it together.</strong></p>' +
          '<div class="solution"><h2>Worked solution</h2>' + q.solution() + '</div>');
        endQuestion();
      }
    }

    function endQuestion() {
      finished = true;
      q.lock();
      updateScore();
      els.check.hidden = true;
      els.next.hidden = false;
      els.next.textContent = index + 1 >= total ? 'See my stars →' : 'Next →';
      els.next.focus({ preventScroll: true });
    }

    function goNext() {
      index++;
      if (index >= total) showSummary();
      else showQuestion();
    }

    function showSummary() {
      var max = total * 2;
      var stars = points >= Math.ceil(max * 0.8) ? 3 : points >= Math.ceil(max * 0.5) ? 2 : 1;
      var record = saveResult(cfg.id, stars);
      els.progress.value = total;
      els.play.hidden = true;
      els.summary.hidden = false;
      els.summary.innerHTML =
        '<h2>Round complete!</h2>' +
        '<p class="big-stars" role="img" aria-label="' + stars + ' out of 3 stars">' + starsText(stars, 3) + '</p>' +
        '<p>You scored <strong>' + points + ' of ' + max + '</strong> points. ' +
        firstTry + ' of ' + total + ' right on the first try.</p>' +
        (record.best > stars ? '<p class="small">Your best is ' + record.best + ' stars.</p>' : '') +
        '<p class="small">2 points for a first-try answer, 1 point for a second-try answer.</p>' +
        '<div class="actions">' +
        '<button type="button" class="btn primary" id="again">Play again</button>' +
        '<a class="btn" href="../">Back to the truck</a></div>';
      document.getElementById('again').addEventListener('click', start);
      els.summary.querySelector('h2').setAttribute('tabindex', '-1');
      els.summary.querySelector('h2').focus();
    }

    els.form.addEventListener('submit', onCheck);
    els.next.addEventListener('click', goNext);
    start();
  }

  window.U3 = {
    randInt: randInt, pick: pick, shuffle: shuffle, namePicker: namePicker,
    parseAnswer: parseAnswer, same: same, near: near, money: money, num: num,
    loadProgress: loadProgress, saveResult: saveResult, resetProgress: resetProgress,
    el: el, starsText: starsText, runRound: runRound, NAMES: NAMES,
    numberLine: numberLine, frac: frac, readInputs: readInputs, markInput: markInput,
    pickGroup: pickGroup, disableAll: disableAll, gcd: gcd, clean: clean
  };
})();
