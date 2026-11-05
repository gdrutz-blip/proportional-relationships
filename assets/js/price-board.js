/*
 * Price Board (Lesson 5: percent increase and decrease)
 * Find the new price after a percent change, the percent change from old and new,
 * the original before an increase, and what two changes in a row do.
 * Key move: change ÷ ORIGINAL. Up 20%: × 1.2. Down 30%: × 0.7.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;

  var ITEMS = ['small smoothie', 'large smoothie', 'Berry Blast', 'Mango Rush', 'Green Machine', 'fruit topping', 'bottle of juice', 'Peach Fizz'];
  // what: board label; went: "… went up from A to B"; has: "… is now X"
  var COUNTS = [
    { what: 'online followers', went: 'Zuri’s online followers', has: function (x) { return 'Zuri has ' + x + ' online followers'; }, starts: [400, 800, 1200, 1500, 2000, 2400] },
    { what: 'Green Machines a month', went: 'Monthly Green Machine sales', has: function (x) { return 'Zuri sells ' + x + ' Green Machines a month'; }, starts: [100, 200, 300, 400, 500, 600] },
    { what: 'Saturday customers', went: 'The truck’s Saturday customers', has: function (x) { return 'the truck has ' + x + ' customers on a Saturday'; }, starts: [80, 120, 160, 200, 240] }
  ];
  var UP = [10, 15, 20, 25, 50, 5, 30];
  var DOWN = [10, 15, 20, 25, 30, 40, 50];

  function mult(p, up) { return U.clean(up ? 1 + p / 100 : 1 - p / 100); }
  function isWhole(x) { return Math.abs(x - Math.round(x)) < 1e-9; }

  /** A price in cents (in 25¢ steps) where p% is a whole number of cents. */
  function priceFor(p) {
    for (;;) {
      var c = U.randInt(8, 36) * 25;
      if (isWhole(c * p / 100)) return c;
    }
  }

  function board(rows) {
    return '<div class="menu-board" aria-label="Price board">' + rows.map(function (r) {
      return '<div class="mb-row"><span>' + r[0] + '</span><span class="mb-price">' + r[1] + '</span></div>';
    }).join('') + '</div>';
  }

  /** Bar picture on a double number line: amount on top, percent below. */
  function bar(o) {
    var max = Math.max(100, o.hi);
    var pts = [{ p: 0, top: o.zero, bottom: '0%' }];
    o.marks.forEach(function (m) { pts.push({ p: m.pct / max, top: m.top, bottom: m.pct + '%' }); });
    return U.numberLine({
      points: pts,
      segments: o.segments.map(function (s) { return { from: s.from / max, to: s.to / max, text: s.text, cls: s.cls }; }),
      label: o.label, caption: 'Top: the amount. Bottom: the percent.'
    });
  }

  // ---------- Question types ----------
  function newAmount(name, up) {
    var p = U.pick(up ? UP : DOWN);
    var item = U.pick(ITEMS);
    var old = priceFor(p) / 100;
    var m = mult(p, up);
    var answer = U.clean(old * m);
    var change = U.clean(old * p / 100);
    var word = up ? 'raises' : 'lowers';
    var left = up ? 100 + p : 100 - p;
    return new U.StepQuestion({
      prompt: name + ' is updating the price board. Zuri ' + word + ' the price of a ' + item + ' by ' + p + '%. ' + U.pick(['What is the new price?', 'What does it cost now?']),
      before: board([[item + (up ? '' : ' (sale)'), U.money(old) + ' → ?']]),
      steps: [
        { label: 'Multiplier', prefix: '×', answer: m,
          mistakes: [
            { value: p / 100, msg: up ? 'Keep the 100% too: 100% + ' + p + '% = ' + left + '%, so × ' + U.num(m) + '.' : 'Down ' + p + '% is × ' + U.num(m) + ', not × ' + U.num(p / 100) + ': ' + left + '% is left.' },
            { value: p, msg: 'Write the multiplier as a decimal: ' + left + '% = ' + U.num(m) + '.' },
            { value: left, msg: 'Write the multiplier as a decimal: ' + left + '% = ' + U.num(m) + '.' }
          ] },
        { label: 'New price', money: true, answer: answer,
          mistakes: [
            { value: change, msg: U.money(change) + ' is the ' + (up ? 'increase' : 'amount taken off') + ', not the new price.' },
            { value: U.clean(old + (up ? 1 : -1) * p / 100), msg: p + '% is not ' + p + ' cents. Find ' + p + '% OF the price.' },
            { value: U.clean(old * (up ? 1 - p / 100 : 1 + p / 100)), msg: 'Check the direction: the price went ' + (up ? 'up' : 'down') + '.' }
          ] }
      ],
      success: U.money(old) + ' × ' + U.num(m) + ' = ' + U.money(answer) + '.',
      hint: '<p>' + (up ? 'Up ' + p + '%: you keep all of it (100%) and add ' + p + '% more. 100% + ' + p + '% = ' + left + '%.' :
        'Down ' + p + '%: ' + p + '% comes off, so 100% − ' + p + '% = ' + left + '% is left.') +
        ' Write ' + left + '% as a decimal for the multiplier.</p>' +
        bar({ hi: Math.max(100, left), zero: '$0', label: 'Bar from 0% to ' + Math.max(100, left) + '%',
          marks: up ? [{ pct: 100, top: U.money(old) }, { pct: left, top: '?' }] : [{ pct: left, top: '?' }, { pct: 100, top: U.money(old) }],
          segments: up ? [{ from: 0, to: 100, text: '100%', cls: 't10' }, { from: 100, to: left, text: '+' + p + '%', cls: 't25' }] :
            [{ from: 0, to: left, text: left + '% left', cls: 't10' }, { from: left, to: 100, text: '−' + p + '%', cls: 't1' }] }),
      solution: '<ol><li>' + (up ? '100% + ' + p + '% = ' : '100% − ' + p + '% = ') + left + '%, so the multiplier is × ' + U.num(m) + '.</li>' +
        '<li>' + U.money(old) + ' × ' + U.num(m) + ' = <strong>' + U.money(answer) + '</strong></li>' +
        '<li>Check: ' + p + '% of ' + U.money(old) + ' is ' + U.money(change) + ', and ' + U.money(old) + (up ? ' + ' : ' − ') + U.money(change) + ' = ' + U.money(answer) + ' ✓</li></ol>'
    });
  }

  function percentChange(name, up) {
    var p = U.pick(up ? [10, 20, 25, 50, 5, 15, 30] : [10, 20, 25, 30, 40, 50]);
    var useCount = Math.random() < 0.5;
    var old, neu, fmt, prompt, before;
    if (useCount) {
      var ctx = U.pick(COUNTS);
      var starts = ctx.starts.filter(function (s) { return isWhole(s * p / 100); });
      old = U.pick(starts);
      neu = U.clean(old * mult(p, up));
      fmt = U.num;
      prompt = ctx.went + ' went ' + (up ? 'up' : 'down') + ' from ' + old + ' to ' + neu + '. What is the percent ' + (up ? 'increase' : 'decrease') + '?';
      before = board([[ctx.what + ': before', String(old)], [ctx.what + ': now', String(neu)]]);
    } else {
      var item = U.pick(ITEMS);
      old = priceFor(p) / 100;
      neu = U.clean(old * mult(p, up));
      fmt = U.money;
      prompt = name + ' notices the price of a ' + item + ' went from ' + U.money(old) + ' to ' + U.money(neu) + '. What is the percent ' + (up ? 'increase' : 'decrease') + '?';
      before = board([[item + ': old price', U.money(old)], [item + ': new price', U.money(neu)]]);
    }
    var change = U.clean(Math.abs(neu - old));
    var wrongPct = U.clean(change / neu * 100);
    return new U.StepQuestion({
      prompt: prompt, before: before,
      steps: [
        { label: 'Change', money: !useCount, answer: change },
        { label: 'Percent ' + (up ? 'increase' : 'decrease'), pct: true, answer: p, accept: [p / 100],
          mistakes: [{ value: wrongPct, near: 0.01, msg: 'Divide by the ORIGINAL (the starting amount), not the new amount.' },
            { value: U.clean(change / old), msg: 'Change ÷ original = ' + U.num(change / old) + '. Now × 100% to write it as a percent.' }] }
      ],
      success: fmt(change) + ' ÷ ' + fmt(old) + ' = ' + U.num(p / 100) + ' = ' + p + '% ' + (up ? 'increase' : 'decrease') + '.',
      hint: '<p>Percent change = change ÷ <strong>ORIGINAL</strong> × 100%. The original is where it started: ' + fmt(old) + '.</p>' +
        '<p>First find the change: ' + fmt(Math.max(old, neu)) + ' − ' + fmt(Math.min(old, neu)) + '. Then divide by ' + fmt(old) + '.</p>',
      solution: '<ol><li>Change: ' + fmt(Math.max(old, neu)) + ' − ' + fmt(Math.min(old, neu)) + ' = ' + fmt(change) + '.</li>' +
        '<li>' + fmt(change) + ' ÷ ' + fmt(old) + ' (the ORIGINAL) = ' + U.num(p / 100) + '.</li>' +
        '<li>' + U.num(p / 100) + ' × 100% = <strong>' + p + '% ' + (up ? 'increase' : 'decrease') + '</strong></li></ol>'
    });
  }

  function original() {
    var p = U.pick([10, 20, 25, 50]);
    var useCount = Math.random() < 0.5;
    var orig, fmt, prompt, what, ctx;
    if (useCount) {
      ctx = U.pick(COUNTS);
      orig = U.pick(ctx.starts.filter(function (s) { return isWhole(s * p / 100); }));
      fmt = U.num;
      what = ctx.what;
    } else {
      orig = priceFor(p) / 100;
      fmt = U.money;
      what = 'the price of a ' + U.pick(ITEMS);
    }
    var after = U.clean(orig * (1 + p / 100));
    var piece = U.clean(orig * p / 100);
    var total = 100 + p, lots = total / p;
    prompt = useCount ? 'After a ' + p + '% increase, ' + ctx.has(after) + '. How many were there before the increase?' :
      'After a ' + p + '% increase, ' + what + ' is ' + fmt(after) + '. What was it before the increase?';
    return new U.StepQuestion({
      prompt: prompt,
      before: board([[what + ', after +' + p + '%', fmt(after)], [what + ', before', '?']]),
      steps: [
        { label: total + '% = ' + fmt(after) + ', so ' + p + '% =', money: !useCount, answer: piece },
        { label: 'Before the increase (100%)', money: !useCount, answer: orig,
          mistakes: [{ value: U.clean(after * (1 - p / 100)), msg: 'Taking ' + p + '% off ' + fmt(after) + ' doesn’t undo it: the ' + p + '% was ' + p + '% of the ORIGINAL, not of ' + fmt(after) + '.' }] }
      ],
      success: total + '% = ' + fmt(after) + ', so ' + p + '% = ' + fmt(piece) + ', so 100% = ' + fmt(orig) + '.',
      hint: '<p>' + fmt(after) + ' is not 100%. It is <strong>' + total + '%</strong> (100% + ' + p + '%).</p>' +
        '<p>' + total + '% is ' + lots + ' lots of ' + p + '%. Find ' + p + '% first, then build 100%.</p>' +
        bar({ hi: total, zero: useCount ? '0' : '$0', label: 'Bar: ' + total + '% is ' + fmt(after),
          marks: [{ pct: 100, top: '?' }, { pct: total, top: fmt(after) }],
          segments: [{ from: 0, to: 100, text: '100%', cls: 't10' }, { from: 100, to: total, text: '+' + p + '%', cls: 't25' }] }),
      solution: '<ol><li>' + total + '% = ' + fmt(after) + '.</li><li>' + p + '%: ' + fmt(after) + ' ÷ ' + lots + ' = ' + fmt(piece) + '.</li>' +
        '<li>100%: ' + fmt(piece) + ' × ' + (100 / p) + ' = <strong>' + fmt(orig) + '</strong></li>' +
        '<li>Check: ' + fmt(orig) + ' × ' + U.num(1 + p / 100) + ' = ' + fmt(after) + ' ✓</li></ol>'
    });
  }

  function twoChanges() {
    var p = U.pick([10, 20, 25, 50]);
    var upFirst = Math.random() < 0.5;
    var start;
    do { start = U.pick([4, 5, 6, 8, 10]); }
    while (!isWhole(start * (100 + p) * (100 - p) / 100)); // final price in exact cents
    var m1 = mult(p, upFirst), m2 = mult(p, !upFirst);
    var mid = U.clean(start * m1), end = U.clean(mid * m2);
    var item = U.pick(ITEMS);
    var w1 = upFirst ? 'up' : 'down', w2 = upFirst ? 'down' : 'up';
    return new U.StepQuestion({
      prompt: U.an(item).replace(/^a/, 'A') + ' costs ' + U.money(start) + '. Zuri moves the price ' + w1 + ' ' + p + '%. A month later she moves the new price ' + w2 + ' ' + p + '%. What is the final price?',
      before: board([[item, U.money(start) + ' → ? → ?']]),
      steps: [
        { label: 'After going ' + w1 + ' ' + p + '%', money: true, answer: mid },
        { label: 'After going ' + w2 + ' ' + p + '%', money: true, answer: end,
          mistakes: [{ value: start, msg: 'Two changes don’t just cancel out. The second ' + p + '% is ' + p + '% of the NEW price, ' + U.money(mid) + '.' },
            { value: U.clean(mid + (upFirst ? -1 : 1) * start * p / 100), msg: 'The second ' + p + '% is of the NEW price, ' + U.money(mid) + ', not the first price.' }] }
      ],
      success: U.money(start) + ' → ' + U.money(mid) + ' → ' + U.money(end) + '. It does not end at ' + U.money(start) + ', because the second ' + p + '% is of a different amount.',
      hint: '<p>One change at a time. First ' + U.money(start) + ' × ' + U.num(m1) + '.</p>' +
        '<p>Then the second change is a percent of the <strong>NEW</strong> price, so multiply your new price by ' + U.num(m2) + '.</p>',
      solution: '<ol><li>' + w1 + ' ' + p + '%: ' + U.money(start) + ' × ' + U.num(m1) + ' = ' + U.money(mid) + '.</li>' +
        '<li>' + w2 + ' ' + p + '%: ' + U.money(mid) + ' × ' + U.num(m2) + ' = <strong>' + U.money(end) + '</strong>.</li>' +
        '<li>It ends ' + (end < start ? 'lower' : 'higher') + ' than ' + U.money(start) + ': ' + p + '% of ' + U.money(Math.max(start, mid)) + ' is more than ' + p + '% of ' + U.money(Math.min(start, mid)) + '.</li></ol>'
    });
  }

  function makeQuestion(index, nextName) {
    var name = nextName();
    if (index === 0) return newAmount(name, true);
    if (index === 1) return newAmount(name, false);
    if (index === 2) return percentChange(name, true);
    if (index === 3) return percentChange(name, false);
    if (index === 4) return original();
    return twoChanges();
  }

  window.PriceBoard = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'price-board', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
