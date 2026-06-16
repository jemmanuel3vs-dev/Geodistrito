import { state } from '../core/state.js';

let coloniasLayer = null;

export async function loadColonias() {

    console.log("Cargando colonias...");

    try {

        const response =
            await fetch("data/colonias_20_24.geojson");

        const geojson =
            await response.json();

        coloniasLayer = L.geoJSON(
            geojson,
            {

                pane: "coloniasPane",

                style: {

                    color: "#ff6600",

                    weight: 2,

                    fillOpacity: 0.2

                },

                onEachFeature(feature, layer) {

                    const nombre =
                        feature.properties.NOMBRE;

                                      layer.bindPopup(`
                      <div style="min-width:180px">
                          <h3>${feature.properties.NOMBRE}</h3>
                          <hr>
                          <b>Código Postal:</b> ${feature.properties.CP}<br>
                          <b>Municipio:</b> ${feature.properties.MUNICIPIO}<br>
                          <b>ID:</b> ${feature.properties.ID}
                      </div>
                  `);

                    layer.on("click", function () {

                        this.openPopup();

                    });

                }

            }

        );

        coloniasLayer.addTo(state.map);

        console.log(
            "Colonias cargadas:",
            geojson.features.length
        );

    }

    catch (error) {

        console.error(error);

    }

}

export function showColonias() {

    if (
        coloniasLayer &&
        !state.map.hasLayer(coloniasLayer)
    ) {

        coloniasLayer.addTo(state.map);

    }

    coloniasLayer.eachLayer(layer => {

        layer.bringToFront();

    });

}

export function hideColonias() {

    if (
        coloniasLayer &&
        state.map.hasLayer(coloniasLayer)
    ) {

        state.map.removeLayer(coloniasLayer);

    }

}
