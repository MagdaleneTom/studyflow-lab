/* Shared interactions used on every page of StudyFlow. */
(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const yearElements = document.querySelectorAll('[data-year]');
  const THEME_KEY = 'studyflow_theme_v1';

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); }
    catch { return null; }
  }

  function saveTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); }
    catch { /* The theme still works for the current page. */ }
  }

  function applyTheme(value) {
    root.dataset.theme = value;
    if (themeButton) {
      const dark = value === 'dark';
      themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      themeButton.setAttribute('aria-pressed', String(dark));
      const icon = themeButton.querySelector('.theme-icon');
      if (icon) icon.textContent = dark ? '☀' : '☾';
    }
  }

  applyTheme(getSavedTheme() === 'dark' ? 'dark' : 'light');
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  yearElements.forEach((element) => { element.textContent = String(new Date().getFullYear()); });

  // Guide page: an accessible accordion that reveals one explanation at a time.
  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = button.closest('.faq-item');
      const willOpen = !panel.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('open');
        item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      panel.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });
})();
