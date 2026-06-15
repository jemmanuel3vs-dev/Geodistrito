import { state } from '../core/state.js';

/* =========================
   SECTIONS SEARCH
========================= */

export function getNearestSection(lat, lng) {
  if (!state.sectionCentroids.length) {
    return null;
  }

  const point = turf.point([lng, lat]);

  for (const section of state.sectionCentroids) {
    const inside = turf.booleanPointInPolygon(point, section.feature);

    if (inside) {
      return {
        section,
        inside: true
      };
    }
  }

  return null;
}
