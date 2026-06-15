import { state } from '../core/state.js';

/* =========================
   SECTIONS STYLE
========================= */

export function getDistrictColor(distrito) {
  switch (Number(distrito)) {
    case 20:
      return '#ef4444';
    case 21:
      return '#3b82f6';
    case 22:
      return '#22c55e';
    case 23:
      return '#f59e0b';
    case 24:
      return '#a855f7';
    default:
      return '#64748b';
  }
}

export function highlightFeature(e) {
  const layer = e.target;

  layer.setStyle({
    weight: 3,
    color: '#000',
    fillOpacity: 0.75
  });
}

export function resetHighlight(e) {
  state.sectionsLayer.resetStyle(e.target);
}
