
import {
  initLayers,
  initMap,
  loadPoints,
  loadSections,
  locateUser,
  locateFromLink,
  renderMapOverlay,
  setMapMode
} from '../map/map.js';

import {
  savePointRequest
} from '../services/points.service.js';

import {
  showError,
  showSuccess
} from '../ui/toast.js';

import { state } from '../core/state.js';

export async function initHome() {

  console.log(
    '🏠 Inicializando Home'
  );

  try {

    initMap();

    initLayers();

    await loadSections();

    await loadPoints();

    setMapMode(
  'markers'
);

    renderMapOverlay();

    setupEvents();

    console.log(
      '✅ Home lista'
    );

  } catch (error) {

    console.error(error);

    showError(
      'Error inicializando Home'
    );

  }

}

function setupEvents() {

  const btnMapHeat =
document.getElementById(
  'btnMapHeat'
);

  const btnMapMarkers =
document.getElementById(
  'btnMapMarkers'
);

const btnMapClusters =
document.getElementById(
  'btnMapClusters'
);

  const btnLoadLink =
  document.getElementById(
  'btnLoadLink'
  );

  const btnLocate =
    document.getElementById(
      'btnLocate'
    );

  const btnSave =
    document.getElementById(
      'btnSave'
    );

  if (btnLocate) {

    btnLocate.addEventListener(
      'click',
      locateUser
    );

  }

  if (btnSave) {

    btnSave.addEventListener(
      'click',
      savePoint
    );

  }

  if(btnLoadLink){

  btnLoadLink.addEventListener(
    'click',
    locateFromLink
  );

  }

  btnMapMarkers?.addEventListener(
  'click',
  () => {

    setMapMode(
      'markers'
    );

  }
);

btnMapClusters?.addEventListener(
  'click',
  () => {

    setMapMode(
      'clusters'
    );

  }
);

btnMapHeat?.addEventListener(
  'click',
  () => {

    setMapMode(
      'heat'
    );

  }
);

}

async function savePoint() {

  try {

    console.log('📝 Iniciando guardado de punto...');

    // Obtener valores del formulario
    const tipo = document.getElementById('pointType')?.value;
    const lat = state.currentLocation?.lat || parseFloat(document.getElementById('lat')?.textContent);
    const lng = state.currentLocation?.lng || parseFloat(document.getElementById('lng')?.textContent);
    const distrito = document.getElementById('nearest-district')?.textContent;
    const seccion = document.getElementById('nearest-section')?.textContent;
    const calle = document.getElementById('street')?.textContent;
    const colonia = document.getElementById('neighborhood')?.textContent;
    const municipio = document.getElementById('municipio')?.textContent;
    const encargado = document.getElementById('encargado')?.value;

    console.log('📦 Datos recolectados:', {
      tipo, lat, lng, distrito, seccion, calle, colonia, municipio, encargado
    });

    // Validar campos obligatorios
    if (!tipo || !tipo.trim()) {
      showError('Selecciona un tipo de punto');
      return;
    }

    if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
      showError('Debes obtener la ubicación primero (presiona "Encontrar ubicación")');
      return;
    }

    if (!distrito || distrito === '-') {
      showError('No se pudo determinar el distrito. Intenta con otra ubicación');
      return;
    }

    // Construir FormData
    const formData = new FormData();

    formData.append('tipo', tipo);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('distrito', distrito);
    formData.append('seccion', seccion && seccion !== '-' ? seccion : null);
    formData.append('calle', calle && calle !== '-' ? calle : 'No disponible');
    formData.append('colonia', colonia && colonia !== '-' ? colonia : 'No disponible');
    formData.append('municipio', municipio && municipio !== '-' ? municipio : 'No disponible');
    formData.append('encargado', encargado || null);

    // Agregar imagen si existe
    const imageInput = document.getElementById('imageUpload');
    if (imageInput?.files[0]) {
      console.log('📸 Imagen seleccionada:', imageInput.files[0].name);
      formData.append('image', imageInput.files[0]);
    }

    console.log('📤 Enviando FormData al servidor...');

    await savePointRequest(formData);

    showSuccess('✅ Punto guardado exitosamente');

    // Limpiar formulario
    document.getElementById('pointType').value = 'bardas';
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('encargado').value = '';

  } catch (error) {

    console.error('❌ Error guardando punto:', error);

    showError(
      error.message || 'Error guardando punto'
    );

  }

}
