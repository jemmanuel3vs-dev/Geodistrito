const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

/* =========================
   CARGAR SECCIONES
========================= */

const seccionesGeoJSON = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../data/secciones.json'),
    'utf8'
  )
);

const secciones =
  seccionesGeoJSON.features || [];

/* =========================
   BUSCAR SECCIÓN
========================= */

function buscarSeccion(lat, lng) {

  const punto =
    turf.point([lng, lat]);

  for (const feature of secciones) {

    if (
      turf.booleanPointInPolygon(
        punto,
        feature
      )
    ) {

      return {

        seccion:
          feature.properties.seccion ?? null,

        distrito:
          feature.properties.distrito_l ?? null,

        municipio:
          feature.properties.municipio ?? null

      };

    }

  }

  return {

    seccion: null,
    distrito: null,
    municipio: null

  };

}

/* =========================
   REVERSE GEOCODING
========================= */

async function reverseGeocode(lat, lng) {

  try {

    const response = await fetch(

      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,

      {

        headers: {

          "User-Agent":
            "GeoDistrito/1.0"

        }

      }

    );

    if (!response.ok) {

      throw new Error(
        "Error consultando Nominatim"
      );

    }

    const data =
      await response.json();

    const address =
      data.address || {};

    return {

      calle:

        address.road ??

        address.street ??

        address.pedestrian ??

        address.footway ??

        address.path ??

        null,

      colonia:

        address.neighbourhood ??

        address.suburb ??

        address.residential ??

        address.quarter ??

        address.hamlet ??

        null,

      municipio:

        address.city ??

        address.town ??

        address.village ??

        address.county ??

        null,

      cp:

        address.postcode ??

        null

    };

  }

  catch (error) {

    console.log(
      "ReverseGeocode:",
      error.message
    );

    return {

      calle: null,

      colonia: null,

      municipio: null,

      cp: null

    };

  }

}

/* =========================
   INFORMACIÓN GEOGRÁFICA
========================= */

async function obtenerInformacionGeografica(
  lat,
  lng
) {

  const geo =
    buscarSeccion(
      lat,
      lng
    );

  const direccion =
    await reverseGeocode(
      lat,
      lng
    );

  return {

    distrito:

      geo.distrito,

    seccion:

      geo.seccion,

    municipio:

      direccion.municipio ??
      geo.municipio,

    calle:

      direccion.calle,

    colonia:

      direccion.colonia,

    cp:

      direccion.cp

  };

}

module.exports = {

  buscarSeccion,

  reverseGeocode,

  obtenerInformacionGeografica

};
