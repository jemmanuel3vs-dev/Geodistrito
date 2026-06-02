import { state } from '../core/state.js';

import {
  locateUser,
  locateFromLink
} from './map.geolocation.js';

import {
  createBaseMap
} from './map.layers.js';

import {
  loadSections
} from './map.sections.js';

import {
  loadDistricts
} from './map.districts.js';

import {
  renderPoints
} from './map.markers.js';

/* =========================
   INIT MAP
========================= */

export function initMap() {

  state.map =
    createBaseMap();

}

/* =========================
   INIT LAYERS
========================= */

export function initLayers() {

  console.log(
    '🗺️ Layers inicializadas'
  );

}

/* =========================
   LOAD POINTS
========================= */

export async function loadPoints() {

  renderPoints();

}

/* =========================
   RENDER OVERLAY
========================= */

export function renderMapOverlay() {

  console.log(
    '🎨 Overlay renderizado'
  );

}

export {
  loadSections,
  loadDistricts,
  locateUser,
  locateFromLink
};
