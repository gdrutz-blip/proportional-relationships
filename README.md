# Zuri's Smoothie Truck: Unit 3 practice games

Practice games for Grade 8 math (Ontario: B1.4, B2.1, B2.8), all set at Zuri's Smoothie Truck.

- Plain HTML, CSS and JavaScript. No frameworks, no build step, no backend.
- No logins and no student data. Stars are saved in `localStorage` on the device only.
  The Content-Security-Policy (`connect-src 'none'`) stops the pages from sending anything anywhere.

## What's here

| Path | What it is |
|---|---|
| `index.html` | Home screen: the truck map, one tile per game. A tile gets a star once that game is completed. |
| `best-buy/` | Lesson 2 game: compare two price tags by unit price. |
| `assets/js/common.js` | Shared code: name list, answer checking, saved stars, and the round engine (hint after one wrong try, worked solution after two). |
| `assets/js/best-buy.js` | Best Buy question generator, hint (double number line) and worked solution. |
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
