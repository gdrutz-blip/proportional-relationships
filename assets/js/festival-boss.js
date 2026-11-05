/*
 * Festival Weekend Boss (Lesson 8: multi-step rate and percent problems)
 * Mixed problems that use every tool from the unit. For each step, students pick
 * the tool (the Toolkit's "Which tool?" table), then do that step.
 * Key move: one tool per step, in order. Check the answer makes sense.
 * Problems are modelled on the Unit 3 test Boss question and the Lesson 8 handout.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 5;
  var $ = U.dollars;
  function c(x) { return U.clean(x); }
  function whole(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function cents(x) { return whole(x * 100); }

  var RATE = ['Unit rate', 'Proportion'];

  /** Builds a boss problem: every step gets a tool picker. */
  function boss(o) {
    o.steps.forEach(function (st) { if (st.given == null && !st.tools) throw new Error('step needs tools'); });
    o.hint = '<p><strong>Plan first.</strong> One tool per step, in order. Clue words:</p><ul>' +
      o.steps.map(function (st, i) { return '<li>Step ' + (i + 1) + ': ' + st.clue + '</li>'; }).join('') + '</ul>' + (o.hint || '');
    return new U.StepQuestion(o);
  }
  function tools(st) { return ' <span class="tool-tag">' + st.tools[0] + '</span>'; }

  // ---------- 1. Festival sales (like the test Boss) ----------
  function festivalSales(name) {
    for (;;) {
      var N = U.pick([200, 300, 400, 500, 600]), price = U.pick([4, 5, 6]), f = U.pick([10, 15, 20, 25]);
      var cost = U.pick([1.2, 1.5, 1.8, 2]);
      var sales = N * price, keep = c(sales * (1 - f / 100)), costs = c(N * cost), profit = c(keep - costs);
      if (profit <= 0) continue;
      var st = [
        { label: 'a) Total sales', money: true, answer: sales, tools: RATE, clue: '“' + $(price) + ' each” is a rate: × the number sold.' },
        { label: 'b) What she keeps after the festival’s ' + f + '%', money: true, answer: keep, tools: ['Percent of a number', 'Discount, tax or tip'],
          clue: '“' + f + '% of her sales”: she keeps the other ' + (100 - f) + '%.',
          mistakes: [{ value: c(sales * f / 100), msg: 'b) ' + $(sales * f / 100) + ' is the festival’s share. She keeps the rest.' }] },
        { label: 'c) Her total costs', money: true, answer: costs, tools: RATE, clue: '“' + U.money(cost) + ' per smoothie” is a rate.' },
        { label: 'd) Her profit', money: true, answer: profit, tools: ['Add or subtract'], clue: 'profit = what she keeps − costs.',
          mistakes: [{ value: c(sales - costs), msg: 'd) Start from what she keeps AFTER the festival’s cut, not the total sales.' }] }
      ];
      return boss({
        prompt: 'At the Festival Weekend, Zuri sells ' + N + ' smoothies for ' + $(price) + ' each. The festival takes ' + f + '% of her sales. Her costs are ' +
          U.money(cost) + ' per smoothie.',
        steps: st,
        success: 'Sales ' + $(sales) + ' → keeps ' + $(keep) + ' → minus ' + $(costs) + ' costs = ' + $(profit) + ' profit.',
        solution: '<ol><li>' + N + ' × ' + $(price) + ' = ' + $(sales) + tools(st[0]) + '</li>' +
          '<li>' + $(sales) + ' × ' + U.num(1 - f / 100) + ' = ' + $(keep) + tools(st[1]) + '</li>' +
          '<li>' + N + ' × ' + U.money(cost) + ' = ' + $(costs) + tools(st[2]) + '</li>' +
          '<li>' + $(keep) + ' − ' + $(costs) + ' = <strong>' + $(profit) + '</strong>' + tools(st[3]) + '</li>' +
          '<li>Check it makes sense: the profit is less than what she keeps ✓</li></ol>'
      });
    }
  }

  // ---------- 2. Blender speed ----------
  function blender(name) {
    for (;;) {
      var r0 = U.pick([2, 3, 4, 5, 6]), t = U.pick([10, 12, 15, 20]), s = U.pick([10, 20, 25, 50]);
      var n = r0 * t, r1 = c(r0 * (1 + s / 100)), hour = c(r1 * 60);
      if (!whole(hour)) continue;
      var st = [
        { label: 'a) Smoothies per minute now', answer: r0, unit: 'per minute', tools: ['Unit rate'], clue: '“per minute”: divide by the minutes.',
          mistakes: [{ value: c(t / n), msg: 'a) You divided the other way. Smoothies per minute: ' + n + ' ÷ ' + t + '.' }] },
        { label: 'b) Smoothies per minute after the upgrade', answer: r1, unit: 'per minute', tools: ['Percent change', 'Percent of a number'],
          clue: '“' + s + '% faster” is an increase: × ' + U.num(1 + s / 100) + '.',
          mistakes: [{ value: c(r0 * s / 100), msg: 'b) That’s just the increase. Add it on, or × ' + U.num(1 + s / 100) + '.' },
            { value: c(r0 + s / 100), msg: 'b) ' + s + '% is not ' + U.num(s / 100) + ' smoothies. Find ' + s + '% OF ' + r0 + '.' }] },
        { label: 'c) Smoothies in 1 hour with the new blender', answer: hour, tools: RATE, clue: '1 hour = 60 minutes, at the new rate.',
          mistakes: [{ value: r0 * 60, msg: 'c) Use the NEW rate from b).' }] }
      ];
      return boss({
        prompt: name + '’s blender makes ' + n + ' smoothies in ' + t + ' minutes. For the festival, Zuri upgrades it so it is ' + s +
          '% faster. How many smoothies can it make in 1 hour?',
        steps: st,
        success: n + ' ÷ ' + t + ' = ' + r0 + ' per minute → × ' + U.num(1 + s / 100) + ' = ' + U.num(r1) + ' per minute → × 60 = ' + hour + '.',
        hint: '<p>Rate first, then the percent (that’s the order in the Lesson 8 handout).</p>',
        solution: '<ol><li>' + n + ' ÷ ' + t + ' = ' + r0 + ' per minute' + tools(st[0]) + '</li>' +
          '<li>' + r0 + ' × ' + U.num(1 + s / 100) + ' = ' + U.num(r1) + ' per minute' + tools(st[1]) + '</li>' +
          '<li>' + U.num(r1) + ' × 60 = <strong>' + hour + ' smoothies</strong>' + tools(st[2]) + '</li></ol>'
      });
    }
  }

  // ---------- 3. Best buy on sale ----------
  function saleBag() {
    for (;;) {
      var W = U.pick([2, 4, 5]), pk = U.randInt(6, 16) * 50, d = U.pick([10, 20, 25, 50]);
      var sale = c(pk * W / 100), P = c(sale / (1 - d / 100)), X = U.pick([3, 6, 10, 12]);
      if (!whole(sale) || !whole(P)) continue;
      var item = U.pick(['frozen mango', 'frozen berries', 'bananas', 'spinach']);
      var perkg = c(pk / 100), order = c(perkg * X);
      var st = [
        { label: 'a) Sale price of the bag', money: true, answer: sale, tools: ['Discount, tax or tip'], clue: '“' + d + '% off” is a discount.',
          mistakes: [{ value: c(P * d / 100), msg: 'a) That’s the discount, not the sale price.' }] },
        { label: 'b) Sale price per kg', money: true, answer: perkg, tools: ['Unit rate'], clue: '“per kg”: divide by the kilograms.',
          mistakes: [{ value: c(P / W), msg: 'b) Use the SALE price from a), not the old price.' }, { value: c(W / sale), msg: 'b) You divided the other way. Dollars per kg: price ÷ kg.' }] },
        { label: 'c) Cost of ' + X + ' kg at the sale price', money: true, answer: order, tools: RATE, clue: 'use the price per kg: × ' + X + '.' }
      ];
      return boss({
        prompt: 'A ' + W + ' kg bag of ' + item + ' costs ' + $(P) + '. This weekend it is ' + d + '% off. Zuri needs ' + X + ' kg for the festival.',
        steps: st,
        success: $(P) + ' × ' + U.num(1 - d / 100) + ' = ' + $(sale) + ', ÷ ' + W + ' = ' + U.money(perkg) + ' per kg, × ' + X + ' = ' + U.money(order) + '.',
        hint: '<p>Discount first, then the unit price (Lesson 8: “best buy on sale”).</p>',
        solution: '<ol><li>' + $(P) + ' × ' + U.num(1 - d / 100) + ' = ' + $(sale) + tools(st[0]) + '</li>' +
          '<li>' + $(sale) + ' ÷ ' + W + ' = ' + U.money(perkg) + ' per kg' + tools(st[1]) + '</li>' +
          '<li>' + U.money(perkg) + ' × ' + X + ' = <strong>' + U.money(order) + '</strong>' + tools(st[2]) + '</li></ol>'
      });
    }
  }

  // ---------- 4. Gas for the trip ----------
  function gasTrip() {
    for (;;) {
      var D = U.pick([200, 250, 300, 360, 400, 450, 500]), g = U.pick([8, 9, 10, 12]), price = U.pick([1.4, 1.5, 1.6, 1.8]);
      var up = U.pick([10, 20, 25]);
      var L = c(D / 100 * g), cost = c(L * price), later = c(cost * (1 + up / 100));
      if (!cents(cost) || !cents(later)) continue;
      var st = [
        { label: 'a) Litres of gas for the trip', answer: L, unit: 'L', tools: ['Proportion', 'Unit rate'],
          clue: '“' + g + ' L per 100 km”: how many lots of 100 km?',
          mistakes: [{ value: c(D / g), msg: 'a) You divided by ' + g + '. ' + D + ' km is ' + U.num(D / 100) + ' lots of 100 km: ' + U.num(D / 100) + ' × ' + g + '.' }] },
        { label: 'b) Cost of the gas', money: true, answer: cost, tools: ['Unit rate', 'Proportion'], clue: '“' + U.money(price) + ' per litre”: × the litres.' },
        { label: 'c) Cost if gas goes up ' + up + '%', money: true, answer: later, tools: ['Percent change', 'Percent of a number'], clue: '“up ' + up + '%”: × ' + U.num(1 + up / 100) + '.',
          mistakes: [{ value: c(cost * up / 100), msg: 'c) That’s just the increase. Add it on.' }] }
      ];
      return boss({
        prompt: 'Zuri drives ' + D + ' km to the festival. Her truck uses ' + g + ' L of gas per 100 km. Gas costs ' + U.money(price) + ' per litre.',
        steps: st,
        success: U.num(D / 100) + ' × ' + g + ' = ' + U.num(L) + ' L, × ' + U.money(price) + ' = ' + U.money(cost) + ', then × ' + U.num(1 + up / 100) + ' = ' + U.money(later) + '.',
        solution: '<ol><li>' + D + ' km = ' + U.num(D / 100) + ' × 100 km, so ' + U.num(D / 100) + ' × ' + g + ' = ' + U.num(L) + ' L' + tools(st[0]) + '</li>' +
          '<li>' + U.num(L) + ' × ' + U.money(price) + ' = ' + U.money(cost) + tools(st[1]) + '</li>' +
          '<li>' + U.money(cost) + ' × ' + U.num(1 + up / 100) + ' = <strong>' + U.money(later) + '</strong>' + tools(st[2]) + '</li></ol>'
      });
    }
  }

  // ---------- 5. Saturday market ----------
  function market() {
    for (;;) {
      var h = U.pick([3, 4, 5, 6]), N = h * U.pick([15, 20, 24, 25, 30]), m = U.pick([20, 25, 40, 50]);
      var ratio = U.pick([[3, 2], [2, 1], [3, 1], [4, 1], [2, 3]]);
      var mr = c(N * m / 100), rest = N - mr, share = rest / (ratio[0] + ratio[1]);
      if (!whole(mr) || !whole(share)) continue;
      var bb = share * ratio[0], gm = share * ratio[1];
      var st = [
        { label: 'a) Smoothies per hour', answer: N / h, tools: ['Unit rate'], clue: '“per hour”: divide by the hours.' },
        { label: 'b) Mango Rush smoothies', answer: mr, tools: ['Percent of a number'], clue: '“' + m + '% of the smoothies”.' },
        { label: 'c) Berry Blasts', answer: bb, tools: ['Ratio'], clue: 'split the other ' + rest + ' in the ratio ' + ratio.join(':') + '.',
          mistakes: [{ value: c(N / (ratio[0] + ratio[1]) * ratio[0]), msg: 'c) Split only the smoothies that are NOT Mango Rush: ' + N + ' − ' + mr + ' = ' + rest + '.' }] },
        { label: 'd) Green Machines', answer: gm, tools: ['Ratio'], clue: 'the rest of the ' + rest + ' (ratio ' + ratio.join(':') + ').' }
      ];
      return boss({
        prompt: 'On Saturday of the festival, Zuri sells ' + N + ' smoothies in ' + h + ' hours. ' + m + '% of them are Mango Rush. ' +
          'The rest are Berry Blast and Green Machine in the ratio ' + ratio.join(':') + '.',
        steps: st,
        success: N + ' ÷ ' + h + ' = ' + (N / h) + ' per hour. Mango Rush ' + mr + ', then ' + rest + ' split ' + ratio.join(':') + ' = ' + bb + ' and ' + gm + '. Check: ' + mr + ' + ' + bb + ' + ' + gm + ' = ' + N + ' ✓',
        solution: '<ol><li>' + N + ' ÷ ' + h + ' = ' + (N / h) + tools(st[0]) + '</li>' +
          '<li>' + m + '% of ' + N + ' = ' + mr + tools(st[1]) + '</li>' +
          '<li>The rest: ' + N + ' − ' + mr + ' = ' + rest + '. ' + ratio.join(' + ') + ' = ' + (ratio[0] + ratio[1]) + ' shares of ' + share + ', so Berry Blast = ' + bb + tools(st[2]) + '</li>' +
          '<li>Green Machine = ' + gm + tools(st[3]) + '</li><li>Check it makes sense: ' + mr + ' + ' + bb + ' + ' + gm + ' = ' + N + ' ✓</li></ol>'
      });
    }
  }

  // ---------- 6. Split the profit, then save ----------
  function splitSave(name) {
    for (;;) {
      var ratio = U.pick([[5, 2], [3, 1], [3, 2], [4, 1], [2, 1]]);
      var profit = (ratio[0] + ratio[1]) * U.pick([500, 1000, 1500, 2000, 3000]);
      var r = U.pick([2, 3, 4, 5]), t = U.pick([2, 3, 4]);
      var share = profit / (ratio[0] + ratio[1]) * ratio[0], I = c(share * r / 100 * t), total = c(share + I);
      var st = [
        { label: 'a) Zuri’s share', money: true, answer: share, tools: ['Ratio'], clue: '“split in the ratio ' + ratio.join(':') + '”.' },
        { label: 'b) Interest on her share', money: true, answer: I, tools: ['Simple interest'], clue: '“' + r + '% simple interest … ' + t + ' years”: I = Prt.',
          mistakes: [{ value: c(share * r * t), msg: 'b) Use the rate as a decimal: ' + r + '% = ' + U.num(r / 100) + '.' }] },
        { label: 'c) How much she has after ' + t + ' years', money: true, answer: total, tools: ['Add or subtract', 'Simple interest'], clue: 'interest is not the total: add the principal.',
          mistakes: [{ value: I, msg: 'c) Interest is not the total. Add her share back on.' }] }
      ];
      return boss({
        prompt: 'After the festival, Zuri and her partner ' + name + ' split the ' + $(profit) + ' profit in the ratio ' + ratio.join(':') +
          ' (Zuri first). Zuri saves her share at ' + r + '% simple interest per year for ' + t + ' years.',
        steps: st,
        success: $(share) + ' + ' + $(I) + ' interest = ' + $(total) + '.',
        solution: '<ol><li>' + ratio.join(' + ') + ' = ' + (ratio[0] + ratio[1]) + ' shares of ' + $(profit / (ratio[0] + ratio[1])) + ', so Zuri gets ' + $(share) + tools(st[0]) + '</li>' +
          '<li>' + $(share) + ' × ' + U.num(r / 100) + ' × ' + t + ' = ' + $(I) + tools(st[1]) + '</li>' +
          '<li>' + $(share) + ' + ' + $(I) + ' = <strong>' + $(total) + '</strong>' + tools(st[2]) + '</li></ol>'
      });
    }
  }

  // ---------- 7. Hotel or motel ----------
  function hotel() {
    var n = U.pick([2, 3]), q = U.pick([90, 100, 120, 150]);
    var before = n * q, withTax = c(before * 1.13), diff = U.pick([15, 20, 25, 30, 40]) * (Math.random() < 0.5 ? 1 : -1);
    var motel = c(withTax + diff), cheaper = diff > 0 ? 'the hotel' : 'the motel';
    var st = [
      { label: 'a) Hotel before tax', money: true, answer: before, tools: RATE, clue: '“' + $(q) + ' per night”.' },
      { label: 'b) Hotel with 13% HST', money: true, answer: withTax, tools: ['Discount, tax or tip'], clue: '“plus 13% HST”: × 1.13.',
        mistakes: [{ value: c(before + 0.13), msg: 'b) 13% is not 13 cents.' }] },
      { label: 'c) How much the cheaper one saves', money: true, answer: Math.abs(diff), tools: ['Add or subtract'], clue: 'compare the two totals.' }
    ];
    return boss({
      prompt: 'For the festival, the crew needs a room for ' + n + ' nights. A hotel costs ' + $(q) + ' per night plus 13% HST. A motel costs ' +
        U.money(motel) + ' for all ' + n + ' nights, tax included.',
      steps: st,
      success: 'The hotel is ' + U.money(withTax) + ' and the motel is ' + U.money(motel) + ', so ' + cheaper + ' saves ' + U.money(Math.abs(diff)) + '.',
      solution: '<ol><li>' + n + ' × ' + $(q) + ' = ' + $(before) + tools(st[0]) + '</li><li>' + $(before) + ' × 1.13 = ' + U.money(withTax) + tools(st[1]) + '</li>' +
        '<li>' + U.money(Math.max(withTax, motel)) + ' − ' + U.money(Math.min(withTax, motel)) + ' = <strong>' + U.money(Math.abs(diff)) + '</strong>, so ' + cheaper + ' is cheaper' + tools(st[2]) + '</li></ol>'
    });
  }

  // ---------- 8. Festival fee ----------
  function festivalFee() {
    var park = U.pick([30, 40, 50, 60]), f = U.pick([10, 15, 20]), S = U.pick([400, 600, 800, 1000, 1200]);
    var fee = c(S * f / 100), costAll = c(park + fee), keep = c(S - costAll);
    var st = [
      { label: 'a) ' + f + '% of her sales', money: true, answer: fee, tools: ['Percent of a number'], clue: '“' + f + '% of her sales”.' },
      { label: 'b) What the festival costs her in all', money: true, answer: costAll, tools: ['Add or subtract'], clue: 'parking + the ' + f + '%.' },
      { label: 'c) What she keeps', money: true, answer: keep, tools: ['Add or subtract'], clue: 'sales − what the festival costs.',
        mistakes: [{ value: c(S - fee), msg: 'c) Don’t forget the ' + $(park) + ' parking.' }] }
    ];
    return boss({
      prompt: 'The festival charges ' + $(park) + ' to park the truck plus ' + f + '% of her sales. Zuri sells ' + $(S) + ' of smoothies.',
      steps: st,
      success: $(park) + ' + ' + $(fee) + ' = ' + $(costAll) + ', so she keeps ' + $(S) + ' − ' + $(costAll) + ' = ' + $(keep) + '.',
      solution: '<ol><li>' + f + '% of ' + $(S) + ' = ' + $(fee) + tools(st[0]) + '</li><li>' + $(park) + ' + ' + $(fee) + ' = ' + $(costAll) + tools(st[1]) + '</li>' +
        '<li>' + $(S) + ' − ' + $(costAll) + ' = <strong>' + $(keep) + '</strong>' + tools(st[2]) + '</li></ol>'
    });
  }

  // ---------- 9. A new blender: buy now or save first (like the test Boss d, e) ----------
  function newBlender() {
    for (;;) {
      var B = U.pick([1000, 1200, 1500, 1800, 2000]), r = U.pick([4, 5, 6]);
      var withTax = c(B * 1.13), profit = U.pick([1500, 1650, 1800, 2000, 2200, 2400]);
      if (profit <= withTax) continue;
      var left = c(profit - withTax), saved = c(profit * (1 + r / 100));
      var st = [
        { label: 'a) Blender price with 13% HST', money: true, answer: withTax, tools: ['Discount, tax or tip'], clue: '“plus 13% HST”: × 1.13.',
          mistakes: [{ value: B, msg: 'a) Add the tax: × 1.13.' }] },
        { label: 'b) Profit left after buying it now', money: true, answer: left, tools: ['Add or subtract'], clue: 'profit − the price WITH tax.',
          mistakes: [{ value: c(profit - B), msg: 'b) Compare with the price WITH tax from a).' }] },
        { label: 'c) If she saves the profit 1 year at ' + r + '% first, how much she has', money: true, answer: saved, tools: ['Simple interest'], clue: 'I = Prt, then add the principal.',
          mistakes: [{ value: c(profit * r / 100), msg: 'c) That’s the interest. Add the ' + $(profit) + ' back on.' }] }
      ];
      return boss({
        prompt: 'Zuri made ' + $(profit) + ' profit at the festival. She wants a new blender that costs ' + $(B) + ' plus 13% HST.',
        steps: st,
        success: 'The blender is ' + $(withTax) + ' with tax. Buying now leaves ' + $(left) + '. Saving first gives ' + $(saved) + '.',
        solution: '<ol><li>' + $(B) + ' × 1.13 = ' + $(withTax) + tools(st[0]) + '</li><li>' + $(profit) + ' − ' + $(withTax) + ' = ' + $(left) + tools(st[1]) + '</li>' +
          '<li>' + $(profit) + ' × ' + U.num(r / 100) + ' × 1 = ' + $(profit * r / 100) + '; ' + $(profit) + ' + ' + $(profit * r / 100) + ' = <strong>' + $(saved) + '</strong>' + tools(st[2]) + '</li></ol>'
      });
    }
  }

  var POOL = [festivalSales, blender, saleBag, gasTrip, market, splitSave, hotel, festivalFee, newBlender];
  var order = [];

  function makeQuestion(index, nextName) {
    if (index === 0 || !order.length) {
      // Always start with the test-style festival sales problem, then 4 others at random.
      order = [festivalSales].concat(U.shuffle(POOL.slice(1)).slice(0, QUESTIONS - 1));
    }
    return order[index % order.length](nextName());
  }

  window.FestivalBoss = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS, POOL: POOL };
  U.runRound({ id: 'festival-boss', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
