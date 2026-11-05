/*
 * Checkout (Lesson 6: discount, tax and tip)
 * A receipt that builds one line at a time: discount, then HST, then tip, then rounding.
 * Key move: discount first, then tax (× 1.13). Round at the end.
 * As in the Unit 3 lessons, the tip is a percent of the food price BEFORE tax.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;
  var HST = 1.13;

  var STORE_ITEMS = ['blender', 'cooler', 'cutting board', 'juicer', 'apron set', 'crew T-shirt', 'knife set', 'scale'];
  var PRICES = [20, 30, 40, 45, 50, 60, 80, 90, 100, 120, 150];
  var DISCOUNTS = [10, 15, 20, 25, 30, 40, 50];
  var TIPS = [10, 15, 18, 20];
  var FOODS = [20, 24, 30, 36, 40, 48, 50, 60, 80];

  function isWhole(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function c(x) { return U.clean(x); }
  var $ = U.money;

  /** A price and discount where the sale price is whole dollars (friendly without a calculator). */
  function pickSale() {
    for (;;) {
      var P = U.pick(PRICES), d = U.pick(DISCOUNTS);
      if (isWhole(P * (100 - d) / 100)) return { P: P, d: d, sale: c(P * (100 - d) / 100) };
    }
  }

  // Mistakes the teacher guide lists, reused on several receipts.
  function saleMistakes(P, d) {
    return [
      { value: c(P * d / 100), msg: $(P * d / 100) + ' is the discount, not the sale price. ' + d + '% off means you pay the ' + (100 - d) + '% that is left.' },
      { value: c(P * (100 + d) / 100), msg: 'A discount takes money OFF the price.' }
    ];
  }
  function taxMistakes(base, P, d) {
    var m = [
      { value: c(base + 0.13), msg: '13% is not 13 cents. Multiply by 1.13.' },
      { value: c(base * 0.13), msg: $(base * 0.13) + ' is just the tax. Add it on: × 1.13.' }
    ];
    if (P != null) {
      m.push({ value: c(P * HST), msg: 'Take the discount FIRST, then tax the sale price.' });
      m.push({ value: c(P * (1 - d / 100 + 0.13)), msg: 'Never add or subtract the percents. Do the discount, then the tax.' });
    }
    return m;
  }

  // ---------- Receipts ----------
  function discountTax(name) {
    var s = pickSale(), item = U.pick(STORE_ITEMS), total = c(s.sale * HST);
    return new U.StepQuestion({
      layout: 'receipt', title: 'Truck Supply Co.',
      prompt: name + ' buys ' + U.an(item) + ' for the truck. It costs ' + U.dollars(s.P) + ', but it is ' + s.d + '% off. Then 13% HST is added. Fill in the receipt.',
      steps: [
        { label: item, money: true, given: s.P },
        { label: 'Sale price (' + s.d + '% off)', money: true, answer: s.sale, mistakes: saleMistakes(s.P, s.d) },
        { label: 'Total with 13% HST (× 1.13)', money: true, answer: total, mistakes: taxMistakes(s.sale, s.P, s.d) }
      ],
      success: $(s.P) + ' × ' + U.num(1 - s.d / 100) + ' = ' + $(s.sale) + ', then ' + $(s.sale) + ' × 1.13 = ' + $(total) + '.',
      hint: '<p><strong>Discount first.</strong> ' + s.d + '% off leaves 100% − ' + s.d + '% = ' + (100 - s.d) + '%, so × ' + U.num(1 - s.d / 100) + '.</p>' +
        '<p><strong>Then tax the sale price:</strong> × 1.13. (Tip: × 1.13 is the price + 10% + 3%.)</p>',
      solution: '<ol><li>Sale price: ' + $(s.P) + ' × ' + U.num(1 - s.d / 100) + ' = ' + $(s.sale) + '.</li>' +
        '<li>With HST: ' + $(s.sale) + ' × 1.13 = <strong>' + $(total) + '</strong>.</li>' +
        '<li>Check: 13% of ' + $(s.sale) + ' is ' + $(s.sale * 0.13) + ', and ' + $(s.sale) + ' + ' + $(s.sale * 0.13) + ' = ' + $(total) + ' ✓</li></ol>'
    });
  }

  function taxTip(name) {
    var F = U.pick(FOODS), t = U.pick(TIPS);
    var withTax = c(F * HST), tip = c(F * t / 100), total = c(withTax + tip);
    var where = U.pick([name + ' takes the crew to lunch. The food is ' + U.dollars(F) + '.',
      'A family orders smoothies for ' + U.dollars(F) + ' and leaves a tip.']);
    return new U.StepQuestion({
      layout: 'receipt', title: 'Receipt',
      prompt: where + ' Add 13% HST. The tip is ' + t + '% of the food price before tax. Fill in the receipt.',
      steps: [
        { label: 'Food', money: true, given: F },
        { label: 'Food with 13% HST (× 1.13)', money: true, answer: withTax, mistakes: taxMistakes(F) },
        { label: 'Tip: ' + t + '% of the food before tax', money: true, answer: tip,
          mistakes: [{ value: c(withTax * t / 100), near: 0.005, msg: 'The tip is ' + t + '% of the food BEFORE tax (' + $(F) + '), not the bill with tax.' }] },
        { label: 'Total', money: true, answer: total,
          mistakes: [{ value: c(F + tip), msg: 'Use the bill WITH tax, then add the tip.' }] }
      ],
      success: $(withTax) + ' + ' + $(tip) + ' tip = ' + $(total) + '.',
      hint: '<p>Tax: × 1.13. Tip: find ' + t + '% of ' + $(F) + ' with benchmarks (' + tipBench(t) + ').</p><p>The total is the bill with tax plus the tip.</p>',
      solution: '<ol><li>With HST: ' + $(F) + ' × 1.13 = ' + $(withTax) + '.</li>' +
        '<li>Tip: ' + t + '% of ' + $(F) + ' = ' + $(tip) + ' (' + tipBench(t) + ').</li>' +
        '<li>Total: ' + $(withTax) + ' + ' + $(tip) + ' = <strong>' + $(total) + '</strong>.</li></ol>'
    });
  }

  function tipBench(t) {
    return { 10: '10% = ÷ 10', 15: '15% = 10% + 5%', 18: '18% = 10% + 5% + 3 × 1%', 20: '20% = 2 × 10%' }[t];
  }

  function fullReceipt(name) {
    var s;
    do { s = pickSale(); } while (s.P > 100);
    var t = U.pick(TIPS), onOriginal = Math.random() < 0.4;
    var withTax = c(s.sale * HST), base = onOriginal ? s.P : s.sale, tip = c(base * t / 100), total = c(withTax + tip);
    var other = onOriginal ? s.sale : s.P;
    return new U.StepQuestion({
      layout: 'receipt', title: 'Festival Food Court',
      prompt: name + '’s crew orders a meal for ' + U.dollars(s.P) + ' and has a ' + s.d + '%-off coupon. Then 13% HST is added. The tip is ' + t + '% of the ' +
        (onOriginal ? '<strong>ORIGINAL</strong> food price (before the coupon and before tax).' : 'food price after the coupon, before tax.'),
      steps: [
        { label: 'Food', money: true, given: s.P },
        { label: 'After the coupon (' + s.d + '% off)', money: true, answer: s.sale, mistakes: saleMistakes(s.P, s.d) },
        { label: 'With 13% HST (× 1.13)', money: true, answer: withTax, mistakes: taxMistakes(s.sale, s.P, s.d) },
        { label: 'Tip: ' + t + '% of ' + (onOriginal ? 'the ORIGINAL food' : 'the food after the coupon'), money: true, answer: tip,
          mistakes: [{ value: c(other * t / 100), msg: 'Read the tip line again: ' + t + '% of ' + (onOriginal ? 'the ORIGINAL ' + $(s.P) : 'the coupon price ' + $(s.sale)) + '.' },
            { value: c(withTax * t / 100), near: 0.005, msg: 'The tip is on the food BEFORE tax.' }] },
        { label: 'Total', money: true, answer: total }
      ],
      success: 'Coupon, then tax, then tip: ' + $(s.sale) + ' → ' + $(withTax) + ' → ' + $(total) + '.',
      hint: '<p>One line at a time, in order: <strong>discount, then tax (× 1.13), then tip, then add</strong>.</p>' +
        '<p>The tip is ' + t + '% of ' + (onOriginal ? 'the ORIGINAL ' + $(s.P) : $(s.sale)) + ' (' + tipBench(t) + ').</p>',
      solution: '<ol><li>Coupon: ' + $(s.P) + ' × ' + U.num(1 - s.d / 100) + ' = ' + $(s.sale) + '.</li>' +
        '<li>HST: ' + $(s.sale) + ' × 1.13 = ' + $(withTax) + '.</li>' +
        '<li>Tip: ' + t + '% of ' + $(base) + ' = ' + $(tip) + '.</li>' +
        '<li>Total: ' + $(withTax) + ' + ' + $(tip) + ' = <strong>' + $(total) + '</strong>.</li></ol>'
    });
  }

  function percentOffOrOriginal(name) {
    var s = pickSale(), item = U.pick(STORE_ITEMS);
    var off = c(s.P - s.sale);
    if (Math.random() < 0.5) {
      return new U.StepQuestion({
        prompt: U.an(item).replace(/^a/, 'A') + ' that costs ' + U.dollars(s.P) + ' is on sale for ' + U.dollars(s.sale) + '. What percent off is that?',
        steps: [
          { label: 'Savings', money: true, answer: off },
          { label: 'Percent off', pct: true, answer: s.d, accept: [s.d / 100],
            mistakes: [{ value: c(off / s.sale * 100), near: 0.01, msg: 'Divide the savings by the ORIGINAL price, ' + $(s.P) + ', not the sale price.' },
              { value: 100 - s.d, msg: (100 - s.d) + '% is the part you pay. The percent OFF is the part you save.' }] }
        ],
        success: $(off) + ' ÷ ' + $(s.P) + ' = ' + U.num(s.d / 100) + ' = ' + s.d + '% off.',
        hint: '<p>Percent off = savings ÷ <strong>ORIGINAL</strong> price. The savings is ' + $(s.P) + ' − ' + $(s.sale) + '.</p>',
        solution: '<ol><li>Savings: ' + $(s.P) + ' − ' + $(s.sale) + ' = ' + $(off) + '.</li>' +
          '<li>' + $(off) + ' ÷ ' + $(s.P) + ' = ' + U.num(s.d / 100) + ' = <strong>' + s.d + '% off</strong>.</li></ol>'
      });
    }
    while (s.d === 50) s = pickSale(); // "50% = $x, so 50% = ?" would be a step with nothing to do
    var left = 100 - s.d, piece = c(s.P * s.d / 100);
    var unitPct = U.gcd(left, s.d), unitVal = c(s.P * unitPct / 100);
    return new U.StepQuestion({
      prompt: 'After ' + s.d + '% off, ' + name + ' pays ' + U.dollars(s.sale) + ' for ' + U.an(item) + '. What was the original price?',
      steps: [
        { label: left + '% = ' + $(s.sale) + ', so ' + unitPct + '% =', money: true, answer: unitVal },
        { label: 'Original price (100%)', money: true, answer: s.P,
          mistakes: [{ value: c(s.sale * (1 + s.d / 100)), msg: 'Adding ' + s.d + '% back on doesn’t undo it: the ' + s.d + '% was ' + s.d + '% of the ORIGINAL, not of ' + $(s.sale) + '.' }] }
      ],
      success: left + '% = ' + $(s.sale) + ', so ' + unitPct + '% = ' + $(unitVal) + ', so 100% = ' + $(s.P) + '.',
      hint: '<p>You paid the ' + left + '% that was left, so <strong>' + left + '% = ' + $(s.sale) + '</strong>.</p>' +
        '<p>Work back to ' + unitPct + '% (÷ ' + (left / unitPct) + '), then build 100% (× ' + (100 / unitPct) + ').</p>',
      solution: '<ol><li>' + s.d + '% off leaves ' + left + '%: ' + left + '% = ' + $(s.sale) + '.</li>' +
        '<li>' + unitPct + '%: ' + $(s.sale) + ' ÷ ' + (left / unitPct) + ' = ' + $(unitVal) + '.</li>' +
        '<li>100%: ' + $(unitVal) + ' × ' + (100 / unitPct) + ' = <strong>' + $(s.P) + '</strong>.</li>' +
        '<li>Check: ' + $(s.P) + ' × ' + U.num(left / 100) + ' = ' + $(s.sale) + ' ✓ (' + $(piece) + ' off)</li></ol>'
    });
  }

  function rounding(name) {
    var dollars = U.pick([10, 15, 20, 25, 30, 40]);
    var price = c(dollars - 0.01);                       // $19.99
    var exact = c(price * HST);                          // 22.5887
    var rounded = Math.round(c(exact * 100)) / 100;      // 22.59
    var item = U.pick(['thermometer', 'set of measuring cups', 'water jug', 'cash box', 'ice scoop']);
    return new U.StepQuestion({
      layout: 'receipt', title: 'Truck Supply Co.',
      prompt: name + ' buys ' + U.an(item) + ' for ' + $(price) + ' plus 13% HST. Fill in the receipt. Round only at the end.',
      steps: [
        { label: item, money: true, given: price },
        { label: 'Price × 1.13 (don’t round yet)', answer: exact, prefix: '$',
          mistakes: [{ value: rounded, msg: 'Don’t round yet. Keep every digit until the last line.' },
            { value: c(price + 0.13), msg: '13% is not 13 cents. Multiply by 1.13.' }],
          wrong: 'Check the price × 1.13. Hint: ' + $(price) + ' is ' + $(dollars) + ' − $0.01.' },
        { label: 'Total, rounded to the nearest cent', money: true, answer: rounded,
          mistakes: [{ value: Math.floor(c(exact * 100)) / 100, msg: 'Look at the third decimal place: ' + exact + '. 5 or more rounds up.' }] }
      ],
      success: $(price) + ' × 1.13 = ' + exact + ' → ' + $(rounded) + '.',
      hint: '<p>A friendly way without a calculator: ' + $(price) + ' = ' + $(dollars) + ' − $0.01.</p>' +
        '<p>' + $(dollars) + ' × 1.13 = ' + $(dollars * HST) + ', and $0.01 × 1.13 = $0.0113. Subtract. Then round to the nearest cent at the very end.</p>',
      solution: '<ol><li>' + $(dollars) + ' × 1.13 = ' + $(dollars * HST) + '.</li>' +
        '<li>$0.01 × 1.13 = 0.0113, so ' + $(price) + ' × 1.13 = ' + U.num(dollars * HST) + ' − 0.0113 = ' + exact + '.</li>' +
        '<li>Round at the end: ' + exact + ' → <strong>' + $(rounded) + '</strong>.</li></ol>'
    });
  }

  function makeQuestion(index, nextName) {
    var name = nextName();
    return [discountTax, discountTax, taxTip, fullReceipt, percentOffOrOriginal, rounding][index](name);
  }

  window.Checkout = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'checkout', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
