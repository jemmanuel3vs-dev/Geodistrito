
/* ======================================================
   CONFIGURAR UI
====================================================== */

function setupUI() {

  setupResponsive();

  setupInputs();

  setupAnimations();

}

/* ======================================================
   RESPONSIVE
====================================================== */

function setupResponsive() {

  window.addEventListener(
    'resize',
    () => {

      if (state.map) {

        state.map.invalidateSize();

      }

    }
  );

}

/* ======================================================
   INPUTS
====================================================== */

function setupInputs() {

  const searchInput =
    document.getElementById('searchInput');

  if (searchInput) {

    searchInput.addEventListener(
      'input',
      debounce(() => {

        if (typeof filterPoints === 'function') {

          filterPoints();

        }

      }, 300)
    );

  }

}

/* ======================================================
   ANIMACIONES
====================================================== */

function setupAnimations() {

  document.body.classList.add('loaded');

}

/* ======================================================
   UTILIDADES
====================================================== */

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

/* ======================================================
   MENSAJES
====================================================== */

function showMessage(message, type = 'info') {

  const existing =
    document.querySelector('.custom-message');

  if (existing) {

    existing.remove();

  }

  const div = document.createElement('div');

  div.className =
    `custom-message ${type}`;

  div.textContent = message;

  document.body.appendChild(div);

  setTimeout(() => {

    div.classList.add('show');

  }, 10);

  setTimeout(() => {

    div.classList.remove('show');

    setTimeout(() => {

      div.remove();

    }, 300);

  }, 3000);

}