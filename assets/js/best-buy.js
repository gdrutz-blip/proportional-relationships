/*
 * Best Buy (Lesson 2: unit rates and comparing rates)
 * Two price tags. Find the unit price of each, then tap the better buy.
 * Key move: divide by the thing you want "per".
 *
 * Every price is built from a whole-cent unit price, so unit prices are exact
 * and nothing is rounded in the middle of the work.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;

  // ---------- Items sold to the truck ----------
  // cents = range for the unit price in cents.
  var COUNT_ITEMS = [
    { kind: 'count', what: 'mangoes', one: 'mango', many: 'mangoes', qtys: [3, 4, 5, 6, 8], cents: [90, 190] },
    { kind: 'count', what: 'kiwis', one: 'kiwi', many: 'kiwis', qtys: [4, 5, 6, 8, 10], cents: [35, 80] },
    { kind: 'count', what: 'limes', one: 'lime', many: 'limes', qtys: [3, 4, 5, 6, 8, 10], cents: [30, 65] },
    { kind: 'count', what: 'bananas', one: 'banana', many: 'bananas', qtys: [4, 5, 6, 8, 10], cents: [25, 45] },
    { kind: 'count', what: 'pineapples', one: 'pineapple', many: 'pineapples', qtys: [2, 3, 4, 5], cents: [280, 450] }
  ];
  var PACK_ITEMS = [
    { kind: 'count', what: 'paper cups', one: 'cup', many: 'cups', qtys: [50, 100, 200, 500], cents: [6, 14] },
    { kind: 'count', what: 'paper straws', one: 'straw', many: 'straws', qtys: [100, 200, 500], cents: [2, 6] },
    { kind: 'count', what: 'cup lids', one: 'lid', many: 'lids', qtys: [50, 100, 200], cents: [3, 8] }
  ];
  var MEASURE_ITEMS = [
    { kind: 'mass', what: 'frozen strawberries', cents: [700, 1200] },
    { kind: 'mass', what: 'frozen blueberries', cents: [900, 1500] },
    { kind: 'mass', what: 'spinach', cents: [1000, 1800] },
    { kind: 'mass', what: 'rolled oats', cents: [300, 650] },
    { kind: 'volume', what: 'vanilla yogurt', cents: [350, 700] },
    { kind: 'volume', what: 'oat milk', cents: [250, 450] },
    { kind: 'volume', what: 'orange juice', cents: [200, 450] },
    { kind: 'volume', what: 'coconut water', cents: [400, 800] }
  ];
  // Quantities in kg or L. Kept friendly for no-calculator work (the unit test is no-calculator).
  var SAME_UNIT_QTYS = [0.5, 2, 3, 4, 5];
  var SMALL_QTYS = { mass: [0.25, 0.5], volume: [0.25, 0.5] };
  var BIG_QTYS = { mass: [2, 3, 4, 5], volume: [2, 3, 4] };

  var PROMPTS = [
    function (n, w) { return n + ' is buying ' + w + ' for the truck. Which is the better buy?'; },
    function (n, w) { return 'Zuri sends ' + n + ' to the market for ' + w + '. Which tag is the better deal?'; },
    function (n, w) { return n + ' is restocking the truck with ' + w + '. Which is the better buy?'; },
    function (n, w) { return n + ' finds two price tags for ' + w + '. Which one is the better buy?'; }
  ];

  // ---------- Building a question ----------
  function isWhole(x) { return Math.abs(x - Math.round(x)) < 1e-9; }

  /** Picks two quantities and two different whole-cent unit prices that give whole-cent totals. */
  function makePair(item, smallQtys, bigQtys) {
    for (var attempt = 0; attempt < 5000; attempt++) {
      var qs = smallQtys === bigQtys ? U.shuffle(smallQtys).slice(0, 2) : [U.pick(smallQtys), U.pick(bigQtys)];
      var small = Math.min(qs[0], qs[1]);
      var big = Math.max(qs[0], qs[1]);
      if (small === big) continue;
      var a = U.randInt(item.cents[0], item.cents[1]);
      var b = U.randInt(item.cents[0], item.cents[1]);
      // Friendly unit prices: 5¢ steps for fruit, 10¢ steps per kg or L (tiny prices like straws stay 1¢ steps).
      var step = item.kind === 'count' ? (item.cents[0] >= 20 ? 5 : 1) : 10;
      if (a % step || b % step) continue;
      var lo = Math.min(a, b), hi = Math.max(a, b);
      if (hi - lo < Math.max(1, lo * 0.05)) continue;          // not a near-tie
      if (lo >= 20 && hi - lo > lo * 0.35) continue;           // not too obvious
      // Sometimes the bigger pack is the better deal, sometimes it isn't.
      var bigIsBetter = Math.random() < 0.55;
      var bigUnit = bigIsBetter ? lo : hi;
      var smallUnit = bigIsBetter ? hi : lo;
      if (!isWhole(bigUnit * big) || !isWhole(smallUnit * small)) continue;
      return {
        tags: [
          { qty: small, unitCents: smallUnit, totalCents: Math.round(smallUnit * small) },
          { qty: big, unitCents: bigUnit, totalCents: Math.round(bigUnit * big) }
        ],
        bigIsBetter: bigIsBetter
      };
    }
    throw new Error('Could not build a Best Buy pair');
  }

  function makeQuestion(index, nextName) {
    var item, pair, mixed = false;
    if (index <= 1) {
      item = U.pick(COUNT_ITEMS);
      pair = makePair(item, item.qtys, item.qtys);
    } else if (index === 2) {
      item = U.pick(PACK_ITEMS);
      pair = makePair(item, item.qtys, item.qtys);
    } else if (index === 3) {
      item = U.pick(MEASURE_ITEMS);
      pair = makePair(item, SAME_UNIT_QTYS, SAME_UNIT_QTYS);
    } else {
      // Questions 5 and 6: one tag is in g or mL, the other in kg or L.
      item = U.pick(MEASURE_ITEMS);
      pair = makePair(item, SMALL_QTYS[item.kind], BIG_QTYS[item.kind]);
      mixed = true;
    }

    var tags = pair.tags;
    tags.forEach(function (t) {
      t.small = mixed && t.qty < 1; // show this one in g or mL
    });
    tags = U.shuffle(tags);
    tags[0].label = 'Tag A';
    tags[1].label = 'Tag B';
    var best = tags[0].unitCents < tags[1].unitCents ? 0 : 1;

    return new Question({
      item: item, tags: tags, best: best, mixed: mixed, bigIsBetter: pair.bigIsBetter,
      prompt: U.pick(PROMPTS)(nextName(), item.what)
    });
  }

  // ---------- Wording ----------
  function perWord(item) {
    return item.kind === 'mass' ? 'kg' : item.kind === 'volume' ? 'L' : item.one;
  }
  function bigUnitName(item) { return item.kind === 'mass' ? 'kg' : 'L'; }
  function smallUnitName(item) { return item.kind === 'mass' ? 'g' : 'mL'; }
  function howManyWords(item) {
    return item.kind === 'mass' ? 'number of kilograms' :
      item.kind === 'volume' ? 'number of litres' : 'number of ' + item.many;
  }
  /** "6 mangoes", "1 mango", "2.5 kg", "750 g" */
  function qtyText(item, t, forceBig) {
    if (item.kind === 'count') return t.qty + ' ' + (t.qty === 1 ? item.one : item.many);
    if (t.small && !forceBig) return U.num(t.qty * 1000) + ' ' + smallUnitName(item);
    return U.num(t.qty) + ' ' + bigUnitName(item);
  }
  function unitPriceText(t) { return U.money(t.unitCents / 100); }
  function totalText(t) { return U.money(t.totalCents / 100); }

  // ---------- Double number line (hint) ----------
  function numberLine(item, t) {
    var q = t.qty;
    var x0 = 34, x1, xq;
    if (q > 1) { x1 = 130; xq = 290; } else { xq = 160; x1 = 290; }
    var oneLabel = item.kind === 'count' ? '1 ' + item.one : '1 ' + bigUnitName(item);
    var qLabel = qtyText(item, t, true);
    function tick(x, y) { return '<line class="dnl-tick" x1="' + x + '" y1="' + (y - 7) + '" x2="' + x + '" y2="' + (y + 7) + '"/>'; }
    function text(x, y, s, cls) { return '<text class="' + (cls || 'dnl-text') + '" x="' + x + '" y="' + y + '" text-anchor="middle">' + s + '</text>'; }
    var mid = (x1 + xq) / 2;
    return '<figure class="dnl">' +
      '<svg viewBox="0 0 340 124" role="img" aria-label="Double number line: ' + totalText(t) + ' for ' + qLabel +
      ', and a question mark for ' + oneLabel + '. Divide both lines by ' + U.num(q) + '.">' +
      '<line class="dnl-line" x1="20" y1="40" x2="320" y2="40"/>' +
      '<line class="dnl-line" x1="20" y1="88" x2="320" y2="88"/>' +
      tick(x0, 40) + tick(x1, 40) + tick(xq, 40) +
      tick(x0, 88) + tick(x1, 88) + tick(xq, 88) +
      text(x0, 24, '$0') + text(xq, 24, totalText(t)) + text(x1, 24, '?', 'dnl-ask') +
      text(x0, 114, '0') + text(xq, 114, qLabel) + text(x1, 114, oneLabel) +
      text(mid, 69, '÷ ' + U.num(q), 'dnl-op') +
      '</svg>' +
      '<figcaption>' + t.label + ': divide both lines by ' + U.num(q) + ' to get to 1 ' + perWord(item) + '.</figcaption>' +
      '</figure>';
  }

  // ---------- The question object ----------
  function Question(d) {
    this.d = d;
    this.choice = null;
  }

  Question.prototype.render = function (container) {
    var d = this.d, self = this;
    var per = perWord(d.item);
    var html = '<p class="prompt">' + d.prompt + '</p>';
    if (d.mixed) html += '<p class="watch">Watch the units! Make them match before you compare.</p>';
    html += '<p class="small">Find each unit price, then tap the better buy.</p>';
    html += '<div class="tags" role="group" aria-label="Price tags">';
    d.tags.forEach(function (t, i) {
      html += '<div class="tag-col">' +
        '<button type="button" class="price-tag" aria-pressed="false" data-i="' + i + '">' +
        '<span class="tag-label">' + t.label + '</span>' +
        '<span class="tag-qty">' + qtyText(d.item, t) + '</span>' +
        '<span class="tag-price">' + totalText(t) + '</span>' +
        '<span class="tag-pick" aria-hidden="true">Better buy ✓</span>' +
        '</button>' +
        '<label class="unit-input" for="unit-' + i + '">Unit price for ' + t.label + '</label>' +
        '<div class="input-row"><span class="affix">$</span>' +
        '<input id="unit-' + i + '" data-money type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="mark-' + i + '">' +
        '<span class="affix">per ' + per + '</span></div>' +
        '<span class="mark" id="mark-' + i + '"></span>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;

    this.buttons = container.querySelectorAll('.price-tag');
    this.inputs = container.querySelectorAll('input');
    this.marks = container.querySelectorAll('.mark');
    Array.prototype.forEach.call(this.buttons, function (btn) {
      btn.addEventListener('click', function () {
        self.choice = Number(btn.getAttribute('data-i'));
        Array.prototype.forEach.call(self.buttons, function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
      });
    });
  };

  Question.prototype.check = function () {
    var d = this.d, self = this;
    var vals = [], i;
    for (i = 0; i < 2; i++) {
      var raw = this.inputs[i].value;
      if (!raw.trim()) return { incomplete: 'Fill in the unit price for both tags.' };
      var v = U.parseAnswer(raw);
      if (v === null) return { incomplete: 'Type the unit price as a number, like 1.20.' };
      vals.push(v);
    }
    if (this.choice === null) return { incomplete: 'Tap the price tag that is the better buy.' };

    var per = perWord(d.item);
    var notes = [];
    var priceOk = [true, true];
    d.tags.forEach(function (t, k) {
      var right = t.unitCents / 100;
      var price = t.totalCents / 100;
      var v = vals[k];
      var ok = U.same(v, right);
      priceOk[k] = ok;
      self.inputs[k].classList.toggle('right', ok);
      self.inputs[k].classList.toggle('wrong', !ok);
      self.marks[k].textContent = ok ? '✓ Right' : '✗ Check this one';
      self.marks[k].className = 'mark ' + (ok ? 'right' : 'wrong');
      if (ok) return;
      if (U.near(v, t.qty / price, 0.03)) {
        notes.push('For ' + t.label + ', it looks like you divided the other way. You want dollars per ' + per +
          ', so divide the price by the ' + howManyWords(d.item) + '.');
      } else if (t.small && U.near(v, price / (t.qty * 1000), 0.03)) {
        notes.push('For ' + t.label + ', change ' + smallUnitName(d.item) + ' to ' + bigUnitName(d.item) + ' first: ' +
          qtyText(d.item, t) + ' = ' + qtyText(d.item, t, true) + '.');
      } else if (U.near(v, right, 0.01)) {
        notes.push('Your answer for ' + t.label + ' is very close. Check your division.');
      } else {
        notes.push('Check the unit price for ' + t.label + '.');
      }
    });

    var choiceOk = this.choice === d.best;
    if (!choiceOk && priceOk[0] && priceOk[1]) {
      notes.push('Your unit prices are right! The better buy is the one with the lower unit price.');
    } else if (!choiceOk) {
      notes.push('Then check which tag is the better buy.');
    }

    if (priceOk[0] && priceOk[1] && choiceOk) {
      var a = d.tags[0], b = d.tags[1], w = d.tags[d.best];
      var msg = a.label + ' is ' + unitPriceText(a) + ' per ' + per + ' and ' + b.label + ' is ' +
        unitPriceText(b) + ' per ' + per + ', so ' + w.label + ' is the better buy.';
      if (!d.bigIsBetter) msg += ' The bigger pack isn’t always the better deal!';
      return { ok: true, message: msg };
    }
    return { ok: false, message: notes.join(' ') };
  };

  Question.prototype.hint = function () {
    var d = this.d;
    var per = perWord(d.item);
    var html = '<p>Divide by the thing you want “per.” You want the price <strong>per ' + per +
      '</strong>, so divide each price by its ' + howManyWords(d.item) + '.</p>';
    var smallTag = d.tags.filter(function (t) { return t.small; })[0];
    if (smallTag) {
      html += '<p>First make the units match: ' + qtyText(d.item, smallTag) + ' = ' +
        qtyText(d.item, smallTag, true) + ' (÷ 1000).</p>';
    }
    // Draw the line for the first tag the student got wrong (or Tag A).
    var wrong = 0;
    for (var i = 0; i < 2; i++) {
      if (this.inputs[i].classList.contains('wrong')) { wrong = i; break; }
    }
    html += numberLine(d.item, d.tags[wrong]);
    html += '<p>Then compare: the <strong>lower</strong> unit price is the better buy.</p>';
    return html;
  };

  Question.prototype.solution = function () {
    var d = this.d;
    var per = perWord(d.item);
    var html = '<ol>';
    d.tags.forEach(function (t) {
      if (t.small) {
        html += '<li>Make the units match: ' + qtyText(d.item, t) + ' = ' + qtyText(d.item, t, true) + '.</li>';
      }
    });
    d.tags.forEach(function (t) {
      html += '<li>' + t.label + ': ' + totalText(t) + ' ÷ ' + U.num(t.qty) + ' = <strong>' +
        unitPriceText(t) + ' per ' + per + '</strong></li>';
    });
    var w = d.tags[d.best], l = d.tags[1 - d.best];
    html += '<li>' + unitPriceText(w) + ' is less than ' + unitPriceText(l) + ', so <strong>' + w.label +
      ' (' + qtyText(d.item, w) + ' for ' + totalText(w) + ')</strong> is the better buy.</li>';
    html += '</ol>';
    return html;
  };

  Question.prototype.lock = function () {
    var d = this.d;
    Array.prototype.forEach.call(this.inputs, function (inp) { inp.disabled = true; });
    Array.prototype.forEach.call(this.buttons, function (b, i) {
      b.disabled = true;
      b.classList.toggle('answer', i === d.best);
    });
  };

  // Exposed for automated checks; the game does not need it.
  window.BestBuy = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };

  U.runRound({ id: 'best-buy', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
