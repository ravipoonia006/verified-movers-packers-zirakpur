(() => {
  const date = document.getElementById('todayDate');
  const year = document.getElementById('yearNow');
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const now = new Date();

  if (date) {
    date.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    }).format(now);
  }
  if (year) year.textContent = String(now.getFullYear());

  toggle?.addEventListener('click', () => {
    const opened = sidebar?.classList.toggle('is-open') ?? false;
    toggle.setAttribute('aria-expanded', String(opened));
  });

  document.addEventListener('click', (event) => {
    if (!sidebar || !toggle || !sidebar.classList.contains('is-open')) return;
    if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
    sidebar.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();
