// Google Analytics 4 — shared by every page.
// Change MEASUREMENT_ID here if the GA4 property changes; nothing else needs editing.
(function () {
  var MEASUREMENT_ID = 'G-G9Y2K00DBT';

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);
})();
