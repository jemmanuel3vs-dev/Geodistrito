
/* ELEMENTOS DOM */

const latEl =
document.getElementById('lat');

const lngEl =
document.getElementById('lng');

const nearestDistrictEl =
document.getElementById('nearest-district');

const nearestSectionEl =
document.getElementById('nearest-section');

const streetEl =
document.getElementById('street');

const neighborhoodEl =
document.getElementById('neighborhood');

const municipioEl =
document.getElementById('municipio');

const pointsBody =
document.getElementById('pointsBody');

/* BOTONES */

const btnLocate =
document.getElementById('btnLocate');

const btnSave =
document.getElementById('btnSave');

const btnExport =
document.getElementById('btnExport');

const btnLoadLink =
document.getElementById('btnLoadLink');

const btnApplyFilters =
document.getElementById('btnApplyFilters');

const btnClearFilters =
document.getElementById(
  'btnClearFilters'
);

/* FORMULARIO */

const pointType =
document.getElementById('pointType');

const encargadoInput =
document.getElementById('encargado');

const locationLinkInput =
document.getElementById('locationLink');

const imageUpload =
document.getElementById('imageUpload');

const imagePreview =
document.getElementById('imagePreview');

/* FILTROS */

const filterType =
document.getElementById('filterType');

const filterDistrict =
document.getElementById('filterDistrict');

const filterSection =
document.getElementById('filterSection');

const filterMunicipio =
document.getElementById('filterMunicipio');

const filterEncargado =
document.getElementById('filterEncargado');

/*  EVENTOS INICIALES */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    const mapContainer = document.getElementById('map');

    if (mapContainer) {
      initMap();
      initUserLocation();
      initLayers();
      await loadSections();
    }

    setupUI();
    setupEvents();

    await loadSavedPoints();

  }
);

/* CONFIGURAR EVENTOS */

function setupEvents() {

  /* UBICACIÓN */

  if (btnLocate) {
    btnLocate.addEventListener(
      'click',
      locateUser
    );
  }

  if (btnLoadLink) {
    btnLoadLink.addEventListener(
      'click',
      locateFromLink
    );
  }

  /* GUARDAR */

  if (btnSave) {
    btnSave.addEventListener(
      'click',
      savePoint
    );
  }

  /* EXPORTAR */

  const btnExportExcel = document.getElementById('btnExportExcel');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnExportGeoJson = document.getElementById('btnExportGeoJson');

  if (btnExportExcel) {
    btnExportExcel.addEventListener(
      'click',
      exportToExcel
    );
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportToCsv);
  }

  if (btnExportGeoJson) {
    btnExportGeoJson.addEventListener('click', exportToGeoJSON);
  }

  /* FILTROS */

  if (btnApplyFilters) {
    btnApplyFilters.addEventListener(
      'click',
      applyFilters
    );
  }

  if (btnClearFilters) {
    btnClearFilters.addEventListener(
      'click',
      resetFilters
    );
  }

  /* IMAGEN PREVIEW */

  if (imageUpload) {
    imageUpload.addEventListener(
      'change',
      handleImagePreview
    );
  }

  /* TIPO DE PUNTO */

  if (pointType) {
    pointType.addEventListener(
      'change',
      toggleCommitteeFields
    );
  }

  /* TABLA DE REGISTROS */

  if (pointsBody) {
    pointsBody.addEventListener(
      'click',
      handlePointsTableClick
    );
  }

}

/*  PREVIEW DE IMAGEN */

function handleImagePreview(event) {

  const file =
  event.target.files[0];

  if (!file) {

    imagePreview.style.display =
    'none';

    return;

  }

  const allowedTypes = [

    'image/jpeg',
    'image/png',
    'image/webp'

  ];

  if (
    !allowedTypes.includes(file.type)
  ) {

    showError(
      'Formato de imagen no permitido'
    );

    imageUpload.value = '';

    return;
  }

  const maxSize =
  5 * 1024 * 1024;

  if (file.size > maxSize) {

    showError(
      'La imagen supera 5MB'
    );

    imageUpload.value = '';

    return;
  }

  const reader =
  new FileReader();

  reader.onload = (e) => {

    imagePreview.src =
    e.target.result;

    imagePreview.style.display =
    'block';

  };

  reader.readAsDataURL(file);

}

/* MOSTRAR CAMPOS DE COMITÉ*/

function toggleCommitteeFields() {

  const committeeFields =
  document.getElementById(
    'committeeFields'
  );

  if (
    pointType.value === 'comites'
  ) {

    committeeFields.style.display =
    'block';

  } else {

    committeeFields.style.display =
    'none';

    encargadoInput.value = '';

  }

}


function locateUser() {

  if (!navigator.geolocation) {

    showError(
      'Tu navegador no soporta geolocalización'
    );

    return;

  }

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      const lat =
      position.coords.latitude;

      const lng =
      position.coords.longitude;

      await updateCurrentLocation(
        lat,
        lng
      );

      showSuccess(
        'Ubicación encontrada'
      );

    },

    (error) => {

      showError(
        error.message
      );

    },

    {
      enableHighAccuracy: true,
      timeout: 15000
    }

  );

}

/*  EXTRAER COORDENADAS*/

function extractCoordinatesFromGoogleMapsLink(link){

  try{

    /*  FORMATO:
       @23.2549674,-106.3815544 */

    let match = link.match(
      /@(-?\d+\.\d+),(-?\d+\.\d+)/
    );

    if(match){

      return {

        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])

      };

    }

    /* FORMATO:
       !3d23.2553333!4d-106.3810833*/

    match = link.match(
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
    );

    if(match){

      return {

        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])

      };

    }

    return null;

  }catch(error){

    console.error(error);

    return null;

  }

}

/* UBICACIÓN DESDE LINK */

async function locateFromLink(){

  const link =
  locationLinkInput.value.trim();

  if(!link){

    showError(
      'Pega un link de Google Maps'
    );

    return;

  }

  const coords =
  extractCoordinatesFromGoogleMapsLink(link);

  if(!coords){

    showError(
      'No se pudieron extraer coordenadas'
    );

    return;

  }

  console.log(
    'Coordenadas extraídas:',
    coords
  );

  await updateCurrentLocation(

    coords.lat,
    coords.lng

  );

  showSuccess(
    'Ubicación cargada desde link'
  );

}

/* GUARDAR PUNTO */

async function savePoint(){

  if (!isAuthenticated()) {
    showError('Debes iniciar sesión para registrar un punto');
    window.location.href = 'login.html';
    return;
  }

  if(!validateForm()){
    return;
  }

  if(!state.currentLocation){

    showError(
      'Primero obtén una ubicación'
    );

    return;

  }

  const formData =
  new FormData();

  formData.append(
    'tipo',
    pointType.value
  );

  formData.append(
    'lat',
    state.currentLocation.lat
  );

  formData.append(
    'lng',
    state.currentLocation.lng
  );

  formData.append(
    'distrito',
    state.currentLocation.distrito
  );

  formData.append(
    'seccion',
    state.currentLocation.seccion
  );

  formData.append(
    'calle',
    state.currentLocation.calle
  );

  formData.append(
    'colonia',
    state.currentLocation.colonia
  );

  formData.append(
    'municipio',
    state.currentLocation.municipio
  );

  formData.append(
    'encargado',
    encargadoInput.value
  );

  const imageFile =
  imageUpload.files[0];

  if(imageFile){

    formData.append(
      'image',
      imageFile
    );

  }

  try{

    await savePointRequest(
      formData
    );

    clearForm();

    await reloadAllData();

    showSuccess(
      'Punto guardado correctamente'
    );

  } catch(error){

    console.error(error);

    showError(
      'Error guardando punto'
    );

  }

}

/* LIMPIAR FORMULARIO */

function clearForm() {

  imageUpload.value = '';

  imagePreview.src = '';

  imagePreview.style.display =
  'none';

  encargadoInput.value = '';

  locationLinkInput.value = '';

}

/* RENDER TABLA */

function renderPoints(
  points = state.points
) {

  if (!pointsBody) {
    return;
  }

  if (!points.length) {

    pointsBody.innerHTML = `
      <tr>
        <td colspan="8">
          No hay registros aún
        </td>
      </tr>
    `;

    updateStatistics(points);
    return;

  }

  pointsBody.innerHTML =
    points.map(createPointRow).join('');

  updateStatistics(points);

}

function createPointRow(point) {
  const authUser = typeof getAuthUser === 'function' ? getAuthUser() : null;
  const hasEditPermissions = authUser?.rol === 'admin';

  return `
    <tr data-point-id="${point.id}">
      <td>${escapeHTML(point.tipo)}</td>
      <td>${escapeHTML(point.distrito)}</td>
      <td>${escapeHTML(String(point.seccion))}</td>
      <td>${escapeHTML(point.municipio)}</td>
      <td>${escapeHTML(point.calle)}</td>
      <td>${escapeHTML(point.colonia)}</td>
      <td>${escapeHTML(point.encargado || '-')}</td>
      <td>
        ${hasEditPermissions ? `
          <button type="button" data-action="edit" class="btn-edit">Editar</button>
          <button type="button" data-action="delete" class="btn-delete">Eliminar</button>
        ` : '<span style="color:#94a3b8;">Sin permiso</span>'}
      </td>
    </tr>
  `;
}

function updateStatistics(points = state.points) {
  const totalElement = document.getElementById('statsTotal');
  const byTypeElement = document.getElementById('statsByType');
  const filteredTotalElement = document.getElementById('statsFilteredTotal');

  if (!totalElement && !byTypeElement && !filteredTotalElement) {
    return;
  }

  const total = points.length;
  const counts = points.reduce((acc, point) => {
    const type = point.tipo || 'Desconocido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  if (totalElement) {
    totalElement.textContent = total;
  }

  if (filteredTotalElement) {
    filteredTotalElement.textContent = total;
  }

  if (byTypeElement) {
    byTypeElement.innerHTML = Object.entries(counts)
      .map(([type, count]) => `
        <div class="stat-row">
          <span>${escapeHTML(type)}</span>
          <strong>${count}</strong>
        </div>
      `)
      .join('');
  }
}

function handlePointsTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const row = button.closest('tr');
  const id = Number(row?.dataset.pointId);
  if (!id) return;

  if (button.dataset.action === 'edit') {
    openEditModalById(id);
    return;
  }

  if (button.dataset.action === 'delete') {
    deletePoint(id);
    return;
  }
}

/* EDITAR PUNTO*/

function editPoint(id) {
  openEditModalById(id);
}

async function openEditModalById(id) {
  const point = state.points.find(
    p => p.id === id
  );

  if (!point) {
    showError(
      'Punto no encontrado'
    );
    return;
  }

  if (typeof openEditModal === 'function') {
    openEditModal(point);
  } else {
    showError(
      'No es posible editar en este momento'
    );
  }
}

async function saveEditedPoint() {
  const modal = document.getElementById('editModal');
  if (!modal) return;

  const id = Number(modal.dataset.pointId);
  const point = state.points.find(p => p.id === id);

  if (!point) {
    showError('Punto no encontrado');
    return;
  }

  const tipo = document.getElementById('modalPointType')?.value?.trim();
  const distrito = document.getElementById('modalDistrito')?.value?.trim();
  const seccion = document.getElementById('modalSeccion')?.value?.trim();
  const calle = document.getElementById('modalCalle')?.value?.trim();
  const colonia = document.getElementById('modalColonia')?.value?.trim();
  const municipio = document.getElementById('modalMunicipio')?.value?.trim();
  const encargado = document.getElementById('modalEncargado')?.value?.trim();

  if (!tipo || !distrito || !seccion || !calle || !colonia || !municipio) {
    showError('Completa todos los campos requeridos');
    return;
  }

  try {
    await updatePuntoRequest(id, {
      tipo,
      distrito,
      seccion,
      calle,
      colonia,
      municipio,
      encargado
    });

    closeEditModal();
    await reloadAllData();
    showSuccess('Cambios guardados correctamente');

  } catch (error) {
    console.error(error);
    if (error.message.includes('Token')) {
      clearAuthData();
      window.location.href = 'login.html';
      return;
    }
    showError('Error guardando cambios');
  }
}

async function loadPointObservation(pointId) {
  try {
    const [observation, history] = await Promise.all([
      fetchLatestObservation(pointId),
      fetchAuditHistory(pointId)
    ]);

    renderLatestObservation(observation);
    renderAuditHistory(history);
  } catch (error) {
    console.error('Error cargando observaciones:', error);
    const latestEl = document.getElementById('modalLatestObservation');
    if (latestEl) {
      latestEl.innerHTML = '<p class="text-muted">No fue posible cargar observaciones.</p>';
    }
  }
}

function renderLatestObservation(observation) {
  const latestEl = document.getElementById('modalLatestObservation');
  if (!latestEl) return;

  if (!observation) {
    latestEl.innerHTML = '<p class="text-muted">Sin observaciones registradas aún.</p>';
    return;
  }

  latestEl.innerHTML = `
    <div class="observation-card">
      <p><strong>Última observación:</strong></p>
      <p>${escapeHTML(observation.comentario)}</p>
      <p><strong>Prioridad:</strong> ${escapeHTML(observation.prioridad)}</p>
      <p class="text-muted">Por ${escapeHTML(observation.usuario_nombre || observation.usuario_email || 'Usuario')} el ${new Date(observation.created_at).toLocaleString('es-MX')}</p>
    </div>
  `;
}

function renderAuditHistory(history = []) {
  const auditEl = document.getElementById('modalAuditHistory');
  if (!auditEl) return;

  if (!Array.isArray(history) || history.length === 0) {
    auditEl.innerHTML = '<p class="text-muted">No hay historial de auditoría.</p>';
    return;
  }

  auditEl.innerHTML = `
    <h3>Historial de auditoría</h3>
    <div class="audit-list">
      ${history.slice(0, 5).map(entry => `
        <div class="audit-item">
          <p><strong>${escapeHTML(entry.usuario_nombre || entry.usuario_email || 'Usuario')}</strong> cambió de <strong>${escapeHTML(entry.estado_anterior)}</strong> a <strong>${escapeHTML(entry.estado_nuevo)}</strong></p>
          <p class="text-muted">${new Date(entry.created_at).toLocaleString('es-MX')}</p>
          ${entry.comentario ? `<p>${escapeHTML(entry.comentario)}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

async function saveObservation() {
  const modal = document.getElementById('editModal');
  if (!modal) return;

  const pointId = Number(modal.dataset.pointId);
  const comentario = document.getElementById('modalObservationComment')?.value?.trim();
  const prioridad = document.getElementById('modalObservationPriority')?.value || 'MEDIUM';

  if (!comentario) {
    showError('Escribe un comentario antes de guardar.');
    return;
  }

  try {
    await createObservationRequest(pointId, comentario, prioridad);
    document.getElementById('modalObservationComment').value = '';
    showSuccess('Observación registrada correctamente');
    await loadPointObservation(pointId);
  } catch (error) {
    console.error(error);
    showError('No se pudo crear la observación');
  }
}

async function changePointState() {
  const modal = document.getElementById('editModal');
  if (!modal) return;

  const pointId = Number(modal.dataset.pointId);
  const estado = document.getElementById('modalPointState')?.value;
  const comentario = document.getElementById('modalStateComment')?.value?.trim();

  if (!estado) {
    showError('Selecciona un estado válido.');
    return;
  }

  try {
    await updatePuntoStateRequest(pointId, estado, comentario);
    showSuccess('Estado actualizado correctamente');
    await reloadAllData();
    await loadPointObservation(pointId);
  } catch (error) {
    console.error(error);
    showError('No se pudo cambiar el estado');
  }
}

/* ELIMINAR PUNTO*/

async function deletePoint(id) {

  const confirmDelete = confirm(
    '¿Eliminar este punto?'
  );

  if(!confirmDelete){

    return;

  }

  try {

    await deletePuntoRequest(id);

    await reloadAllData();

    showSuccess(
      'Punto eliminado'
    );

  } catch(error){

    console.error(error);

    showError(
      'Error eliminando'
    );

  }

}

/* FILTRAR REGISTROS*/

function applyFilters() {

  const type =
  filterType.value
  .toLowerCase();

  const district =
  filterDistrict.value
  .trim()
  .toLowerCase();

  const section =
  filterSection.value
  .trim()
  .toLowerCase();

  const municipio =
  filterMunicipio.value
  .trim()
  .toLowerCase();

  const encargado =
  filterEncargado.value
  .trim()
  .toLowerCase();

  const filtered =
state.points.filter((point) => {

  const matchType =

    type === 'all'

    ||

    String(point.tipo || '')
    .toLowerCase() === type;

  const matchDistrict =

    !district

    ||

    String(point.distrito || '')
    .toLowerCase()
    .includes(district);

  const matchSection =

    !section

    ||

    String(point.seccion || '')
    .toLowerCase()
    .includes(section);

  const matchMunicipio =

    !municipio

    ||

    String(point.municipio || '')
    .toLowerCase()
    .includes(municipio);

  const matchEncargado =

    !encargado

    ||

    String(point.encargado || '')
    .toLowerCase()
    .includes(encargado);

  return (

    matchType &&
    matchDistrict &&
    matchSection &&
    matchMunicipio &&
    matchEncargado

  );

});

  state.filteredPoints = filtered;
  renderPoints(filtered);

  renderMapOverlay(filtered);

  showSuccess(
    `${filtered.length} registros encontrados`
  );

  if (typeof updateDashboardData === 'function') {
    updateDashboardData();
  }

}

/* ======================================================
   RENDERIZAR MARKERS FILTRADOS
====================================================== */

function renderFilteredMarkers(points) {

  clearAllMarkers();

  points.forEach((point) => {

    addMarker(point);

  });

}

/* ======================================================
   LIMPIAR TODOS LOS MARKERS
====================================================== */

function clearAllMarkers() {

  Object.values(state.layers)
  .forEach((layer) => {

    layer.clearLayers();

  });

  state.savedMarkers = [];

}

/* ======================================================
   CARGAR PUNTOS GUARDADOS
====================================================== */

async function loadSavedPoints() {

  try {

    const points =
    await getAllPoints();

    if (!Array.isArray(points)) {

      throw new Error(
        'Respuesta inválida'
      );

    }

    clearAllMarkers();

    const mappedPoints = points.map((point) => ({
      id: point.id,
      tipo: point.tipo,
      lat: Number(point.lat),
      lng: Number(point.lng),
      distrito: point.distrito,
      seccion: point.seccion,
      calle: point.calle,
      colonia: point.colonia,
      municipio: point.municipio,
      encargado: point.encargado,
      url: point.url,
      estado: point.estado,
      usuario_id: point.usuario_id,
      created_at: point.created_at,
      updated_at: point.updated_at
    }));

    setPoints(mappedPoints);

    renderPoints();

    if (state.map) {
      renderMapOverlay(state.points);
    }

    console.log(
      'Puntos cargados:',
      state.points.length
    );

  } catch (error) {

    console.error(
      'Error cargando puntos:',
      error
    );

    showError(
      'No se pudieron cargar los registros'
    );

  }

}

/* ======================================================
   RECARGAR TODO
====================================================== */

async function reloadAllData() {

  clearAllMarkers();

  await loadSavedPoints();

  renderPoints();

}

/* ======================================================
   RESETEAR FILTROS
====================================================== */

function resetFilters() {

  if (filterType) filterType.value = 'all';
  if (filterDistrict) filterDistrict.value = '';
  if (filterSection) filterSection.value = '';
  if (filterMunicipio) filterMunicipio.value = '';
  if (filterEncargado) filterEncargado.value = '';

  state.filteredPoints = state.points;

  renderPoints();

  if (typeof renderMapOverlay === 'function') {
    renderMapOverlay(state.points);
  }

  updateStatistics(state.points);

  if (typeof updateDashboardData === 'function') {
    updateDashboardData();
  }

}

/* ======================================================
   VALIDAR FORMULARIO
====================================================== */

function validateForm() {

  if (!state.currentLocation) {

    showError(
      'Selecciona una ubicación'
    );

    return false;

  }

  if (!pointType.value) {

    showError(
      'Selecciona un tipo'
    );

    return false;

  }

  if (

    pointType.value === 'comites'

    &&

    !encargadoInput.value.trim()

  ) {

    showError(
      'Ingresa encargado'
    );

    return false;

  }

  return true;

}

/* ======================================================
   ACTUALIZAR INFO EN UI
====================================================== */

function updateLocationUI(location) {

  latEl.textContent =
  location.lat.toFixed(6);

  lngEl.textContent =
  location.lng.toFixed(6);

  nearestDistrictEl.textContent =
  location.distrito;

  nearestSectionEl.textContent =
  location.seccion;

  streetEl.textContent =
  location.calle;

  neighborhoodEl.textContent =
  location.colonia;

  municipioEl.textContent =
  location.municipio;

}

/* ======================================================
   MENSAJES
====================================================== */

function showSuccess(message) {

  console.log(
    'SUCCESS:',
    message
  );

  showMessage(message, 'success');

}

function showError(message) {

  console.error(
    'ERROR:',
    message
  );

  showMessage(message, 'error');

}

/* ======================================================
   ACTUALIZAR UBICACIÓN GLOBAL
====================================================== */

async function updateCurrentLocation(
  lat,
  lng
) {

  try {

    const address =
    await getAddress(
      lat,
      lng
    );

    const nearestDistrict =
    getNearestDistrict(
      lat,
      lng
    );

    const nearestSection =
    getNearestSection(
      lat,
      lng
    );

    state.currentLocation = {

      lat,
      lng,

      distrito:
      nearestDistrict?.district
      ?.name || 'Sin distrito',

      seccion:
      nearestSection?.section
      ?.seccion || 'Sin sección',

      calle:
      address.calle,

      colonia:
      address.colonia,

      municipio:
      address.municipio

    };

    updateLocationUI(state.currentLocation);

    updateMapLocation(
      lat,
      lng
    );

    /* FIX 6: actualizar marcador de usuario */
    setUserMarker(lat, lng);

  } catch (error) {

    console.error(error);

    showError(
      'Error actualizando ubicación'
    );

  }

}

/* ======================================================
   ACTUALIZAR MAPA
====================================================== */

function updateMapLocation(
  lat,
  lng
) {

  if (!state.marker) return;

  state.marker.setLatLng([
    lat,
    lng
  ]);

  if(state.circle){

    state.circle.setLatLng([
      lat,
      lng
    ]);

  }

  state.map.setView(
    [lat, lng],
    16
  );

}


/* ======================================================
   EXPORTAR ESTADO
====================================================== */

function getAppState() {

  return {

    totalPoints:
    state.points.length,

    currentLocation:
    state.currentLocation,

    markers:
    state.savedMarkers.length

  };

}

/* ======================================================
   DEBUG INFO
====================================================== */

function debugApp() {

  console.log('==========');

  console.log('STATE');

  console.log(state);

  console.log('==========');

}

/* ======================================================
   AUTO REFRESH OPCIONAL
====================================================== */

function startAutoRefresh() {

  setInterval(async () => {

    try {

      await reloadAllData();

    } catch (error) {

      console.error(
        'Auto refresh error:',
        error
      );

    }

  }, 60000);

}

/* ======================================================
   ATAJOS TECLADO
====================================================== */

document.addEventListener(
  'keydown',
  (event) => {

    /* CTRL + S */

    if (

      event.ctrlKey

      &&

      event.key === 's'

    ) {

      event.preventDefault();

      savePoint();

    }

    /* CTRL + F */

    if (

      event.ctrlKey

      &&

      event.key === 'f'

    ) {

      event.preventDefault();

      if (filterDistrict) {
        filterDistrict.focus();
      }

    }

  }
);

/* ======================================================
   EXPONER FUNCIONES GLOBALES
====================================================== */

window.GeoDistrito = {

  reloadAllData,

  resetFilters,

  debugApp,

  getAppState

};

function escapeHTML(text) {

  return String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

}