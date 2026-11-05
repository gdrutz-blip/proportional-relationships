/*
 * Percent Builder (Lesson 4: percent of a number)
 * Build the percent from benchmark tiles (50%, 25%, 10%, 5%, 1%) on a double number line,
 * find what each tile is worth, then add them up.
 * Key move: 10% = ÷ 10, 5% = half of that, 25% = ÷ 4. Build the rest from them.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;
  var TILES = [50, 25, 10, 5, 1];
  var MAX_TILES = 12;
  var RULE = { 50: '÷ 2', 25: '÷ 4', 10: '÷ 10', 5: 'half of 10%', 1: '÷ 100' };

  var TARGETS = [
    [10, 20, 25, 30, 50, 75],          // Q1: one or two kinds of tile
    [15, 35, 40, 55, 60, 70],          // Q2
    [45, 65, 85, 95, 80],              // Q3: three kinds of tile
    [2, 11, 12, 21, 26, 51, 52],       // Q4: needs 1%
    [110, 115, 120, 125, 150],         // Q5: more than 100%
    [15, 35, 45, 65, 12, 21, 85]       // Q6: mixed
  ];
  var COUNT_BASES = [20, 40, 60, 80, 120, 160, 200, 240, 300, 400, 500];

  var COUNT_CONTEXTS = [
    function (n, base, pct) { return 'On Saturday, the truck sold ' + base + ' smoothies. ' + pct + '% of them were Berry Blast. How many Berry Blasts did it sell?'; },
    function (n, base, pct) { return n + ' counted ' + base + ' customers at the festival. ' + pct + '% of them paid with a card. How many paid with a card?'; },
    function (n, base, pct) { return 'Zuri bought ' + base + ' paper cups. ' + n + ' used ' + pct + '% of them on Friday. How many cups is that?'; },
    function (n, base, pct) { return n + ' asked ' + base + ' students to vote for a new flavour. ' + pct + '% voted for Mango Tango. How many votes is that?'; }
  ];
  var GROWTH_CONTEXT = function (n, base, pct) {
    return 'Last Saturday the truck sold ' + base + ' smoothies. This Saturday it sold ' + pct + '% of that. How many smoothies did it sell this Saturday?';
  };
  var MONEY_CONTEXTS = [
    function (n, base, pct) { return 'The truck took in $' + base + ' on Sunday. Zuri spends ' + pct + '% of it on fruit. How much is that?'; },
    function (n, base, pct) { return n + ' earned $' + base + ' this month. ' + n + ' saves ' + pct + '% of it. How much does ' + n + ' save?'; }
  ];

  function makeQuestion(index, nextName) {
    var pct = U.pick(TARGETS[Math.min(index, TARGETS.length - 1)]);
    var name = nextName();
    var bases = COUNT_BASES.filter(function (b) { return (b * pct) % 100 === 0; });
    var money = !bases.length || Math.random() < 0.25;
    var base, text;
    if (money) {
      base = U.pick([40, 60, 80, 120, 150, 200, 240, 360]);
      text = U.pick(MONEY_CONTEXTS)(name, base, pct);
    } else {
      base = U.pick(bases);
      text = (pct > 100 ? GROWTH_CONTEXT : U.pick(COUNT_CONTEXTS))(name, base, pct);
    }
    return new Question({ pct: pct, base: base, money: money, prompt: text, unit: money ? '' : unitFor(text) });
  }
  function unitFor(text) {
    if (/customers/.test(text)) return 'customers';
    if (/cups/.test(text)) return 'cups';
    if (/votes/.test(text)) return 'votes';
    return 'smoothies';
  }

  // ---------- The question ----------
  function Question(d) {
    this.d = d;
    this.build = [];           // tiles in the order they were added
    this.saved = {};           // what the student typed for each tile, kept across re-renders
  }

  Question.prototype.value = function (pct) { return U.clean(this.d.base * pct / 100); };
  Question.prototype.fmt = function (n) { return this.d.money ? U.money(n) : U.num(n); };
  Question.prototype.baseText = function () { return this.d.money ? '$' + this.d.base : String(this.d.base); };
  Question.prototype.built = function () { return this.build.reduce(function (a, b) { return a + b; }, 0); };
  Question.prototype.kinds = function () {
    var b = this.build;
    return TILES.filter(function (t) { return b.indexOf(t) !== -1; });
  };
  Question.prototype.countOf = function (t) { return this.build.filter(function (x) { return x === t; }).length; };

  Question.prototype.render = function (c) {
    var d = this.d, self = this;
    var html = '<p class="prompt">' + d.prompt + '</p>' +
      '<p class="step-title">Step 1: Build ' + d.pct + '% from tiles.</p>' +
      '<div class="tile-bank" role="group" aria-label="Percent tiles">';
    TILES.forEach(function (t) {
      html += '<button type="button" class="pct-tile t' + t + '" data-t="' + t + '">' + t + '%</button>';
    });
    html += '</div><div class="tile-tools">' +
      '<button type="button" class="btn small-btn" data-act="undo">Undo</button>' +
      '<button type="button" class="btn small-btn" data-act="clear">Clear</button></div>' +
      '<p class="build-line" aria-live="polite"></p>' +
      '<div class="build-picture"></div>' +
      '<p class="step-title">Step 2: What is each tile worth?</p>' +
      '<div class="answer-list tile-values"></div>' +
      '<p class="step-title">Step 3: Add them up.</p>' +
      '<div class="answer-line"><label for="pb-total">' + d.pct + '% of ' + this.baseText() + ' =</label><div class="input-row">' +
      (d.money ? '<span class="affix">$</span>' : '') +
      '<input id="pb-total" type="text" inputmode="decimal" autocomplete="off">' +
      (d.unit ? '<span class="affix">' + d.unit + '</span>' : '') + '</div><span class="mark" id="mark-pb-total"></span></div>';
    c.innerHTML = html;
    this.root = c;
    this.total = c.querySelector('#pb-total');
    this.line = c.querySelector('.build-line');
    this.pic = c.querySelector('.build-picture');
    this.valuesBox = c.querySelector('.tile-values');

    Array.prototype.forEach.call(c.querySelectorAll('.pct-tile'), function (btn) {
      btn.addEventListener('click', function () {
        if (self.build.length >= MAX_TILES) return;
        self.build.push(Number(btn.getAttribute('data-t')));
        self.update();
      });
    });
    c.querySelector('[data-act="undo"]').addEventListener('click', function () { self.build.pop(); self.update(); });
    c.querySelector('[data-act="clear"]').addEventListener('click', function () { self.build = []; self.update(); });
    this.update();
  };

  /** Redraws the build line, the picture and one input per kind of tile used. */
  Question.prototype.update = function () {
    var d = this.d, self = this, built = this.built();
    // Keep what was typed so far.
    Array.prototype.forEach.call(this.valuesBox.querySelectorAll('input'), function (inp) {
      self.saved[inp.getAttribute('data-t')] = inp.value;
    });

    if (!this.build.length) {
      this.line.innerHTML = 'Tap tiles to build <strong>' + d.pct + '%</strong>.';
    } else {
      var status = built === d.pct ? ' ✓' : built < d.pct ? ' (need ' + d.pct + '%)' : ' (too much: need ' + d.pct + '%)';
      this.line.innerHTML = 'Your build: ' + this.build.map(function (t) { return t + '%'; }).join(' + ') +
        ' = <strong>' + built + '%</strong>' + status;
    }
    this.pic.innerHTML = this.picture(false);

    var html = '';
    this.kinds().forEach(function (t) {
      var n = self.countOf(t);
      html += '<div class="answer-line"><label for="pb-' + t + '">' + t + '% of ' + self.baseText() +
        (n > 1 ? ' <span class="small">(used ' + n + ' times)</span>' : '') + ' =</label><div class="input-row">' +
        (d.money ? '<span class="affix">$</span>' : '') +
        '<input id="pb-' + t + '" data-t="' + t + '" type="text" inputmode="decimal" autocomplete="off">' +
        '</div><span class="mark" id="mark-pb-' + t + '"></span></div>';
    });
    if (!html) html = '<p class="small">Boxes appear here as you add tiles.</p>';
    this.valuesBox.innerHTML = html;
    Array.prototype.forEach.call(this.valuesBox.querySelectorAll('input'), function (inp) {
      var t = inp.getAttribute('data-t');
      if (self.saved[t]) inp.value = self.saved[t];
    });
  };

  /** Percent on the bottom line, the amount on the top line, one block per tile. */
  Question.prototype.picture = function (withAnswer) {
    var d = this.d, self = this;
    var max = Math.max(100, d.pct, this.built());
    var segs = [], at = 0;
    this.build.forEach(function (t) {
      segs.push({ from: at / max, to: (at + t) / max, text: t + '%', cls: 't' + t });
      at += t;
    });
    var pts = [{ p: 0, top: d.money ? '$0' : '0', bottom: '0%' }, { p: 100 / max, top: this.baseText(), bottom: '100%' }];
    if (Math.abs(d.pct - 100) >= 12) {
      pts.push({ p: d.pct / max, top: withAnswer ? this.fmt(this.value(d.pct)) : '?', bottom: d.pct + '%' });
    }
    return U.numberLine({
      points: pts, segments: segs,
      label: 'Double number line: 0% to 100% is 0 to ' + this.baseText() + '. Tiles: ' + (this.build.join('%, ') || 'none') + (this.build.length ? '%' : ''),
      caption: 'Top: the amount. Bottom: the percent.'
    });
  };

  Question.prototype.check = function () {
    var d = this.d, self = this, built = this.built();
    if (!this.build.length) return { incomplete: 'Step 1: tap tiles to build ' + d.pct + '%.' };
    if (built < d.pct) return { incomplete: 'Your tiles make ' + built + '%. Add tiles until they make exactly ' + d.pct + '%.' };
    if (built > d.pct) return { incomplete: 'Your tiles make ' + built + '%, more than ' + d.pct + '%. Tap Undo and try a smaller tile.' };
    var inputs = Array.prototype.slice.call(this.valuesBox.querySelectorAll('input')).concat([this.total]);
    var read = U.readInputs(inputs, d.money ? '8.40' : '8');
    if (read.incomplete) return read;

    var kinds = this.kinds(), notes = [], allOk = true, sumDistinct = 0;
    kinds.forEach(function (t, i) {
      var v = read.values[i], right = self.value(t), ok = U.same(v, right);
      sumDistinct += v;
      U.markInput(inputs[i], ok);
      if (ok) return;
      allOk = false;
      if (t === 5 && U.near(v, d.base / 5, 0.001)) notes.push('5% is half of 10%, not ÷ 5.');
      else if (t === 25 && U.near(v, d.base / 25, 0.001)) notes.push('25% = ÷ 4, not ÷ 25.');
      else if (t === 1 && (U.near(v, d.base / 10, 0.001) || U.same(v, d.base))) notes.push('1% = ÷ 100.');
      else if (t === 50 && U.near(v, d.base / 50, 0.001)) notes.push('50% = ÷ 2, not ÷ 50.');
      else notes.push('Check ' + t + '% of ' + self.baseText() + ' (' + RULE[t] + ').');
    });
    var totalVal = read.values[read.values.length - 1];
    var totalOk = U.same(totalVal, this.value(d.pct));
    U.markInput(this.total, totalOk);
    if (!totalOk) {
      allOk = false;
      var repeats = kinds.some(function (t) { return self.countOf(t) > 1; });
      if (repeats && U.same(totalVal, U.clean(sumDistinct))) notes.push('You used some tiles more than once. Add a tile’s amount every time you used it.');
      else notes.push('Step 3: add the amount for every tile you used.');
    }
    if (allOk) {
      return { ok: true, message: d.pct + '% of ' + this.baseText() + ' = ' + this.sumText() + ' = ' + this.fmt(this.value(d.pct)) + '.' };
    }
    return { ok: false, message: notes.join(' ') };
  };

  Question.prototype.sumText = function () {
    var self = this;
    return this.build.slice().sort(function (a, b) { return b - a; }).map(function (t) { return self.fmt(self.value(t)); }).join(' + ');
  };

  Question.prototype.hint = function () {
    var self = this, d = this.d;
    var rules = this.kinds().map(function (t) { return '<li>' + t + '% = ' + RULE[t] + (t === 5 ? ' (so find 10% first)' : '') + '</li>'; }).join('');
    var repeats = this.kinds().filter(function (t) { return self.countOf(t) > 1; });
    return '<p>Use the benchmarks:</p><ul>' + rules + '</ul>' +
      '<p>Then add an amount for <strong>every</strong> tile.' +
      (repeats.length ? ' You used ' + repeats.map(function (t) { return t + '% ' + self.countOf(t) + ' times'; }).join(' and ') + ', so add that amount that many times.' : '') +
      '</p>' + this.picture(false) +
      (Math.abs(d.pct - 100) >= 12 ? '<p class="small">The ? is ' + d.pct + '% of ' + this.baseText() + '.</p>' : '');
  };

  Question.prototype.solution = function () {
    var self = this, d = this.d, b = this.baseText();
    var html = '<ol>';
    this.kinds().forEach(function (t) {
      var how;
      if (t === 5) how = 'half of 10% = half of ' + self.fmt(self.value(10));
      else how = b + ' ' + RULE[t];
      html += '<li>' + t + '% of ' + b + ' = ' + how + ' = <strong>' + self.fmt(self.value(t)) + '</strong></li>';
    });
    var order = this.build.slice().sort(function (x, y) { return y - x; });
    html += '<li>' + d.pct + '% = ' + order.map(function (t) { return t + '%'; }).join(' + ') + ', so ' +
      this.sumText() + ' = <strong>' + this.fmt(this.value(d.pct)) + (d.unit ? ' ' + d.unit : '') + '</strong></li></ol>' +
      this.picture(true);
    return html;
  };

  Question.prototype.lock = function () { U.disableAll(this.root); };

  window.PercentBuilder = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'percent-builder', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
