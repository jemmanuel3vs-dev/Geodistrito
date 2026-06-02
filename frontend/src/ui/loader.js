function setupUI() {
  setupResponsive();
  setupInputs();
  setupAnimations();
  initEditModal();
}

function setupResponsive() {
  window.addEventListener('resize', () => {
    if (!window.hasMap?.()) return;
    state.map.invalidateSize();
  });
}

function setupInputs() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      if (typeof filterPoints === 'function') {
        filterPoints();
      }
    }, 300));
  }
}

function setupAnimations() {
  document.body.classList.add('loaded');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
