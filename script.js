btsToggleBtn.addEventListener('click', () => {
  btsSection.classList.toggle('show');
  btsToggleBtn.textContent = btsSection.classList.contains('show') ? 'Hide Behind the Scenes' : 'Show Behind the Scenes';
});
