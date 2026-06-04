import { state } from '../core/state.js';

let coloniasLayer = null;

export async function loadColoniasDistrito20() {

  console.log(
    '🚀 loadColoniasDistrito20 iniciado'
  );

  try {

    const response =
      await fetch(
        './data/colonias_distrito20.geojson'
      );

   

    const geojson =
      await response.json();




    console.log(
      '📍 Primera coordenada:',
      geojson.features[0]
        ?.geometry
    );

    coloniasLayer =
      L.geoJSON(
        geojson,
        {
          color: '#ff6600',
          weight: 2,
          fillOpacity: 0.15,

          onEachFeature(
            feature,
            layer
          ) {

            layer.bindPopup(`
              <strong>
                ${feature.properties.NOMBRE}
              </strong>
            `);

          }

        }
      );



    coloniasLayer.addTo(
      state.map
    );





  } catch(error){



  }

}

export function showColoniasDistrito20() {

  if (
    coloniasLayer &&
    !state.map.hasLayer(
      coloniasLayer
    )
  ) {

    coloniasLayer.addTo(
      state.map
    );

  }

}

export function hideColoniasDistrito20() {

  if (
    coloniasLayer &&
    state.map.hasLayer(
      coloniasLayer
    )
  ) {

    state.map.removeLayer(
      coloniasLayer
    );

  }

}