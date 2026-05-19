
/* ======================================================
   CONFIGURAR UI
====================================================== */

function setupUI() {

  setupResponsive();

  setupInputs();

  setupAnimations();

  initEditModal();

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

function initEditModal() {
  if (document.getElementById('editModal')) {
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'editModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h2>Editar registro</h2>
      <form id="editModalForm" class="modal-form">
        <label for="modalPointType">Tipo</label>
        <select id="modalPointType">
          <option value="bardas">Bardas</option>
          <option value="lonas">Lonas</option>
          <option value="comites">Comités</option>
          <option value="casillas">Casillas</option>
        </select>
        <label for="modalDistrito">Distrito</label>
        <input id="modalDistrito" type="text" placeholder="Distrito">
        <label for="modalSeccion">Sección</label>
        <input id="modalSeccion" type="text" placeholder="Sección">
        <label for="modalCalle">Calle</label>
        <input id="modalCalle" type="text" placeholder="Calle">
        <label for="modalColonia">Colonia</label>
        <input id="modalColonia" type="text" placeholder="Colonia">
        <label for="modalMunicipio">Municipio</label>
        <input id="modalMunicipio" type="text" placeholder="Municipio">
        <label for="modalEncargado">Encargado</label>
        <input id="modalEncargado" type="text" placeholder="Encargado">

        <h3>Observaciones</h3>
        <div id="modalLatestObservation" class="observation-history">
          <p class="text-muted">Cargando última observación...</p>
        </div>
        <label for="modalObservationComment">Nuevo comentario</label>
        <textarea id="modalObservationComment" rows="4" placeholder="Escribe una observación"></textarea>
        <label for="modalObservationPriority">Prioridad</label>
        <select id="modalObservationPriority">
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="LOW">Baja</option>
        </select>
        <button type="button" id="modalAddObservationBtn" class="btn-secondary">Agregar observación</button>

        <h3>Estado del punto</h3>
        <label for="modalPointState">Estado</label>
        <select id="modalPointState">
          <option value="pendiente">Pendiente</option>
          <option value="revisión">Revisión</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <label for="modalStateComment">Comentario de estado</label>
        <input id="modalStateComment" type="text" placeholder="Comentario para la actualización de estado">
        <button type="button" id="modalChangeStateBtn" class="btn-secondary">Cambiar estado</button>

        <div class="modal-actions">
          <button type="button" id="modalCancelBtn" class="btn-delete">Cancelar</button>
          <button type="submit" id="modalSaveBtn" class="btn-edit">Guardar cambios</button>
        </div>
      </form>
      <div id="modalAuditHistory" class="audit-history"></div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeEditModal();
    }
  });

  const cancelButton = document.getElementById('modalCancelBtn');
  const form = document.getElementById('editModalForm');
  const addObservationButton = document.getElementById('modalAddObservationBtn');
  const changeStateButton = document.getElementById('modalChangeStateBtn');

  if (cancelButton) {
    cancelButton.addEventListener('click', closeEditModal);
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (typeof saveEditedPoint === 'function') {
        saveEditedPoint();
      }
    });
  }

  if (addObservationButton) {
    addObservationButton.addEventListener('click', () => {
      if (typeof saveObservation === 'function') {
        saveObservation();
      }
    });
  }

  if (changeStateButton) {
    changeStateButton.addEventListener('click', () => {
      if (typeof changePointState === 'function') {
        changePointState();
      }
    });
  }
}

function openEditModal(point) {
  initEditModal();

  const modal = document.getElementById('editModal');
  if (!modal) return;

  modal.dataset.pointId = point.id;
  document.getElementById('modalPointType').value = point.tipo || 'bardas';
  document.getElementById('modalDistrito').value = point.distrito || '';
  document.getElementById('modalSeccion').value = point.seccion || '';
  document.getElementById('modalCalle').value = point.calle || '';
  document.getElementById('modalColonia').value = point.colonia || '';
  document.getElementById('modalMunicipio').value = point.municipio || '';
  document.getElementById('modalEncargado').value = point.encargado || '';
  document.getElementById('modalPointState').value = point.estado || 'pendiente';
  document.getElementById('modalObservationComment').value = '';
  document.getElementById('modalStateComment').value = '';

  modal.classList.add('open');

  if (typeof loadPointObservation === 'function') {
    loadPointObservation(point.id);
  }
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.remove('open');
  }
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