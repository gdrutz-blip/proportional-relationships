/*
 * Missing Ingredient (Lesson 3: solving proportions)
 * Step 1: pick the proportion that keeps the same order on both sides.
 * Step 2: solve it for a bigger or smaller batch.
 * Key move: keep the same order on both sides. If the numbers aren't nice, find the value for 1.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;

  // a = the ingredient amount, b = the number of smoothies.
  // aMin/aMax/aStep give friendly amounts; money amounts are in cents.
  var CONTEXTS = [
    { aUnit: 'cups', aNoun: 'yogurt', aMin: 1, aMax: 9, aStep: 1 },
    { aUnit: 'cups', aNoun: 'frozen berries', aMin: 2, aMax: 10, aStep: 1 },
    { aUnit: 'mL', aNoun: 'orange juice', aMin: 150, aMax: 600, aStep: 50 },
    { aUnit: 'g', aNoun: 'spinach', aMin: 60, aMax: 240, aStep: 20 },
    { aUnit: 'scoops', aNoun: 'ice', aMin: 2, aMax: 12, aStep: 1 }
  ];
  var MONEY = { money: true, aUnit: 'dollars', aNoun: '', aMin: 350, aMax: 650, aStep: 5 };

  function pickA(ctx) {
    var steps = Math.floor((ctx.aMax - ctx.aMin) / ctx.aStep);
    return ctx.aMin + U.randInt(0, steps) * ctx.aStep;
  }
  /** Value for 1 has at most 2 decimal places (in cents for money), so no rounding in the middle. */
  function friendlyUnit(a, b) {
    var x = a * 100 / b;
    return Math.abs(x - Math.round(x)) < 1e-9;
  }

  function build(kind) {
    var ctx = kind === 'money' ? MONEY : U.pick(CONTEXTS);
    for (var attempt = 0; attempt < 5000; attempt++) {
      var b1, b2, a1;
      if (kind === 'up') {
        b1 = U.randInt(2, 6); b2 = b1 * U.randInt(2, 5);
      } else if (kind === 'down') {
        b2 = U.randInt(2, 4); b1 = b2 * U.randInt(2, 4);
      } else {
        b1 = U.randInt(2, 8); b2 = U.randInt(3, 20);
        if (b2 === b1 || b2 % b1 === 0 || b1 % b2 === 0) continue; // not nice: use the value for 1
      }
      if (kind === 'money') {
        var unitCents = pickA(ctx);           // price of one smoothie in cents
        a1 = unitCents * b1;                  // a1 in cents
      } else {
        a1 = pickA(ctx);
        if (!friendlyUnit(a1, b1)) continue;
        if (kind !== 'up' && kind !== 'down' && a1 % b1 === 0 && Math.random() < 0.7) continue; // prefer decimals
      }
      if (a1 === b1) continue; // a value for 1 of exactly 1 is too easy
      var a2 = U.clean(a1 * b2 / b1);
      if (kind === 'down' && !friendlyUnit(a2, 1)) continue;
      if (kind !== 'money') {
        // Friendly answers: at most one decimal place (like 4.8), and a whole amount to start from in reverse questions.
        if (Math.abs(a2 * 10 - Math.round(a2 * 10)) > 1e-9) continue;
        if (kind === 'reverse' && !Number.isInteger(a2)) continue;
      }
      return { ctx: ctx, kind: kind, a1: a1, b1: b1, a2: a2, b2: b2, askB: kind === 'reverse' };
    }
    throw new Error('Could not build a proportion');
  }

  function makeQuestion(index, nextName) {
    var kinds = ['up', 'down', 'notnice', 'reverse', 'money', 'notnice'];
    return new Question(build(kinds[index]), nextName());
  }

  // ---------- The question ----------
  function Question(d, name) {
    this.d = d;
    this.name = name;
    this.choice = null;
    var c = d.ctx;
    this.money = !!c.money;
    // In money questions the amounts are stored in cents.
    this.A1 = this.money ? d.a1 / 100 : d.a1;
    this.A2 = this.money ? d.a2 / 100 : d.a2;
    this.unitValue = U.clean(this.A1 / d.b1);
    this.answer = d.askB ? d.b2 : this.A2;
  }

  Question.prototype.a = function (n) {
    var u = this.d.ctx.aUnit;
    return this.money ? U.money(n) : U.num(n) + ' ' + (n === 1 ? u.replace(/s$/, '') : u);
  };
  Question.prototype.b = function (n) { return n + (n === 1 ? ' smoothie' : ' smoothies'); };
  Question.prototype.aShort = function () { return this.money ? 'dollars' : this.d.ctx.aUnit; };

  Question.prototype.promptText = function () {
    var d = this.d, c = d.ctx, n = this.name;
    if (this.money) {
      return n + ' paid ' + this.a(this.A1) + ' for ' + this.b(d.b1) + ' at the truck. At the same price, how much would ' +
        this.b(d.b2) + ' cost?';
    }
    var what = c.aUnit + ' of ' + c.aNoun;
    var fest = 'The Festival Special recipe uses ' + this.a(d.a1) + ' of ' + c.aNoun + ' for ' + this.b(d.b1) + '. ';
    if (d.askB) return fest + n + ' has ' + this.a(d.a2) + ' of ' + c.aNoun + '. How many smoothies can ' + n + ' make?';
    if (d.kind === 'down') return fest + n + ' only needs ' + this.b(d.b2) + '. How many ' + what + ' are needed?';
    return fest + n + ' needs to make ' + this.b(d.b2) + '. How many ' + what + ' are needed?';
  };

  /** The three proportions to choose from. Index 0 is the right one before shuffling. */
  Question.prototype.options = function () {
    var d = this.d;
    var A1 = this.a(this.A1), B1 = this.b(d.b1);
    var A2 = d.askB ? this.a(this.A2) : 'x ' + this.aShort();
    var B2 = d.askB ? 'x smoothies' : this.b(d.b2);
    function eq(l, r) { return '<span class="eq">' + l + '<span class="eq-sign">=</span>' + r + '</span>'; }
    var f = U.frac;
    return [
      { ok: true, html: eq(f(A1, B1), f(A2, B2)) },
      { ok: false, html: eq(f(A1, B1), f(B2, A2)) },
      { ok: false, html: eq(f(B1, A1), f(A2, B2)) }
    ];
  };

  Question.prototype.render = function (c) {
    var self = this;
    this.opts = U.shuffle(this.options());
    var html = '<p class="prompt">' + this.promptText() + '</p>' +
      '<p class="step-title">Step 1: Which proportion keeps the same order on both sides?</p>' +
      '<div class="options" role="group" aria-label="Proportions">';
    this.opts.forEach(function (o, i) {
      html += '<button type="button" class="option" data-i="' + i + '">' + o.html + '</button>';
    });
    html += '</div><span class="mark" id="mark-setup"></span>' +
      '<p class="step-title"><label for="mi-x">Step 2: Solve it.</label></p>' +
      '<div class="input-row"><span class="affix">x =</span>' + (this.money ? '<span class="affix">$</span>' : '') +
      '<input id="mi-x" type="text" inputmode="decimal" autocomplete="off">' +
      '<span class="affix">' + (this.d.askB ? 'smoothies' : this.money ? '' : this.d.ctx.aUnit) + '</span></div>' +
      '<span class="mark" id="mark-mi-x"></span>';
    c.innerHTML = html;
    this.root = c;
    this.input = c.querySelector('input');
    this.optionButtons = c.querySelectorAll('.option');
    U.pickGroup(this.optionButtons, function (i) { self.choice = i; });
  };

  Question.prototype.check = function () {
    if (this.choice === null) return { incomplete: 'Step 1: tap the proportion that keeps the same order on both sides.' };
    var read = U.readInputs([this.input], this.money ? '4.80' : '4.8');
    if (read.incomplete) return read;
    var v = read.values[0], d = this.d;
    var setupOk = this.opts[this.choice].ok;
    var ansOk = U.same(v, this.answer);
    var mark = document.getElementById('mark-setup');
    mark.textContent = setupOk ? '✓ Same order on both sides' : '✗ Check the order';
    mark.className = 'mark ' + (setupOk ? 'right' : 'wrong');
    U.markInput(this.input, ansOk);
    if (setupOk && ansOk) {
      return { ok: true, message: 'x = ' + (d.askB ? this.b(d.b2) : this.a(this.A2)) + '.' };
    }
    var notes = [];
    if (!setupOk) notes.push('Step 1: keep the same order on both sides, like ' + this.aShort() + '/smoothies = ' + this.aShort() + '/smoothies.');
    if (!ansOk) {
      var flipped = d.askB ? U.clean(this.A1 * this.A2 / d.b1) : U.clean(d.b1 * d.b2 / this.A1);
      var added = d.askB ? d.b1 + (this.A2 - this.A1) : this.A1 + (d.b2 - d.b1);
      if (U.near(v, flipped, 0.01)) notes.push('Step 2: it looks like the ratio got flipped.');
      else if (U.near(v, added, 0.001)) notes.push('Step 2: it looks like you added. In a proportion you multiply or divide.');
      else if (U.near(v, this.answer, 0.03)) notes.push('Step 2: very close! Don’t round in the middle. Find the value for 1 exactly.');
      else notes.push('Step 2: check your value for x.');
    }
    return { ok: false, message: notes.join(' ') };
  };

  Question.prototype.isNice = function () { return this.d.kind === 'up' || this.d.kind === 'down'; };

  Question.prototype.picture = function (withAnswer) {
    var d = this.d, self = this;
    var ask = withAnswer ? null : '?';
    var top = function (v) { return self.money ? U.money(v) : U.num(v); };
    var unknownTop = d.askB ? top(this.A2) : (ask || top(this.A2));
    var unknownBottom = d.askB ? (ask || String(d.b2)) : String(d.b2);
    var pts, ops;
    if (this.isNice()) {
      var big = Math.max(d.b1, d.b2), k = big / Math.min(d.b1, d.b2);
      var given = { top: top(this.A1), bottom: String(d.b1) };
      var unknown = { top: unknownTop, bottom: unknownBottom };
      var first = d.b1 < d.b2 ? given : unknown, second = d.b1 < d.b2 ? unknown : given;
      first.p = 0.4; second.p = 1;
      pts = [{ p: 0, top: self.money ? '$0' : '0', bottom: '0' }, first, second];
      ops = [{ p: 0.7, text: (d.b1 < d.b2 ? '× ' : '÷ ') + k }];
      return U.numberLine({
        points: pts, ops: ops,
        label: 'Double number line from ' + d.b1 + ' to ' + d.b2 + ' smoothies, ' + (d.b1 < d.b2 ? 'times ' : 'divided by ') + k,
        caption: 'Top: ' + this.aShort() + '. Bottom: smoothies.' + (d.b1 < d.b2 ? ' Multiply both lines by ' : ' Divide both lines by ') + k + '.'
      });
    }
    var oneTop = withAnswer ? top(this.unitValue) : '?';
    var vals = [
      { v: 1, top: oneTop, bottom: '1' },
      { v: d.b1, top: top(this.A1), bottom: String(d.b1) },
      { v: d.b2, top: unknownTop, bottom: unknownBottom }
    ].sort(function (x, y) { return x.v - y.v; });
    pts = [{ p: 0, top: self.money ? '$0' : '0', bottom: '0' }];
    vals.forEach(function (x, i) { pts.push({ p: (i + 1) / 3, top: x.top, bottom: x.bottom }); });
    return U.numberLine({
      points: pts,
      label: 'Double number line with 0, 1, ' + d.b1 + ' and ' + d.b2 + ' smoothies',
      caption: 'Top: ' + this.aShort() + '. Bottom: smoothies. Find the value for 1 smoothie first.'
    });
  };

  Question.prototype.hint = function () {
    var d = this.d;
    var html = '<p>Keep the same order on both sides: <strong>' + this.aShort() + '/smoothies = ' + this.aShort() + '/smoothies</strong>.</p>';
    if (this.isNice()) {
      html += '<p>These numbers are nice: ' + (d.b1 < d.b2 ? d.b1 + ' × ? = ' + d.b2 : d.b1 + ' ÷ ? = ' + d.b2) +
        '. Do the same thing to the top.</p>';
    } else {
      html += '<p>Not nice? <strong>Find the value for 1:</strong> ' + (this.money ? U.money(this.A1) : U.num(this.A1)) + ' ÷ ' + d.b1 +
        ' = ? ' + this.aShort() + ' per smoothie. Then ' + (d.askB ? 'divide ' + (this.money ? U.money(this.A2) : U.num(this.A2)) + ' by it.' : 'multiply it by ' + d.b2 + '.') + '</p>';
    }
    return html + this.picture(false);
  };

  Question.prototype.solution = function () {
    var d = this.d;
    var right = this.opts.filter(function (o) { return o.ok; })[0].html;
    var html = '<ol><li>Same order on both sides: ' + right + '</li>';
    var val = this.money ? U.money(this.unitValue) : U.num(this.unitValue);
    if (this.isNice()) {
      var k = Math.max(d.b1, d.b2) / Math.min(d.b1, d.b2);
      var op = d.b1 < d.b2 ? '×' : '÷';
      html += '<li>' + d.b1 + ' ' + op + ' ' + k + ' = ' + d.b2 + ', so ' + (op === '×' ? 'multiply' : 'divide') + ' the top by ' + k + ' too.</li>' +
        '<li>' + (this.money ? U.money(this.A1) : U.num(this.A1)) + ' ' + op + ' ' + k + ' = <strong>' + this.a(this.A2) + '</strong></li>';
    } else if (d.askB) {
      html += '<li>Value for 1: ' + U.num(this.A1) + ' ÷ ' + d.b1 + ' = ' + val + ' ' + this.aShort() + ' per smoothie.</li>' +
        '<li>' + U.num(this.A2) + ' ÷ ' + val + ' = <strong>' + this.b(d.b2) + '</strong></li>';
    } else {
      html += '<li>Value for 1: ' + (this.money ? U.money(this.A1) : U.num(this.A1)) + ' ÷ ' + d.b1 + ' = ' + val + (this.money ? '' : ' ' + this.aShort()) + ' per smoothie.</li>' +
        '<li>' + val + ' × ' + d.b2 + ' = <strong>' + this.a(this.A2) + '</strong></li>';
    }
    html += '</ol>' + this.picture(true);
    return html;
  };

  Question.prototype.lock = function () {
    var self = this;
    U.disableAll(this.root);
    Array.prototype.forEach.call(this.optionButtons, function (b, i) { b.classList.toggle('answer', self.opts[i].ok); });
  };

  window.MissingIngredient = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'missing-ingredient', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
