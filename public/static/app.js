// Two small behaviours, kept in a file so the content security policy can forbid inline scripts.
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t && t.matches && t.matches('[data-autosubmit]') && t.form) t.form.submit();
});
document.addEventListener('click', (e) => {
  if (e.target.closest && e.target.closest('[data-print]')) window.print();
});
