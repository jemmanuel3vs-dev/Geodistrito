/* ======================================================
   APP.JS
   CONTROL PRINCIPAL DE LA APLICACIÓN
====================================================== */

/* ======================================================
   ELEMENTOS DOM
====================================================== */

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

/* ======================================================
   EVENTOS INICIALES
====================================================== */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    initMap();

    initUserLocation();

    initLayers();

    loadSections();

    setupUI();

    setupEvents();

    fetchPoints();


  }
);

/* ======================================================
   CONFIGURAR EVENTOS
====================================================== */

function setupEvents() {

  /* UBICACIÓN */

  btnLocate.addEventListener(
    'click',
    locateUser
  );

  btnLoadLink.addEventListener(
    'click',
    locateFromLink
  );

  /* GUARDAR */

  btnSave.addEventListener(
    'click',
    savePoint
  );

  /* EXPORTAR */

  btnExport.addEventListener(
    'click',
    exportToExcel
  );

  /* FILTROS */

  btnApplyFilters.addEventListener(
    'click',
    applyFilters
  );

  /* IMAGEN PREVIEW */

  imageUpload.addEventListener(
    'change',
    handleImagePreview
  );

  /* TIPO DE PUNTO */

  pointType.addEventListener(
    'change',
    toggleCommitteeFields
  );

}

/* ======================================================
   PREVIEW DE IMAGEN
====================================================== */

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

/* ======================================================
   MOSTRAR CAMPOS DE COMITÉ
====================================================== */

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

/* ======================================================
   EXTRAER COORDENADAS
====================================================== */

function extractCoordinatesFromGoogleMapsLink(link){

  try{

    /* =========================
       FORMATO:
       @23.2549674,-106.3815544
    ========================= */

    let match = link.match(
      /@(-?\d+\.\d+),(-?\d+\.\d+)/
    );

    if(match){

      return {

        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])

      };

    }

    /* =========================
       FORMATO:
       !3d23.2553333!4d-106.3810833
    ========================= */

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

/* ======================================================
   UBICACIÓN DESDE LINK
====================================================== */

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

/* ======================================================
   GUARDAR PUNTO
====================================================== */

async function savePoint(){

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

/* ======================================================
   LIMPIAR FORMULARIO
====================================================== */

function clearForm() {

  imageUpload.value = '';

  imagePreview.src = '';

  imagePreview.style.display =
  'none';

  encargadoInput.value = '';

  locationLinkInput.value = '';

}

/* ======================================================
   RENDER TABLA
====================================================== */

function renderPoints(
  points = state.points
) {

  if (!points.length) {

    pointsBody.innerHTML = `
      <tr>
        <td colspan="7">
          No hay registros aún
        </td>
      </tr>
    `;

    return;

  }

  pointsBody.innerHTML =

  points.map((point) => `

    <tr>

      <td>
        ${escapeHTML(point.tipo)}
      </td>

      <td>
        ${escapeHTML(point.distrito)}
      </td>

      <td>
        ${escapeHTML(String(point.seccion))}
      </td>

      <td>
        ${escapeHTML(point.municipio)}
      </td>

      <td>
        ${escapeHTML(point.calle)}
      </td>

      <td>
        ${escapeHTML(point.colonia)}
      </td>

      <td>
        ${escapeHTML(point.encargado || '-')}
      </td>

    </tr>

  `).join('');

}

/* ======================================================
   APP.JS
   PARTE 2
   FILTROS + MARKERS + UTILIDADES
====================================================== */

/* ======================================================
   FILTRAR REGISTROS
====================================================== */

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

  renderPoints(filtered);

  renderFilteredMarkers(filtered);

  showSuccess(
    `${filtered.length} registros encontrados`
  );

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

    state.points =

    points.map((point) => ({

      tipo:
      point.tipo,

      lat:
      Number(point.lat),

      lng:
      Number(point.lng),

      distrito:
      point.distrito,

      seccion:
      point.seccion,

      calle:
      point.calle,

      colonia:
      point.colonia,

      municipio:
      point.municipio,

      encargado:
      point.encargado,

      url:
      point.url

    }));

    renderPoints();

    state.points.forEach((point) => {

      addMarker(point);

    });

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

  filterType.value =
  'all';

  filterDistrict.value =
  '';

  filterSection.value =
  '';

  filterMunicipio.value =
  '';

  filterEncargado.value =
  '';

  renderPoints();

  renderFilteredMarkers(
    state.points
  );

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

      filterDistrict.focus();

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

btnClearFilters.addEventListener(

  'click',

  resetFilters

);

function escapeHTML(text) {

  return String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

}