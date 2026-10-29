(function () {
  var value = (window.JAXTON_CONFIG || {}).defaultTheme;
  try { value = localStorage.getItem('jaxton-theme-v2') || value; } catch (_) {}
  document.documentElement.dataset.theme = value === 'dark' ? 'dark' : 'light';
})();
