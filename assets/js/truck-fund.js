/*
 * Second Truck Fund (Lesson 7: simple interest)
 * I = Prt with the rate as a decimal and the time in years. Months become years,
 * interest is not the total, and working backwards finds the time or the rate.
 * The last question: choose P, r and t to reach a savings goal.
 * Key move: I = Prt. Rate as a decimal, time in years.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;
  var $ = U.dollars; // $8000, $40 000, $72, $82.50 — the unit's style
  function c(x) { return U.clean(x); }

  var PRINCIPALS = [300, 500, 800, 1000, 1200, 1500, 2000, 2500, 4000, 5000, 8000, 10000];
  var RATES = [2, 3, 4, 5, 6];
  var MONTHS = [{ m: 6, y: 0.5 }, { m: 18, y: 1.5 }, { m: 3, y: 0.25 }, { m: 9, y: 0.75 }, { m: 30, y: 2.5 }];

  function rateMistakes(r) {
    return [
      { value: r, msg: 'Write the rate as a decimal: ' + r + '% = ' + U.num(r / 100) + '.' },
      { value: r / 10, msg: r + '% = ' + U.num(r / 100) + ', not ' + U.num(r / 10) + '. Percent means out of 100.' }
    ];
  }
  function interestMistakes(P, r, t) {
    var I = c(P * r / 100 * t);
    return [
      { value: c(P * r * t), msg: 'Use the rate as a decimal (' + U.num(r / 100) + '), not ' + r + '. ' + $(P * r * t) + ' is far too big.' },
      { value: c(P + I), msg: 'That’s the total. The question asks for the interest only.' },
      { value: c(P * r / 100), msg: 'That’s one year of interest. Multiply by the time too.' }
    ];
  }

  /** Years on top, interest below, with the same jump every year. */
  function yearsLine(oneYear, t, showAnswer) {
    var pts = [{ p: 0, top: '0', bottom: '$0' }, { p: 0.3, top: '1 year', bottom: showAnswer ? $(oneYear) : '?' }];
    if (t !== 1) pts.push({ p: 1, top: U.num(t) + ' years', bottom: showAnswer ? $(oneYear * t) : '?' });
    if (t < 1) pts = [{ p: 0, top: '0', bottom: '$0' }, { p: 0.5, top: U.num(t) + ' year', bottom: showAnswer ? $(oneYear * t) : '?' }, { p: 1, top: '1 year', bottom: showAnswer ? $(oneYear) : '?' }];
    return U.numberLine({ points: pts, label: 'Years on top, interest below. The interest is the same every year.',
      caption: 'Top: time in years. Bottom: interest. Same jump every year.' });
  }

  function findInterest(name) {
    var P = U.pick(PRINCIPALS), r = U.pick(RATES), t = U.randInt(2, 5);
    var I = c(P * r / 100 * t);
    return new U.StepQuestion({
      prompt: name + ' saves ' + $(P) + ' in an account that pays ' + r + '% simple interest per year. How much interest does ' + name + ' earn in ' + t + ' years?',
      steps: [
        { label: 'r as a decimal', answer: r / 100, mistakes: rateMistakes(r) },
        { label: 'Interest I = P × r × t', money: true, answer: I, mistakes: interestMistakes(P, r, t) }
      ],
      success: $(P) + ' × ' + U.num(r / 100) + ' × ' + t + ' = ' + $(I) + '.',
      hint: '<p>I = P × r × t. P = ' + $(P) + ', r = ' + r + '% as a decimal, t = ' + t + ' years.</p>' +
        '<p>Friendly order: one year first (' + $(P) + ' × ' + U.num(r / 100) + '), then × ' + t + '.</p>' + yearsLine(P * r / 100, t, false),
      solution: '<ol><li>r = ' + r + '% = ' + U.num(r / 100) + '.</li><li>One year: ' + $(P) + ' × ' + U.num(r / 100) + ' = ' + $(P * r / 100) + '.</li>' +
        '<li>' + t + ' years: ' + $(P * r / 100) + ' × ' + t + ' = <strong>' + $(I) + '</strong>.</li></ol>' + yearsLine(P * r / 100, t, true)
    });
  }

  function months(name) {
    var P = U.pick(PRINCIPALS.filter(function (p) { return p >= 1000; })), r = U.pick(RATES), mo = U.pick(MONTHS);
    var I = c(P * r / 100 * mo.y);
    return new U.StepQuestion({
      prompt: name + ' saves ' + $(P) + ' at ' + r + '% simple interest per year for ' + mo.m + ' months. How much interest is earned?',
      steps: [
        { label: 't in years', unit: 'years', answer: mo.y,
          mistakes: [{ value: mo.m, msg: 'Time must be in YEARS. ' + mo.m + ' months ÷ 12 = ' + U.num(mo.y) + ' years.' },
            { value: mo.m / 10, msg: 'There are 12 months in a year, not 10: ' + mo.m + ' ÷ 12 = ' + U.num(mo.y) + '.' }] },
        { label: 'Interest I = P × r × t', money: true, answer: I,
          mistakes: [{ value: c(P * r / 100 * mo.m), msg: 'It looks like you used ' + mo.m + ' as the time. Change months to years first.' }].concat(interestMistakes(P, r, mo.y)) }
      ],
      success: mo.m + ' months = ' + U.num(mo.y) + ' years, and ' + $(P) + ' × ' + U.num(r / 100) + ' × ' + U.num(mo.y) + ' = ' + $(I) + '.',
      hint: '<p>Time in YEARS: months ÷ 12. 6 months = 0.5 years, 18 months = 1.5 years.</p><p>Then I = P × r × t, with r = ' + U.num(r / 100) + '.</p>' +
        yearsLine(P * r / 100, mo.y, false),
      solution: '<ol><li>t = ' + mo.m + ' ÷ 12 = ' + U.num(mo.y) + ' years.</li><li>One year: ' + $(P) + ' × ' + U.num(r / 100) + ' = ' + $(P * r / 100) + '.</li>' +
        '<li>' + U.num(mo.y) + ' years: ' + $(P * r / 100) + ' × ' + U.num(mo.y) + ' = <strong>' + $(I) + '</strong>.</li></ol>'
    });
  }

  function total(name) {
    var P = U.pick([2000, 4000, 5000, 8000, 10000]), r = U.pick(RATES), t = U.randInt(2, 4);
    var I = c(P * r / 100 * t), A = c(P + I);
    var borrow = Math.random() < 0.5;
    return new U.StepQuestion({
      prompt: borrow ? 'Zuri borrows ' + $(P) + ' for a food trailer at ' + r + '% simple interest per year for ' + t + ' years. How much does she pay back in total?' :
        name + ' saves ' + $(P) + ' for the second truck at ' + r + '% simple interest per year. How much is in the account after ' + t + ' years?',
      steps: [
        { label: 'Interest I = P × r × t', money: true, answer: I, mistakes: interestMistakes(P, r, t).slice(0, 1).concat(interestMistakes(P, r, t).slice(2)) },
        { label: borrow ? 'Total paid back' : 'Total in the account', money: true, answer: A,
          mistakes: [{ value: I, msg: 'Interest is not the total. Add the principal (' + $(P) + ') back on.' }] }
      ],
      success: $(P) + ' + ' + $(I) + ' interest = ' + $(A) + '.',
      hint: '<p>Find the interest with I = Prt (r = ' + U.num(r / 100) + ', t = ' + t + ').</p><p>Interest is not the total: total = principal + interest.</p>',
      solution: '<ol><li>I = ' + $(P) + ' × ' + U.num(r / 100) + ' × ' + t + ' = ' + $(I) + '.</li><li>Total = ' + $(P) + ' + ' + $(I) + ' = <strong>' + $(A) + '</strong>.</li></ol>'
    });
  }

  function findTime() {
    for (;;) {
      var P = U.pick([1000, 2000, 4000, 5000, 8000, 10000, 20000]), r = U.pick(RATES);
      var one = c(P * r / 100);
      var t = U.pick([2, 3, 4, 5, 6, 8, 10, 2.5, 12.5]);
      var I = c(one * t);
      if (I % 10 !== 0) continue;
      return new U.StepQuestion({
        prompt: 'Zuri saves ' + $(P) + ' at ' + r + '% simple interest per year. How many years until she has earned ' + $(I) + ' of interest?',
        steps: [
          { label: 'One year of interest', money: true, answer: one, mistakes: [{ value: c(P * r), msg: 'Use the rate as a decimal: ' + r + '% = ' + U.num(r / 100) + '.' }] },
          { label: 'Number of years', unit: 'years', answer: t,
            mistakes: [{ value: c(I / P), msg: 'Divide the interest by ONE YEAR of interest, not by the principal.' }] }
        ],
        success: $(I) + ' ÷ ' + $(one) + ' per year = ' + U.num(t) + ' years.',
        hint: '<p>Work backwards. Find one year of interest first: ' + $(P) + ' × ' + U.num(r / 100) + '.</p><p>Then: how many of those make ' + $(I) + '? Divide.</p>' +
          yearsLine(one, t, false),
        solution: '<ol><li>One year: ' + $(P) + ' × ' + U.num(r / 100) + ' = ' + $(one) + '.</li><li>' + $(I) + ' ÷ ' + $(one) + ' = <strong>' + U.num(t) + ' years</strong>.</li></ol>'
      });
    }
  }

  function findRate(name) {
    var P = U.pick([1000, 2000, 4000, 5000, 8000, 10000]), r = U.pick([2, 3, 4, 5, 6, 2.5]), t = U.randInt(2, 5);
    var one = c(P * r / 100), I = c(one * t);
    return new U.StepQuestion({
      prompt: name + '’s ' + $(P) + ' loan cost ' + $(I) + ' of simple interest over ' + t + ' years. What was the interest rate per year?',
      steps: [
        { label: 'One year of interest', money: true, answer: one,
          mistakes: [{ value: I, msg: $(I) + ' is the interest for all ' + t + ' years. Divide by ' + t + ' for one year.' }] },
        { label: 'Rate per year', pct: true, answer: r, accept: [r / 100],
          mistakes: [{ value: c(I / P * 100), msg: 'Use ONE year of interest: rate = one year’s interest ÷ principal.' }] }
      ],
      success: $(I) + ' ÷ ' + t + ' = ' + $(one) + ' a year, and ' + $(one) + ' ÷ ' + $(P) + ' = ' + U.num(r / 100) + ' = ' + U.num(r) + '%.',
      hint: '<p>Work backwards. One year of interest: ' + $(I) + ' ÷ ' + t + '.</p><p>Rate = one year’s interest ÷ principal. Then write the decimal as a percent.</p>',
      solution: '<ol><li>One year: ' + $(I) + ' ÷ ' + t + ' = ' + $(one) + '.</li><li>' + $(one) + ' ÷ ' + $(P) + ' = ' + U.num(r / 100) + '.</li>' +
        '<li>' + U.num(r / 100) + ' = <strong>' + U.num(r) + '%</strong> per year.</li></ol>'
    });
  }

  // =====================================================================
  // Choose a plan: pick P, r and t to reach the goal
  // =====================================================================
  function PlanQ(name) {
    this.name = name;
    this.Ps = U.shuffle([2000, 4000, 5000, 8000, 10000, 20000]).slice(0, 4).sort(function (a, b) { return a - b; });
    this.rs = [2, 3, 4, 5];
    this.ts = [{ y: 1, text: '1 year' }, { y: 2, text: '2 years' }, { y: 3, text: '3 years' }, { y: 1.5, text: '18 months' }]
      .sort(function (a, b) { return a.y - b.y; });
    var all = [], self = this;
    this.Ps.forEach(function (P) { self.rs.forEach(function (r) { self.ts.forEach(function (t) { all.push(c(P * r / 100 * t.y)); }); }); });
    all.sort(function (a, b) { return a - b; });
    this.goal = Math.round(all[Math.floor(all.length * 0.6)] / 50) * 50 || 100;
    this.pick = { P: null, r: null, t: null };
  }

  PlanQ.prototype.render = function (c) {
    var self = this;
    function group(key, label, items, text) {
      return '<p class="step-title">' + label + '</p><div class="options plan-options" data-key="' + key + '">' +
        items.map(function (it, i) { return '<button type="button" class="option" data-i="' + i + '">' + text(it) + '</button>'; }).join('') + '</div>';
    }
    c.innerHTML = '<p class="prompt">Zuri wants to earn at least <strong>' + $(this.goal) + '</strong> of interest toward the second truck. ' +
      'Help ' + this.name + ' pick a plan, then work out what it earns.</p>' +
      '<div class="goal-card">Goal: at least ' + $(this.goal) + ' of interest</div>' +
      group('P', 'Amount to save (P)', this.Ps, function (p) { return $(p); }) +
      group('r', 'Simple interest rate (r)', this.rs, function (r) { return r + '% per year'; }) +
      group('t', 'Time (t)', this.ts, function (t) { return t.text; }) +
      '<p class="step-title">Work it out</p><div class="answer-list">' +
      '<div class="answer-line"><label for="pl-r">r as a decimal</label><div class="input-row"><input id="pl-r" type="text" inputmode="decimal" autocomplete="off"></div><span class="mark" id="mark-pl-r"></span></div>' +
      '<div class="answer-line"><label for="pl-t">t in years</label><div class="input-row"><input id="pl-t" type="text" inputmode="decimal" autocomplete="off"><span class="affix">years</span></div><span class="mark" id="mark-pl-t"></span></div>' +
      '<div class="answer-line"><label for="pl-i">Interest I = P × r × t</label><div class="input-row"><span class="affix">$</span><input id="pl-i" data-money type="text" inputmode="decimal" autocomplete="off"></div><span class="mark" id="mark-pl-i"></span></div>' +
      '</div>';
    this.root = c;
    this.inputs = c.querySelectorAll('input');
    Array.prototype.forEach.call(c.querySelectorAll('.plan-options'), function (g) {
      var key = g.getAttribute('data-key');
      U.pickGroup(g.querySelectorAll('.option'), function (i) { self.pick[key] = i; });
    });
  };

  PlanQ.prototype.plan = function () {
    return { P: this.Ps[this.pick.P], r: this.rs[this.pick.r], t: this.ts[this.pick.t] };
  };

  PlanQ.prototype.check = function () {
    if (this.pick.P === null || this.pick.r === null || this.pick.t === null) return { incomplete: 'Pick an amount, a rate and a time for your plan.' };
    var read = U.readInputs(this.inputs, '0.04');
    if (read.incomplete) return read;
    var p = this.plan(), I = c(p.P * p.r / 100 * p.t.y);
    var ok = [U.same(read.values[0], p.r / 100), U.same(read.values[1], p.t.y), U.same(read.values[2], I)];
    var self = this;
    ok.forEach(function (k, i) { U.markInput(self.inputs[i], k); });
    if (ok[0] && ok[1] && ok[2]) {
      if (I < this.goal) {
        return { incomplete: 'Your math is right: this plan earns ' + $(I) + '. That’s less than the ' + $(this.goal) + ' goal. Change P, r or t, then work it out again.' };
      }
      return { ok: true, message: $(p.P) + ' × ' + U.num(p.r / 100) + ' × ' + U.num(p.t.y) + ' = ' + $(I) + ', which reaches the ' + $(this.goal) + ' goal.' };
    }
    var notes = [];
    if (!ok[0]) notes.push(U.same(read.values[0], p.r) ? 'Write the rate as a decimal: ' + p.r + '% = ' + U.num(p.r / 100) + '.' : 'Check r: ' + p.r + '% as a decimal.');
    if (!ok[1]) notes.push(U.same(read.values[1], 18) ? 'Time in YEARS: 18 months = 1.5 years.' : 'Check t in years.');
    if (!ok[2]) {
      if (U.same(read.values[2], c(p.P * p.r * p.t.y))) notes.push('Use the rate as a decimal in I = Prt.');
      else if (U.same(read.values[2], c(p.P + I))) notes.push('That’s the total. I is the interest only.');
      else notes.push('Check I = P × r × t for your plan.');
    }
    return { ok: false, message: notes.join(' ') };
  };

  PlanQ.prototype.hint = function () {
    if (this.pick.P === null || this.pick.r === null || this.pick.t === null) return '<p>Pick P, r and t, then use I = P × r × t.</p>';
    var p = this.plan();
    return '<p>I = P × r × t. For your plan: ' + $(p.P) + ' × ' + U.num(p.r / 100) + ' × ' + (p.t.y === 1.5 ? '1.5 (18 months)' : p.t.y) + '.</p>' +
      '<p>Friendly order: one year first (' + $(p.P) + ' × ' + U.num(p.r / 100) + '), then × the years.</p>';
  };

  PlanQ.prototype.solution = function () {
    if (this.pick.P === null || this.pick.r === null || this.pick.t === null) return '<p>Pick a plan, then I = P × r × t.</p>';
    var p = this.plan(), I = c(p.P * p.r / 100 * p.t.y);
    var html = '<ol><li>r = ' + p.r + '% = ' + U.num(p.r / 100) + ', t = ' + U.num(p.t.y) + ' years.</li>' +
      '<li>I = ' + $(p.P) + ' × ' + U.num(p.r / 100) + ' × ' + U.num(p.t.y) + ' = <strong>' + $(I) + '</strong>.</li>';
    if (I < this.goal) {
      var best = this.Ps[this.Ps.length - 1];
      html += '<li>That’s short of ' + $(this.goal) + '. A bigger P, r or t earns more. For example ' + $(best) + ' × 0.05 × 3 = ' + $(best * 0.15) + '.</li>';
    } else {
      html += '<li>' + $(I) + ' reaches the ' + $(this.goal) + ' goal ✓</li>';
    }
    return html + '</ol>';
  };

  PlanQ.prototype.lock = function () { U.disableAll(this.root); };

  function makeQuestion(index, nextName) {
    var name = nextName();
    if (index === 5) return new PlanQ(name);
    return [findInterest, months, total, findTime, findRate][index](name);
  }

  window.TruckFund = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'truck-fund', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
