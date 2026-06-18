const SEARCH_FIELDS = [
  'tipo',
  'distrito',
  'seccion',
  'colonia',
  'calle',
  'encargado',
  'municipio'
];

export const PAGE_SIZE = 20;

function normalize(value) {

  return String(value ?? '')
    .trim()
    .toLowerCase();

}

export function preparePointForAdmin(point) {

  const searchIndex =
    SEARCH_FIELDS
      .map(field => normalize(point[field]))
      .join(' ');

  return {
    ...point,
    __searchIndex: searchIndex
  };

}

export function filterAdminPoints(
  points,
  filters
) {

  const search = normalize(filters.search);
  const tipo = normalize(filters.tipo);
  const distrito = normalize(filters.distrito);
  const seccion = normalize(filters.seccion);
  const colonia = normalize(filters.colonia);
  const municipio = normalize(filters.municipio);
  const encargado = normalize(filters.encargado);

  return points.filter(point => {

    const matchesSearch =
      !search ||
      point.__searchIndex.includes(search);

    const matchesTipo =
      !tipo ||
      tipo === 'all' ||
      normalize(point.tipo) === tipo;

    const matchesDistrito =
      !distrito ||
      normalize(point.distrito) === distrito;

    const matchesSeccion =
      !seccion ||
      normalize(point.seccion) === seccion;

    const matchesColonia =
      !colonia ||
      normalize(point.colonia).includes(colonia);

    const matchesMunicipio =
      !municipio ||
      normalize(point.municipio).includes(municipio);

    const matchesEncargado =
      !encargado ||
      normalize(point.encargado).includes(encargado);

    return (
      matchesSearch &&
      matchesTipo &&
      matchesDistrito &&
      matchesSeccion &&
      matchesColonia &&
      matchesMunicipio &&
      matchesEncargado
    );

  });

}

export function paginateAdminPoints(
  points,
  page,
  pageSize = PAGE_SIZE
) {

  const totalPages =
    Math.max(
      1,
      Math.ceil(points.length / pageSize)
    );

  const safePage =
    Math.min(
      Math.max(page, 1),
      totalPages
    );

  const start =
    (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    rows: points.slice(
      start,
      start + pageSize
    )
  };

}

export function getAdminFilters() {

  return {
    search:
      document.getElementById('adminSearch')
        ?.value || '',
    tipo:
      document.getElementById('filterType')
        ?.value || 'all',
    distrito:
      document.getElementById('filterDistrict')
        ?.value || '',
    seccion:
      document.getElementById('filterSection')
        ?.value || '',
    colonia:
      document.getElementById('filterColonia')
        ?.value || '',
    municipio:
      document.getElementById('filterMunicipio')
        ?.value || '',
    encargado:
      document.getElementById('filterEncargado')
        ?.value || ''
  };

}

export function clearAdminFilters() {

  const search =
    document.getElementById('adminSearch');

  const type =
    document.getElementById('filterType');

  const district =
    document.getElementById('filterDistrict');

  const section =
    document.getElementById('filterSection');

  const neighborhood =
    document.getElementById('filterColonia');

  const municipality =
    document.getElementById('filterMunicipio');

  const manager =
    document.getElementById('filterEncargado');

  if (search) {
    search.value = '';
  }

  if (type) {
    type.value = 'all';
  }

  if (district) {
    district.value = '';
  }

  if (section) {
    section.value = '';
  }

  if (neighborhood) {
    neighborhood.value = '';
  }

  if (municipality) {
    municipality.value = '';
  }

  if (manager) {
    manager.value = '';
  }

}
