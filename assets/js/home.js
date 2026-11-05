/* Home screen: show a star on each game tile that has been completed on this device. */
(function () {
  'use strict';

  function paint() {
    var progress = U3.loadProgress();
    var tiles = document.querySelectorAll('[data-game]');
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      var rec = progress[tile.getAttribute('data-game')];
      var old = tile.querySelector('.tile-badge');
      if (old) old.remove();
      tile.classList.remove('done');
      if (!tile.classList.contains('live')) continue;
      var status = tile.querySelector('.tile-status');
      if (rec && rec.done) {
        tile.classList.add('done');
        var badge = U3.el('span', 'tile-badge', '★');
        badge.setAttribute('aria-hidden', 'true');
        tile.appendChild(badge);
        status.innerHTML = '<span aria-hidden="true">' + U3.starsText(rec.best, 3) + '</span>' +
          '<span class="sr-only">Completed. Best: ' + rec.best + ' of 3 stars.</span> Play again';
      } else {
        status.textContent = 'Play';
      }
    }
  }

  document.getElementById('reset-progress').addEventListener('click', function () {
    if (window.confirm('Clear all your stars on this device?')) {
      U3.resetProgress();
      paint();
    }
  });

  // Repaint when coming back with the browser's Back button (page may be cached).
  window.addEventListener('pageshow', paint);
  paint();
})();
