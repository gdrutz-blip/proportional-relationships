/*
 * Recipe Mixer (Lesson 1: ratios and equivalent ratios)
 * Scale a smoothie recipe to fill an order, or split a total in a given ratio.
 * Key move: multiply or divide BOTH parts. To split a total, add the parts first.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;

  var RECIPES2 = [
    { name: 'Berry Blast', unit: 'cups', ing: ['yogurt', 'berries'], ratio: [2, 3] }, // as on the wall chart
    { name: 'Mango Tango', unit: 'cups', ing: ['mango', 'orange juice'] },
    { name: 'Peach Dream', unit: 'scoops', ing: ['peach', 'vanilla yogurt'] },
    { name: 'Choco-Banana', unit: 'cups', ing: ['banana', 'chocolate milk'] },
    { name: 'Kiwi Cooler', unit: 'scoops', ing: ['kiwi', 'lime sorbet'] },
    { name: 'Strawberry Fields', unit: 'cups', ing: ['strawberries', 'milk'] }
  ];
  var RECIPES3 = [
    { name: 'Green Machine', unit: 'cups', ing: ['spinach', 'banana', 'apple juice'] },
    { name: 'Tropical Twist', unit: 'scoops', ing: ['pineapple', 'mango', 'coconut'] },
    { name: 'Sunrise Swirl', unit: 'cups', ing: ['strawberries', 'orange juice', 'yogurt'] }
  ];
  var FRUITS = ['mango', 'pineapple', 'strawberry', 'banana', 'peach', 'kiwi', 'blueberry', 'raspberry'];
  var SMOOTHIES = ['Berry Blast', 'Mango Tango', 'Green Machine', 'Peach Dream', 'Tropical Twist', 'Kiwi Cooler'];

  function ratio2() {
    for (;;) {
      var p = U.randInt(1, 6), q = U.randInt(1, 6);
      if (p !== q && U.gcd(p, q) === 1) return [p, q];
    }
  }
  function ratio3() {
    for (;;) {
      var r = [U.randInt(1, 5), U.randInt(1, 5), U.randInt(1, 5)];
      if (U.gcd(U.gcd(r[0], r[1]), r[2]) === 1 && !(r[0] === r[1] && r[1] === r[2])) return r;
    }
  }
  /** '1 cup', '3 cups' */
  function amt(n, unit) { return n + ' ' + (n === 1 ? unit.replace(/s$/, '') : unit); }
  function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }
  function listWords(words) {
    if (words.length <= 2) return words.join(' and ');
    return words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
  }

  function makeQuestion(index, nextName) {
    var name = nextName();
    if (index === 0) return new ScaleQ(name, U.pick(RECIPES2), 'up');
    if (index === 1) return new ScaleQ(name, U.pick(RECIPES2), 'down');
    if (index === 2) return new SplitQ(name, nextName, 2, false);
    if (index === 3) return new ScaleQ(name, U.pick(RECIPES3), 'up');
    if (index === 4) return new SplitQ(name, nextName, 2, true);
    return new SplitQ(name, nextName, 3, false);
  }

  // =====================================================================
  // Scale a recipe (ratio table)
  // =====================================================================
  function ScaleQ(name, recipe, dir) {
    var base = recipe.ratio && Math.random() < 0.5 ? recipe.ratio.slice() :
      (recipe.ing.length === 3 ? ratio3() : ratio2());
    var m1, m2, factor;
    if (dir === 'up') {
      m1 = 1; factor = U.randInt(2, 6); m2 = factor;
    } else {
      m2 = U.randInt(1, 2); factor = U.randInt(2, 4); m1 = m2 * factor;
    }
    this.recipe = recipe;
    this.dir = dir;
    this.factor = factor;
    this.col1 = base.map(function (x) { return x * m1; });
    this.col2 = base.map(function (x) { return x * m2; });
    this.given = U.randInt(0, base.length - 1);
    var g = this.given, u = recipe.unit, ing = recipe.ing;
    var others = ing.filter(function (_, i) { return i !== g; });
    var ask = others.length === 1 ?
      'How many ' + u + ' of ' + others[0] + ' does it need?' :
      'How many ' + u + ' of ' + listWords(others) + ' does it need?';
    if (dir === 'up') {
      this.prompt = name + ' is making a big batch of ' + recipe.name + ' for an order. The order uses ' +
        amt(this.col2[g], u) + ' of ' + ing[g] + '. ' + ask;
      this.heads = ['Recipe', 'Order'];
    } else {
      this.prompt = 'Zuri’s ' + recipe.name + ' recipe makes a big batch. ' + name +
        ' wants a small batch with only ' + amt(this.col2[g], u) + ' of ' + ing[g] + '. ' + ask;
      this.heads = ['Big batch', 'Small batch'];
    }
  }

  ScaleQ.prototype.render = function (c) {
    var self = this, r = this.recipe;
    var card = r.ing.map(function (ing, i) { return amt(self.col1[i], r.unit) + ' ' + ing; }).join(' : ');
    var html = '<p class="prompt">' + this.prompt + '</p>' +
      '<div class="recipe-card"><span class="recipe-name">' + r.name + (this.dir === 'down' ? ' (big batch)' : '') +
      '</span><span class="recipe-ratio">' + card + '</span></div>' +
      '<table class="ratio-table"><thead><tr><th scope="col">Ingredient</th><th scope="col">' + this.heads[0] +
      '</th><th scope="col">' + this.heads[1] + '</th></tr></thead><tbody>';
    r.ing.forEach(function (ing, i) {
      html += '<tr><th scope="row">' + ing + ' <span class="small">(' + r.unit + ')</span></th><td>' + self.col1[i] + '</td><td>';
      if (i === self.given) html += '<strong>' + self.col2[i] + '</strong>';
      else html += '<input id="rm-' + i + '" type="text" inputmode="decimal" autocomplete="off" aria-label="' +
        ing + ', ' + self.heads[1].toLowerCase() + ', in ' + r.unit + '"><span class="mark" id="mark-rm-' + i + '"></span>';
      html += '</td></tr>';
    });
    html += '</tbody></table>';
    c.innerHTML = html;
    this.root = c;
    this.inputs = c.querySelectorAll('input');
    this.blanks = this.recipe.ing.map(function (_, i) { return i; }).filter(function (i) { return i !== self.given; });
  };

  ScaleQ.prototype.check = function () {
    var read = U.readInputs(this.inputs, '12');
    if (read.incomplete) return read;
    var self = this, g = this.given, r = this.recipe, notes = [], allOk = true, added = false;
    this.blanks.forEach(function (i, k) {
      var v = read.values[k], ok = U.same(v, self.col2[i]);
      U.markInput(self.inputs[k], ok);
      if (ok) return;
      allOk = false;
      if (U.same(v, self.col1[i] + (self.col2[g] - self.col1[g]))) added = true;
      else notes.push('Check the amount of ' + r.ing[i] + '.');
    });
    if (allOk) {
      return { ok: true, message: 'Every part was ' + (this.dir === 'up' ? 'multiplied' : 'divided') + ' by ' + this.factor +
        ', so the order tastes just like the recipe.' };
    }
    if (added) notes.unshift('It looks like you added the same amount to each part. For equivalent ratios, × or ÷ BOTH parts by the same number (never add to both).');
    return { ok: false, message: notes.join(' ') };
  };

  ScaleQ.prototype.hint = function () {
    var g = this.given, ing = this.recipe.ing;
    var a = this.col1[g], b = this.col2[g];
    var html = '<p>× or ÷ BOTH parts by the same number.</p>';
    if (this.dir === 'up') {
      html += '<p>The ' + ing[g] + ' went from ' + a + ' to ' + b + ': <strong>' + a + ' × ? = ' + b + '</strong>. ' +
        'Find that number, then multiply every other part by it too.</p>';
    } else {
      html += '<p>The ' + ing[g] + ' went from ' + a + ' to ' + b + ': <strong>' + a + ' ÷ ? = ' + b + '</strong>. ' +
        'Find that number, then divide every other part by it too.</p>';
    }
    html += this.tableHtml(true);
    return html;
  };

  ScaleQ.prototype.tableHtml = function (withQuestionMarks) {
    var self = this, op = (this.dir === 'up' ? '×' : '÷') + ' ' + (withQuestionMarks ? '?' : this.factor);
    var rows = this.recipe.ing.map(function (ing, i) {
      var right = i === self.given || !withQuestionMarks ? self.col2[i] : '?';
      return '<tr><th scope="row">' + ing + '</th><td>' + self.col1[i] + '</td><td class="op">' + op + '</td><td>' + right + '</td></tr>';
    }).join('');
    return '<table class="ratio-table mini"><tbody>' + rows + '</tbody></table>';
  };

  ScaleQ.prototype.solution = function () {
    var self = this, g = this.given, r = this.recipe;
    var verb = this.dir === 'up' ? 'multiply' : 'divide';
    var sym = this.dir === 'up' ? '×' : '÷';
    var how = this.dir === 'up' ? this.col2[g] + ' ÷ ' + this.col1[g] + ' = ' + this.factor :
      this.col1[g] + ' ÷ ' + this.col2[g] + ' = ' + this.factor;
    var html = '<ol><li>' + r.ing[g] + ': ' + how + ', so ' + verb + ' BOTH parts by ' + this.factor + '.</li>';
    this.blanks.forEach(function (i) {
      html += '<li>' + r.ing[i] + ': ' + self.col1[i] + ' ' + sym + ' ' + self.factor + ' = <strong>' + amt(self.col2[i], r.unit) + '</strong></li>';
    });
    html += '</ol>' + this.tableHtml(false);
    return html;
  };

  ScaleQ.prototype.lock = function () { U.disableAll(this.root); };

  // =====================================================================
  // Split a total (bar model)
  // =====================================================================
  function SplitQ(name, nextName, nParts, bigger) {
    var parts = nParts === 3 ? ratio3() : ratio2();
    var each = bigger ? U.randInt(6, 15) : U.randInt(2, 8);
    var total = sum(parts) * each;
    var kinds = nParts === 3 ? ['fruit', 'sales'] : ['fruit', 'sales', 'tips'];
    var kind = U.pick(kinds);
    var labels, unit, money = false, prompt;
    var ratioText = parts.join(' : ');
    if (kind === 'fruit') {
      labels = U.shuffle(FRUITS).slice(0, nParts);
      unit = 'scoops';
      prompt = name + ' has ' + total + ' scoops of fruit. Zuri wants ' + listWords(labels) +
        ' in the ratio ' + ratioText + '. How many scoops of each?';
    } else if (kind === 'sales') {
      labels = U.shuffle(SMOOTHIES).slice(0, nParts);
      unit = 'smoothies';
      prompt = 'On Friday the truck sold ' + total + ' smoothies. The ratio of ' + listWords(labels) +
        ' sold was ' + ratioText + '. How many of each did it sell?';
    } else {
      var other = nextName();
      while (other === name) other = nextName();
      labels = [name, other];
      unit = '';
      money = true;
      prompt = name + ' and ' + other + ' share $' + total + ' in tips in the ratio ' + ratioText +
        ' (the hours they worked). How much does each person get?';
    }
    this.parts = parts; this.each = each; this.total = total;
    this.labels = labels; this.unit = unit; this.money = money; this.prompt = prompt;
    this.answers = parts.map(function (p) { return p * each; });
  }

  SplitQ.prototype.fmt = function (n) { return this.money ? U.money(n) : U.num(n) + ' ' + this.unit; };

  SplitQ.prototype.render = function (c) {
    var self = this;
    var html = '<p class="prompt">' + this.prompt + '</p>' +
      '<div class="recipe-card"><span class="recipe-name">Ratio ' + this.labels.join(' : ') + '</span>' +
      '<span class="recipe-ratio">' + this.parts.join(' : ') + '  ·  Total: ' + (this.money ? '$' + this.total : this.total + ' ' + this.unit) + '</span></div>' +
      '<div class="answer-list">';
    this.labels.forEach(function (lab, i) {
      html += '<div class="answer-line"><label for="sp-' + i + '">' + lab + '</label><div class="input-row">' +
        (self.money ? '<span class="affix">$</span>' : '') +
        '<input id="sp-' + i + '" type="text" inputmode="decimal" autocomplete="off">' +
        (self.money ? '' : '<span class="affix">' + self.unit + '</span>') +
        '</div><span class="mark" id="mark-sp-' + i + '"></span></div>';
    });
    html += '</div>';
    c.innerHTML = html;
    this.root = c;
    this.inputs = c.querySelectorAll('input');
  };

  SplitQ.prototype.check = function () {
    var read = U.readInputs(this.inputs, '12');
    if (read.incomplete) return read;
    var self = this, v = read.values, allOk = true;
    v.forEach(function (x, i) {
      var ok = U.same(x, self.answers[i]);
      U.markInput(self.inputs[i], ok);
      if (!ok) allOk = false;
    });
    if (allOk) {
      return { ok: true, message: this.parts.join(' + ') + ' = ' + sum(this.parts) + ' parts, and each part is ' +
        this.fmt(this.each) + '. Check: ' + this.answers.join(' + ') + ' = ' + this.total + ' ✓' };
    }
    var notes = [];
    var got = U.clean(sum(v));
    var divided = v.every(function (x, i) { return U.near(x, self.total / self.parts[i], 0.02); });
    var swapped = v.length === 2 && U.same(v[0], this.answers[1]) && U.same(v[1], this.answers[0]);
    if (swapped) notes.push('Your numbers are swapped. The first number in the ratio goes with ' + this.labels[0] + '.');
    else if (divided) notes.push('It looks like you divided the total by each part. Add the parts first to find how many parts there are in all.');
    else if (!U.same(got, this.total)) notes.push('Your amounts add up to ' + U.num(got) + ', but the total is ' + this.total + '.');
    else notes.push('Your amounts add up to the total, but they are not in the ratio ' + this.parts.join(' : ') + '.');
    return { ok: false, message: notes.join(' ') };
  };

  SplitQ.prototype.barHtml = function (showValues) {
    var self = this, html = '<div class="bar-model" aria-hidden="true">';
    this.parts.forEach(function (p, i) {
      html += '<div class="bar-row"><span class="bar-label">' + self.labels[i] + '</span><span class="bar-boxes">';
      for (var k = 0; k < p; k++) html += '<span class="bar-box c' + i + '">' + (showValues ? U.num(self.each) : '?') + '</span>';
      html += '</span></div>';
    });
    html += '<p class="bar-total">' + sum(this.parts) + ' boxes in all = ' + (this.money ? '$' + this.total : this.total + ' ' + this.unit) + '</p></div>';
    return html;
  };

  SplitQ.prototype.hint = function () {
    return '<p>Split a total: <strong>add the parts first.</strong> ' + this.parts.join(' + ') + ' = ? parts in all. ' +
      'Then divide the total by that to find one part, and multiply for each person or ingredient.</p>' + this.barHtml(false);
  };

  SplitQ.prototype.solution = function () {
    var self = this, s = sum(this.parts);
    var html = '<ol><li>Add the parts: ' + this.parts.join(' + ') + ' = ' + s + '.</li>' +
      '<li>One part: ' + (this.money ? '$' : '') + this.total + ' ÷ ' + s + ' = ' + this.fmt(this.each) + '.</li>';
    this.labels.forEach(function (lab, i) {
      html += '<li>' + lab + ': ' + self.parts[i] + ' × ' + U.num(self.each) + ' = <strong>' + self.fmt(self.answers[i]) + '</strong></li>';
    });
    html += '<li>Check: ' + this.answers.join(' + ') + ' = ' + this.total + ' ✓</li></ol>' + this.barHtml(true);
    return html;
  };

  SplitQ.prototype.lock = function () { U.disableAll(this.root); };

  window.RecipeMixer = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'recipe-mixer', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
