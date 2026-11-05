/*
 * Recipe Mixer (Lesson 1: ratios and equivalent ratios)
 * Scale a smoothie recipe to fill an order, write a ratio in lowest terms,
 * or split a total in a given ratio.
 * Key move: multiply or divide BOTH parts. To split a total, add the parts first.
 */
(function () {
  'use strict';
  var U = window.U3;
  var QUESTIONS = 6;

  // Zuri's recipes, as they appear in the Unit 3 lessons.
  var RECIPES = [
    { name: 'Berry Blast', ing: ['yogurt', 'berries'], ratio: [2, 3] },
    { name: 'Mango Rush', ing: ['mango', 'coconut milk'], ratio: [4, 6] },
    { name: 'Green Machine', ing: ['spinach', 'banana'], ratio: [3, 5] },
    { name: 'Tropical Twist', ing: ['pineapple', 'mango'], ratio: [3, 2] },
    { name: 'Peach Fizz', ing: ['peach', 'ginger'], ratio: [5, 2] }
  ];
  var UNIT = 'scoops';
  var FLAVOURS = ['Berry Blast', 'Mango Rush', 'Green Machine', 'Tropical Twist', 'Peach Fizz'];

  function ratio2(max) {
    for (;;) {
      var p = U.randInt(1, max || 6), q = U.randInt(1, max || 6);
      if (p !== q && U.gcd(p, q) === 1) return [p, q];
    }
  }
  function ratio3() {
    for (;;) {
      var r = [U.randInt(1, 5), U.randInt(1, 5), U.randInt(1, 5)];
      if (U.gcd(U.gcd(r[0], r[1]), r[2]) === 1 && !(r[0] === r[1] && r[1] === r[2])) return r;
    }
  }
  /** '1 scoop', '3 scoops' */
  function amt(n, unit) { return n + ' ' + (n === 1 ? unit.replace(/s$/, '') : unit); }
  function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }
  function listWords(words) {
    if (words.length <= 2) return words.join(' and ');
    return words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
  }

  function makeQuestion(index, nextName) {
    var name = nextName();
    if (index === 0) return new ScaleQ(name, 'up');
    if (index === 1) return new ScaleQ(name, 'down');
    if (index === 2) return new SplitQ(name, nextName, 2, false);
    if (index === 3) return new LowestQ(name);
    if (index === 4) return new SplitQ(name, nextName, 2, true);
    return new SplitQ(name, nextName, 3, false);
  }

  // =====================================================================
  // Scale a recipe (ratio table)
  // =====================================================================
  function ScaleQ(name, dir) {
    var recipe = U.pick(RECIPES);
    var base = recipe.ratio;
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
    this.given = U.randInt(0, 1);
    this.other = 1 - this.given;
    var g = this.given, ing = recipe.ing;
    var ask = 'How many scoops of ' + ing[this.other] + ' does it need?';
    if (dir === 'up') {
      this.prompt = name + ' is making a big batch of ' + recipe.name + ' for an order. The order uses ' +
        amt(this.col2[g], UNIT) + ' of ' + ing[g] + '. ' + ask;
      this.heads = ['Recipe', 'Order'];
    } else {
      this.prompt = 'Zuri’s ' + recipe.name + ' big batch is below. ' + name +
        ' wants a small batch with only ' + amt(this.col2[g], UNIT) + ' of ' + ing[g] + '. ' + ask;
      this.heads = ['Big batch', 'Small batch'];
    }
  }

  ScaleQ.prototype.render = function (c) {
    var self = this, r = this.recipe;
    var card = r.ing.map(function (ing, i) { return amt(self.col1[i], UNIT) + ' of ' + ing; }).join(' : ');
    var html = '<p class="prompt">' + this.prompt + '</p>' +
      '<div class="recipe-card"><span class="recipe-name">' + r.name + (this.dir === 'down' ? ' (big batch)' : '') +
      '</span><span class="recipe-ratio">' + card + '</span></div>' +
      '<table class="ratio-table"><thead><tr><th scope="col">Ingredient</th><th scope="col">' + this.heads[0] +
      '</th><th scope="col">' + this.heads[1] + '</th></tr></thead><tbody>';
    r.ing.forEach(function (ing, i) {
      html += '<tr><th scope="row">' + ing + ' <span class="small">(scoops)</span></th><td>' + self.col1[i] + '</td><td>';
      if (i === self.given) html += '<strong>' + self.col2[i] + '</strong>';
      else html += '<input id="rm-' + i + '" type="text" inputmode="decimal" autocomplete="off" aria-label="' +
        ing + ', ' + self.heads[1].toLowerCase() + ', in scoops"><span class="mark" id="mark-rm-' + i + '"></span>';
      html += '</td></tr>';
    });
    html += '</tbody></table>';
    c.innerHTML = html;
    this.root = c;
    this.inputs = c.querySelectorAll('input');
  };

  ScaleQ.prototype.check = function () {
    var read = U.readInputs(this.inputs, '12');
    if (read.incomplete) return read;
    var v = read.values[0], g = this.given, i = this.other;
    var ok = U.same(v, this.col2[i]);
    U.markInput(this.inputs[0], ok);
    if (ok) {
      return { ok: true, message: 'Both parts were ' + (this.dir === 'up' ? 'multiplied' : 'divided') + ' by ' + this.factor +
        ', so it tastes just like the recipe.' };
    }
    if (U.same(v, this.col1[i] + (this.col2[g] - this.col1[g]))) {
      return { ok: false, message: 'It looks like you added the same amount to both parts. Adding changes the mix: × or ÷ BOTH parts by the same number.' };
    }
    if (U.same(v, this.col1[i])) return { ok: false, message: 'The ' + this.recipe.ing[i] + ' has to change too, by the same × or ÷.' };
    return { ok: false, message: 'Check the amount of ' + this.recipe.ing[i] + '.' };
  };

  ScaleQ.prototype.tableHtml = function (withQuestionMarks) {
    var self = this, op = (this.dir === 'up' ? '×' : '÷') + ' ' + (withQuestionMarks ? '?' : this.factor);
    var rows = this.recipe.ing.map(function (ing, i) {
      var right = i === self.given || !withQuestionMarks ? self.col2[i] : '?';
      return '<tr><th scope="row">' + ing + '</th><td>' + self.col1[i] + '</td><td class="op">' + op + '</td><td>' + right + '</td></tr>';
    }).join('');
    return '<table class="ratio-table mini"><tbody>' + rows + '</tbody></table>';
  };

  ScaleQ.prototype.hint = function () {
    var g = this.given, ing = this.recipe.ing;
    var a = this.col1[g], b = this.col2[g];
    var html = '<p>× or ÷ BOTH parts by the same number.</p><p>The ' + ing[g] + ' went from ' + a + ' to ' + b + ': <strong>' +
      a + (this.dir === 'up' ? ' × ? = ' : ' ÷ ? = ') + b + '</strong>. Find that number, then do the same to the ' + ing[this.other] + '.</p>';
    return html + this.tableHtml(true);
  };

  ScaleQ.prototype.solution = function () {
    var g = this.given, i = this.other, r = this.recipe;
    var verb = this.dir === 'up' ? 'multiply' : 'divide';
    var sym = this.dir === 'up' ? '×' : '÷';
    var how = this.dir === 'up' ? this.col2[g] + ' ÷ ' + this.col1[g] + ' = ' + this.factor :
      this.col1[g] + ' ÷ ' + this.col2[g] + ' = ' + this.factor;
    return '<ol><li>' + r.ing[g] + ': ' + how + ', so ' + verb + ' BOTH parts by ' + this.factor + '.</li>' +
      '<li>' + r.ing[i] + ': ' + this.col1[i] + ' ' + sym + ' ' + this.factor + ' = <strong>' + amt(this.col2[i], UNIT) + '</strong></li></ol>' +
      this.tableHtml(false);
  };

  ScaleQ.prototype.lock = function () { U.disableAll(this.root); };

  // =====================================================================
  // Lowest terms (like test question 1)
  // =====================================================================
  function LowestQ(name) {
    var simple, k, labels, prompt;
    if (Math.random() < 0.5) {
      var r = U.pick(RECIPES);
      var g0 = U.gcd(r.ratio[0], r.ratio[1]);
      simple = [r.ratio[0] / g0, r.ratio[1] / g0];
      k = U.randInt(3, 9);
      labels = r.ing;
      prompt = name + ' mixed a big batch of ' + r.name + ': ' + amt(simple[0] * k, UNIT) + ' of ' + labels[0] + ' and ' +
        amt(simple[1] * k, UNIT) + ' of ' + labels[1] + '. Write the ratio of ' + labels[0] + ' to ' + labels[1] + ' in lowest terms.';
    } else {
      simple = ratio2(5);
      k = U.randInt(3, 12);
      labels = U.shuffle(FLAVOURS).slice(0, 2);
      prompt = 'On Saturday the truck sold ' + simple[0] * k + ' ' + labels[0] + ' and ' + simple[1] * k + ' ' + labels[1] +
        ' smoothies. Write the ratio of ' + labels[0] + ' to ' + labels[1] + ' in lowest terms.';
    }
    this.simple = simple; this.k = k; this.labels = labels; this.prompt = prompt;
    this.big = [simple[0] * k, simple[1] * k];
  }

  LowestQ.prototype.render = function (c) {
    c.innerHTML = '<p class="prompt">' + this.prompt + '</p>' +
      '<div class="recipe-card"><span class="recipe-name">' + this.labels[0] + ' : ' + this.labels[1] + '</span>' +
      '<span class="recipe-ratio">' + this.big[0] + ' : ' + this.big[1] + '</span></div>' +
      '<p class="step-title">In lowest terms:</p>' +
      '<div class="input-row ratio-inputs">' +
      '<input id="lt-0" type="text" inputmode="numeric" autocomplete="off" aria-label="' + this.labels[0] + ' part">' +
      '<span class="affix big-colon">:</span>' +
      '<input id="lt-1" type="text" inputmode="numeric" autocomplete="off" aria-label="' + this.labels[1] + ' part"></div>' +
      '<span class="mark" id="mark-lt"></span>';
    this.root = c;
    this.inputs = c.querySelectorAll('input');
  };

  LowestQ.prototype.check = function () {
    var read = U.readInputs(this.inputs, '2');
    if (read.incomplete) return read;
    var a = read.values[0], b = read.values[1], s = this.simple;
    var ok = U.same(a, s[0]) && U.same(b, s[1]);
    Array.prototype.forEach.call(this.inputs, function (inp) { inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok); });
    var mark = document.getElementById('mark-lt');
    mark.textContent = ok ? '✓ Right' : '✗ Check this one';
    mark.className = 'mark ' + (ok ? 'right' : 'wrong');
    if (ok) return { ok: true, message: this.big[0] + ' : ' + this.big[1] + ', both ÷ ' + this.k + ', is ' + s[0] + ' : ' + s[1] + '. No other number goes into both.' };
    if (a > 0 && b > 0 && U.same(a * s[1], b * s[0])) {
      return { ok: false, message: 'That’s the same mix, but not lowest terms yet. Can you divide both parts by the same number again?' };
    }
    if (U.same(a, s[1]) && U.same(b, s[0])) return { ok: false, message: 'Check the order: ' + this.labels[0] + ' comes first.' };
    return { ok: false, message: 'That isn’t the same mix. Divide BOTH parts by the same number.' };
  };

  LowestQ.prototype.hint = function () {
    return '<p>Lowest terms: divide both parts by the <strong>biggest number that goes into both</strong>.</p>' +
      '<p>What is the biggest number that goes into both ' + this.big[0] + ' and ' + this.big[1] + '? Use the multiplication chart. ' +
      'If you divide by a smaller number first, check whether you can divide again.</p>';
  };

  LowestQ.prototype.solution = function () {
    return '<ol><li>The biggest number that goes into both ' + this.big[0] + ' and ' + this.big[1] + ' is ' + this.k + '.</li>' +
      '<li>' + this.big[0] + ' ÷ ' + this.k + ' = ' + this.simple[0] + ' and ' + this.big[1] + ' ÷ ' + this.k + ' = ' + this.simple[1] + '.</li>' +
      '<li>' + this.labels[0] + ' to ' + this.labels[1] + ' is <strong>' + this.simple[0] + ' : ' + this.simple[1] + '</strong>.</li></ol>';
  };

  LowestQ.prototype.lock = function () { U.disableAll(this.root); };

  // =====================================================================
  // Split a total (bar model)
  // =====================================================================
  function SplitQ(name, nextName, nParts, bigger) {
    var each = bigger ? U.randInt(6, 15) : U.randInt(2, 8);
    var kind = nParts === 3 ? 'sales' : U.pick(['recipe', 'sales', 'tips']);
    var parts, labels, unit = '', money = false, prompt, total;
    if (kind === 'recipe') {
      var r = U.pick(RECIPES);
      parts = r.ratio.slice();
      labels = r.ing;
      unit = 'scoops';
      total = sum(parts) * each;
      prompt = 'A ' + r.name + ' batch is ' + total + ' scoops in all. It uses ' + labels[0] + ' to ' + labels[1] +
        ' in the ratio ' + parts.join(':') + '. How many scoops of each?';
    } else if (kind === 'sales') {
      parts = nParts === 3 ? ratio3() : ratio2();
      labels = U.shuffle(FLAVOURS).slice(0, nParts);
      unit = 'smoothies';
      total = sum(parts) * each;
      prompt = 'On Friday the truck sold ' + total + ' smoothies. ' + listWords(labels) + ' sold in the ratio ' +
        parts.join(':') + '. How many of each did it sell?';
    } else {
      var other = nextName();
      while (other === name) other = nextName();
      parts = ratio2();
      labels = [name, other];
      money = true;
      total = sum(parts) * each;
      prompt = name + ' and ' + other + ' share $' + total + ' in tips in the ratio ' + parts.join(':') +
        ' (the hours they worked). How much does each person get?';
    }
    this.parts = parts; this.each = each; this.total = total;
    this.labels = labels; this.unit = unit; this.money = money; this.prompt = prompt;
    this.answers = parts.map(function (p) { return p * each; });
  }

  SplitQ.prototype.fmt = function (n) { return this.money ? U.money(n) : U.num(n) + ' ' + this.unit; };
  SplitQ.prototype.totalText = function () { return this.money ? '$' + this.total : this.total + ' ' + this.unit; };

  SplitQ.prototype.render = function (c) {
    var self = this;
    var html = '<p class="prompt">' + this.prompt + '</p>' +
      '<div class="recipe-card"><span class="recipe-name">' + this.labels.join(' : ') + '</span>' +
      '<span class="recipe-ratio">' + this.parts.join(' : ') + '  ·  Total: ' + this.totalText() + '</span></div>' +
      '<div class="answer-list">';
    this.labels.forEach(function (lab, i) {
      html += '<div class="answer-line"><label for="sp-' + i + '">' + lab + '</label><div class="input-row">' +
        (self.money ? '<span class="affix">$</span>' : '') +
        '<input id="sp-' + i + '"' + (self.money ? ' data-money' : '') + ' type="text" inputmode="decimal" autocomplete="off">' +
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
      return { ok: true, message: this.parts.join(' + ') + ' = ' + sum(this.parts) + ' shares, and each share is ' +
        this.fmt(this.each) + '. Check: ' + this.answers.join(' + ') + ' = ' + this.total + ' ✓' };
    }
    var got = U.clean(sum(v));
    var divided = v.every(function (x, i) { return U.near(x, self.total / self.parts[i], 0.02); });
    var swapped = v.length === 2 && U.same(v[0], this.answers[1]) && U.same(v[1], this.answers[0]);
    var oneShare = v.some(function (x) { return U.same(x, self.each); });
    var msg;
    if (swapped) msg = 'Your numbers are swapped. The first number in the ratio goes with ' + this.labels[0] + '.';
    else if (divided) msg = 'It looks like you divided the total by each part. Add the parts first to find how many shares there are.';
    else if (oneShare) msg = 'You found the size of one share. Now multiply it by each part of the ratio.';
    else if (!U.same(got, this.total)) msg = 'Your amounts add up to ' + U.num(got) + ', but the total is ' + this.total + '.';
    else msg = 'Your amounts add up to the total, but they are not in the ratio ' + this.parts.join(':') + '.';
    return { ok: false, message: msg };
  };

  SplitQ.prototype.barHtml = function (showValues) {
    var self = this, html = '<div class="bar-model" aria-hidden="true">';
    this.parts.forEach(function (p, i) {
      html += '<div class="bar-row"><span class="bar-label">' + self.labels[i] + '</span><span class="bar-boxes">';
      for (var k = 0; k < p; k++) html += '<span class="bar-box c' + i + '">' + (showValues ? U.num(self.each) : '?') + '</span>';
      html += '</span></div>';
    });
    return html + '<p class="bar-total">' + sum(this.parts) + ' shares in all = ' + this.totalText() + '</p></div>';
  };

  SplitQ.prototype.hint = function () {
    return '<p>Split a total: <strong>add the parts first.</strong> ' + this.parts.join(' + ') + ' = ? shares. ' +
      'Divide the total by the shares to find one share, then multiply by each part.</p>' + this.barHtml(false);
  };

  SplitQ.prototype.solution = function () {
    var self = this, s = sum(this.parts);
    var html = '<ol><li>Add the parts: ' + this.parts.join(' + ') + ' = ' + s + ' shares.</li>' +
      '<li>One share: ' + (this.money ? '$' : '') + this.total + ' ÷ ' + s + ' = ' + this.fmt(this.each) + '.</li>';
    this.labels.forEach(function (lab, i) {
      html += '<li>' + lab + ': ' + self.parts[i] + ' × ' + U.num(self.each) + ' = <strong>' + self.fmt(self.answers[i]) + '</strong></li>';
    });
    return html + '<li>Check: ' + this.answers.join(' + ') + ' = ' + this.total + ' ✓</li></ol>' + this.barHtml(true);
  };

  SplitQ.prototype.lock = function () { U.disableAll(this.root); };

  window.RecipeMixer = { makeQuestion: makeQuestion, QUESTIONS: QUESTIONS };
  U.runRound({ id: 'recipe-mixer', questions: QUESTIONS, makeQuestion: makeQuestion });
})();
