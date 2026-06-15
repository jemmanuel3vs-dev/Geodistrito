const XLSX = require('xlsx');

const db = require('../database/connection');

const {
  obtenerInformacionGeografica
} = require('../services/geo.service');
const { safeUnlink } = require('../services/file.service');

async function importExcel(req, res) {

  try {

    if (!req.file) {

      return res.status(400).json({
        error: 'No se recibió archivo'
      });

    }

    const workbook =
      XLSX.readFile(
        req.file.path
      );

    const sheetName =
      workbook.SheetNames[0];

    const sheet =
      workbook.Sheets[sheetName];

    const rows =
      XLSX.utils.sheet_to_json(
        sheet
      );

    console.log(
      `📄 Filas encontradas: ${rows.length}`
    );

    let insertados = 0;

let errores = 0;

let duplicados = 0;

for (const row of rows) {

  try {

    const tipo =
  row.tipo ||
  row.Tipo;

const url =
  row.link ||
  row.Link;

    const coords = extractCoordinates(url);

if (!coords) {
    console.log("❌ Sin coordenadas:");
    console.log(row);

    errores++;

    continue;
}

await new Promise(resolve =>
    setTimeout(resolve, 1100)
);

const geo = await obtenerInformacionGeografica(
    coords.lat,
    coords.lng
);

if (!geo.distrito || !geo.seccion) {

    console.log("❌ Sin distrito o sección");
    console.log(url);
    console.log(geo);

    errores++;

    continue;

}


    await db.query(

      `

      INSERT INTO puntos
      (

        tipo,

        latitud,

        longitud,

        distrito,

        seccion,

        municipio,

        calle,

        colonia,

        encargado,

        url

      )

      VALUES

      (

        ?,?,?,?,?,?,?,?,?,?

      )

      `,

      [
  tipo,
  coords.lat,
  coords.lng,
  String(geo.distrito),
  String(geo.seccion),
  geo.municipio,
  geo.calle,
  geo.colonia,
  null,
  url
]

    );

    insertados++;

  }

 catch (error) {

    if (error.code === "ER_DUP_ENTRY") {

        duplicados++;

        continue;

    }

    console.log("❌ Error en fila:", row);

    console.log(error);

    errores++;

}

}

console.log({
    total: rows.length,
    insertados,
    duplicados,
    errores
});

return res.json({
    ok: true,
    message: `Importación finalizada.
Total: ${rows.length}
Insertados: ${insertados}
Duplicados: ${duplicados}
Errores: ${errores}`,
    total: rows.length,
    insertados,
    duplicados,
    errores
});


  } catch(error) {

    console.error(error);

    return res.status(500).json({

      error:
      error.message

    });

  } finally {
    safeUnlink(req.file?.path);
  }

}

function extractCoordinates(link) {

  if (!link) return null;

  // Formato:
  // ...!3d23.123456!4d-106.123456

  let match = link.match(
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
  );

  if (match) {

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };

  }

  // Formato:
  // ...@23.123456,-106.123456

  match = link.match(
    /@(-?\d+\.\d+),(-?\d+\.\d+)/
  );

  if (match) {

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };

  }

  // Formato:
  // https://www.google.com/maps/search/23.190968,+-106.231235

  match = link.match(
    /search\/([^,]+),([^?&]+)/
  );

  if (match) {

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2].replace("+", ""))
    };

  }

  match = link.match(
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/
);

if (match) {

    return {

        lat: parseFloat(match[1]),

        lng: parseFloat(match[2])

    };

}

match = link.match(
    /coordinate=(-?\d+\.\d+),(-?\d+\.\d+)/
);

if (match) {

    return {

        lat: parseFloat(match[1]),

        lng: parseFloat(match[2])

    };

}

  return null;

}


module.exports = {
  importExcel,
  extractCoordinates
};