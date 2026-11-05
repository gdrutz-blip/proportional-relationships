# Zuri's Smoothie Truck: Unit 3 practice games

Practice games for Grade 8 math (Ontario: B1.4, B2.1, B2.8), all set at Zuri's Smoothie Truck.

- Plain HTML, CSS and JavaScript. No frameworks, no build step, no backend.
- No logins and no student data. Stars are saved in `localStorage` on the device only.
  The Content-Security-Policy (`connect-src 'none'`) stops the pages from sending anything anywhere.

## What's here

| Path | What it is |
|---|---|
| `index.html` | Home screen: the truck map, one tile per game. A tile gets a star once that game is completed. |
| `recipe-mixer/` | Lesson 1 game: scale a recipe in a ratio table, or split a total in a ratio (bar model). |
| `best-buy/` | Lesson 2 game: compare two price tags by unit price. |
| `missing-ingredient/` | Lesson 3 game: pick the proportion with the same order on both sides, then solve it. |
| `percent-builder/` | Lesson 4 game: build a percent from 50%, 25%, 10%, 5% and 1% tiles on a double number line; last question finds the whole. |
| `price-board/` | Lesson 5 game: new price with a multiplier, percent change (÷ ORIGINAL), the original before an increase, two changes in a row. |
| `checkout/` | Lesson 6 game: a receipt that builds line by line: discount, HST (× 1.13), tip on the food before tax, rounding at the end. |
| `truck-fund/` | Lesson 7 game: I = Prt, months to years, total vs interest, find the time or rate, and choose a plan to reach a goal. |
| `festival-boss/` | Lesson 8 boss: 5 multi-step problems; students pick the tool for each step, then solve it. |
| `teacher/` | Teacher page: how to use the site, games by lesson and expectation, privacy notes, QR code. |
| `assets/img/site-qr.svg`, `site-qr.png` | QR code for the site (made offline, no QR service). |
| `assets/js/common.js` | Shared code: name list, answer checking, saved stars, and the round engine (hint after one wrong try, worked solution after two). |
| `assets/js/<game>.js` | Each game's question generator, hint and worked solution. |
| `assets/css/style.css` | All styles. |
| `netlify.toml` | Netlify settings: no build, publish the repo root, privacy headers. |

## Adding the next game

1. Copy `best-buy/index.html` to a new folder (for example `recipe-mixer/index.html`) and change the title, icon and key move.
2. Write `assets/js/recipe-mixer.js` with a `makeQuestion(index, nextName)` that returns an object with
   `render`, `check`, `hint`, `solution` and `lock` (see the comment at the top of `runRound` in `common.js`).
3. On `index.html`, change that game's tile from `<div class="tile soon">` to `<a class="tile live" href="recipe-mixer/">`.

## Run it on your computer

Run a tiny local server from this folder (opening the file directly will not follow the game links):

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Matching the Unit 3 materials

- Flavours and recipes are the unit's: Berry Blast 2:3, Mango Rush 4:6, Green Machine 3:5, Tropical Twist 3:2, Peach Fizz 5:2.
- Numbers are kept friendly for no-calculator work, like the unit test.
- The tip is a percent of the food price before tax, as in the Lesson 6 handout.
- Money answers like 1.2 are accepted, with a reminder to write $1.20.
