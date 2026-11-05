/* Teacher page: the print button (kept in a file, since the site allows no inline scripts). */
(function () {
  'use strict';
  var btn = document.getElementById('print-page');
  if (btn) btn.addEventListener('click', function () { window.print(); });
})();
