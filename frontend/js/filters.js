/* =========================
   LIMPIAR FILTROS
========================= */

function clearFilters(){

  filterType.value = 'all';

  filterDistrict.value = '';

  filterSection.value = '';

  filterMunicipio.value = '';

  filterEncargado.value = '';

  renderPoints(
    state.points
  );

  renderAllMarkers();

  showSuccess(
    'Filtros limpiados'
  );

}