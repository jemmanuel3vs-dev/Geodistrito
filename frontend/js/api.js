/* =========================
   API URL
========================= */

const API_URL =
'http://localhost:3000/api/puntos';

/* =========================
   OBTENER PUNTOS
========================= */

async function fetchPoints(){

  try{

    const response =
    await fetch(API_URL);

    if(!response.ok){

      throw new Error(
        'Error obteniendo puntos'
      );

    }

    const data =
    await response.json();

    console.log(
      'PUNTOS:',
      data
    );

    /* =========================
       ASEGURAR ARRAY
    ========================= */

    state.points =

      Array.isArray(data)

      ?

      data

      :

      [];

    /* =========================
       RENDER
    ========================= */

    renderPoints();

    renderAllMarkers();

  }catch(error){

    console.error(error);

    state.points = [];

    renderPoints();

    showError(
      'No se pudieron cargar los puntos'
    );

  }

}

/* =========================
   GUARDAR PUNTO
========================= */

async function savePointRequest(
  formData
){

  try{

    const response =
    await fetch(

      API_URL,

      {

        method: 'POST',

        body: formData

      }

    );

    if(!response.ok){

      throw new Error(
        'Error guardando punto'
      );

    }

    return await response.json();

  } catch(error){

    console.error(error);

    throw error;

  }

}

async function getAllPoints(){

  try{

    const response =
    await fetch(API_URL);

    if(!response.ok){

      throw new Error(
        'Error obteniendo puntos'
      );

    }

    const data =
    await response.json();

    return Array.isArray(data)
      ? data
      : [];

  } catch(error){

    console.error(error);

    throw error;

  }

}