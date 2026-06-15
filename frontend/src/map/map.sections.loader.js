import { state } from '../core/state.js';
import {
  getDistrictColor,
  highlightFeature,
  resetHighlight
} from './map.sections.style.js';
import { calculateCentroid } from './map.sections.utils.js';

/* =========================
   LOAD SECTIONS
========================= */

export function loadSections() {
  fetch('data/secciones.json')
    .then(response => response.json())
    .then(data => {
      const features = (data.features || []).filter(feature => {
        return feature && feature.geometry && feature.properties;
      });

      state.sectionCentroids = features.map(feature => {
        const centroid = calculateCentroid(feature.geometry.coordinates);

        return {
          ...feature.properties,
          lat: centroid[0],
          lng: centroid[1],
          feature
        };
      });

      state.sectionsLayer = L.geoJSON(
        {
          type: 'FeatureCollection',
          features
        },
        {
          pane: 'sectionsPane',
          style: feature => ({
            color: '#ffffff',
            weight: 1,
            fillColor: getDistrictColor(feature.properties.distrito_l),
            fillOpacity: 0.45
          }),
          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight
            });

            layer.bindPopup(`
              <div style="font-family: sans-serif; min-width: 180px;">
                <h3 style="margin:0 0 10px; color:#111827;">Sección Electoral</h3>
                <b>Distrito:</b> ${feature.properties.distrito_l}<br>
                <b>Sección:</b> ${feature.properties.seccion}<br>
                <b>Municipio:</b> ${feature.properties.municipio}
              </div>
            `);
          }
        }
      ).addTo(state.map);
    })
    .catch(console.error);
}
