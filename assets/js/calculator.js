/*
 * Optional calculator for the game pages.
 * A "Calculator" button in the top bar opens a small panel. It is closed by default,
 * because the Unit 3 test is no-calculator and the numbers are friendly without one.
 *
 * TO TURN THE CALCULATOR OFF FOR THE WHOLE SITE (for example before the test):
 * change ENABLED to false below, commit, and push. Netlify updates within a minute.
 *
 * The math is done by a small parser here, never by running typed text as code.
 * Results are not rounded: rounding at the end is the student's job.
 */
(function () {
  'use strict';
  var ENABLED = true;

  var bar = document.querySelector('.topbar');
  if (!ENABLED || !bar || document.body.classList.contains('teacher-page')) return;

  // ---------- Parser: + − × ÷ ( ) and decimals ----------
  function tokenize(text) {
    var s = text.replace(/\s+/g, '').replace(/×|x|X/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/,/g, '');
    if (/%/.test(s)) throw new Error('Use decimals for percents: 13% = 0.13.');
    if (/\$/.test(s)) s = s.replace(/\$/g, '');
    var tokens = [], m, re = /(\d+\.?\d*|\.\d+)|([+\-*/()])/y;
    re.lastIndex = 0;
    while (re.lastIndex < s.length) {
      var at = re.lastIndex;
      m = re.exec(s);
      if (!m || m.index !== at) throw new Error('Only numbers and + − × ÷ ( ) work here.');
      tokens.push(m[1] != null ? { n: parseFloat(m[1]) } : { op: m[2] });
    }
    return tokens;
  }

  function evaluate(text) {
    var t = tokenize(text), i = 0;
    if (!t.length) throw new Error('Type a calculation first.');
    function peek() { return t[i] && t[i].op; }
    function expr() {
      var v = term();
      while (peek() === '+' || peek() === '-') { var op = t[i++].op, r = term(); v = op === '+' ? v + r : v - r; }
      return v;
    }
    function term() {
      var v = factor();
      while (peek() === '*' || peek() === '/') {
        var op = t[i++].op, r = factor();
        if (op === '/' && r === 0) throw new Error('You can’t divide by 0.');
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function factor() {
      var tok = t[i];
      if (!tok) throw new Error('That calculation isn’t finished.');
      if (tok.op === '-') { i++; return -factor(); }
      if (tok.op === '+') { i++; return factor(); }
      if (tok.op === '(') {
        i++;
        var v = expr();
        if (peek() !== ')') throw new Error('A bracket is missing: ).');
        i++;
        return v;
      }
      if (tok.n != null) { i++; return tok.n; }
      throw new Error('That calculation isn’t finished.');
    }
    var v = expr();
    if (i < t.length) throw new Error(peek() === ')' ? 'There’s an extra ).' : 'Check the calculation: two numbers need a sign between them.');
    return v;
  }

  /** Full digits, minus floating-point noise: 0.1 + 0.2 shows 0.3, 19.99 × 1.13 shows 22.5887. */
  function show(v) {
    if (!isFinite(v)) return 'Too big';
    var n = parseFloat(v.toPrecision(12));
    return Math.abs(n) >= 1e15 ? n.toExponential(6) : String(n);
  }

  // ---------- The panel ----------
  var KEYS = [
    ['C', 'clear'], ['(', '('], [')', ')'], ['⌫', 'back'],
    ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '÷'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['−', '−'],
    ['0', '0'], ['.', '.'], ['=', 'equals'], ['+', '+']
  ];

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'calc-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'calc-panel');
  toggle.innerHTML = '<span aria-hidden="true">🧮</span><span class="calc-toggle-text"> Calculator</span>';
  toggle.setAttribute('aria-label', 'Calculator');
  bar.insertBefore(toggle, bar.querySelector('.score'));

  var panel = document.createElement('section');
  panel.id = 'calc-panel';
  panel.className = 'calc-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', 'Calculator');
  panel.innerHTML =
    '<div class="calc-head"><span class="calc-title">Calculator</span>' +
    '<button type="button" class="calc-close" aria-label="Close the calculator">✕</button></div>' +
    '<p class="calc-last" aria-live="polite"></p>' +
    '<input class="calc-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Calculation">' +
    '<p class="calc-msg" aria-live="polite"></p>' +
    '<div class="calc-keys">' + KEYS.map(function (k) {
      var cls = 'calc-key' + (/^[÷×−+]$/.test(k[1]) ? ' op' : '') + (k[1] === 'equals' ? ' calc-eq' : '') + (k[1] === 'clear' || k[1] === 'back' ? ' fn' : '');
      var label = { clear: 'Clear', back: 'Delete', equals: 'Equals' }[k[1]];
      return '<button type="button" class="' + cls + '" data-k="' + k[1] + '"' + (label ? ' aria-label="' + label + '"' : '') + '>' + k[0] + '</button>';
    }).join('') + '</div>' +
    '<p class="calc-note">Rounding is up to you: round money at the end.</p>';
  document.body.appendChild(panel);

  var input = panel.querySelector('.calc-input');
  var last = panel.querySelector('.calc-last');
  var msg = panel.querySelector('.calc-msg');
  var justAnswered = false;

  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('on');
    // Leave room so the question can scroll up above the panel (it covers the bottom of the screen).
    document.body.style.paddingBottom = (panel.offsetHeight + 16) + 'px';
    input.focus({ preventScroll: true });
  }
  function close() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('on');
    document.body.style.paddingBottom = '';
    toggle.focus({ preventScroll: true });
  }
  function equals() {
    try {
      var expr = input.value;
      var v = show(evaluate(expr));
      last.textContent = expr.trim() + ' =';
      input.value = v;
      msg.textContent = '';
      justAnswered = true;
    } catch (e) {
      msg.textContent = e.message;
    }
  }
  function press(k) {
    msg.textContent = '';
    if (k === 'clear') { input.value = ''; last.textContent = ''; justAnswered = false; return; }
    if (k === 'back') { input.value = input.value.slice(0, -1); justAnswered = false; return; }
    if (k === 'equals') { equals(); return; }
    // After an answer, a digit starts fresh; an operator keeps going from the answer.
    if (justAnswered && /^[\d.(]$/.test(k)) input.value = '';
    justAnswered = false;
    input.value += /^[÷×−+]$/.test(k) ? ' ' + k + ' ' : k;
  }

  toggle.addEventListener('click', function () { if (panel.hidden) open(); else close(); });
  panel.querySelector('.calc-close').addEventListener('click', close);
  panel.querySelector('.calc-keys').addEventListener('click', function (e) {
    var b = e.target.closest('.calc-key');
    if (!b) return;
    press(b.getAttribute('data-k'));
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else { justAnswered = false; msg.textContent = ''; }
  });
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Exposed for automated checks; the page does not need it.
  window.U3Calc = { evaluate: evaluate, show: show };
})();
