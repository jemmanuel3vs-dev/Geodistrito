/* =========================
   PROYECCIONES
========================= */

const projSource =
'+proj=utm +zone=13 +datum=WGS84 +units=m +north +no_defs';

const projDest =
'+proj=longlat +datum=WGS84 +no_defs';

/* =========================
   TRANSFORM COORDS
========================= */

function transformCoords(coords){

  if(typeof coords[0] === 'number'){

    const [x, y] = coords;

    const [lng, lat] =

    proj4(

      projSource,
      projDest,
      [x, y]

    );

    return [lng, lat];

  }

  return coords.map(
    transformCoords
  );

}

/* =========================
   TRANSFORM FEATURE
========================= */

function transformFeature(feature){

  try{

    return {

      type: 'Feature',

      properties:
      feature.properties,

      geometry: {

        type:
        feature.geometry.type,

        coordinates:
        transformCoords(
          feature.geometry.coordinates
        )

      }

    };

  } catch(error){

    console.warn(error);

    return null;

  }

}

/* =========================
   CENTROID
========================= */

function calculateCentroid(
  coordinates
){

  let ring;

  if(

    Array.isArray(
      coordinates[0][0][0]
    )

  ){

    ring =
    coordinates[0][0];

  } else {

    ring =
    coordinates[0];

  }

  let lng = 0;
  let lat = 0;

  ring.forEach(coord => {

    lng += coord[0];
    lat += coord[1];

  });

  return [

    lat / ring.length,

    lng / ring.length

  ];

}

/* =========================
   LOAD SECTIONS
========================= */

function loadSections(){

  fetch('data/secciones.json')

  .then(response => response.json())

  .then(data => {

    const features =

    data.features

    .filter(feature => {

      return (

        feature.geometry &&
        feature.properties

      );

    })

    .map(transformFeature)

    .filter(Boolean);

    state.sectionCentroids =

    features.map(feature => {

      const centroid =

      calculateCentroid(
        feature.geometry.coordinates
      );

      return {

        ...feature.properties,

        lat: centroid[0],

        lng: centroid[1],

        feature

      };

    });

  /* =========================
   COLORES POR DISTRITO
========================= */

function getDistrictColor(
  distrito
){

  switch(Number(distrito)){

    case 20:
      return '#ef4444'; // rojo

    case 21:
      return '#3b82f6'; // azul

    case 22:
      return '#22c55e'; // verde

    case 23:
      return '#f59e0b'; // naranja

    case 24:
      return '#a855f7'; // morado

    default:
      return '#64748b';
  }

}

/* =========================
   HOVER EFECTO
========================= */

function highlightFeature(e){

  const layer = e.target;

  layer.setStyle({

    weight: 3,

    color: '#111827',

    fillOpacity: 0.8

  });

}

/* =========================
   RESET HOVER
========================= */

function resetHighlight(e){

  state.sectionsLayer.resetStyle(
    e.target
  );

}

/* =========================
   CAPA GEOJSON
========================= */

state.sectionsLayer =

L.geoJSON(

  {

    type: 'FeatureCollection',

    features

  },

  {

    style: function(feature){

      return {

        color: '#ffffff',

        weight: 1,

        fillColor:

        getDistrictColor(
          feature.properties.distrito_l
        ),

        fillOpacity: 0.45

      };

    },

    onEachFeature:
    function(feature, layer){

      layer.on({

        mouseover:
        highlightFeature,

        mouseout:
        resetHighlight

      });

      layer.bindPopup(`
        <div class="popup-card">
          <h3>Sección Electoral</h3>
          <p><strong>Distrito:</strong> ${feature.properties.distrito_l}</p>
          <p><strong>Sección:</strong> ${feature.properties.seccion}</p>
          <p><strong>Municipio:</strong> ${feature.properties.municipio}</p>
        </div>
      `);

    }

  }

).addTo(state.map);

  })

  .catch(console.error);

}

/* =========================
   DETECTAR SECCIÓN
========================= */

function getNearestSection(
  lat,
  lng
){

  if(
    !state.sectionCentroids.length
  ){

    return null;

  }

  const point =
  turf.point([lng, lat]);

  for(
    const section
    of
    state.sectionCentroids
  ){

    const inside =

    turf.booleanPointInPolygon(

      point,

      section.feature

    );

    if(inside){

      return {

        section,

        inside: true

      };

    }

  }

  return null;

}