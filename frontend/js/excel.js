function exportToExcel() {

  if (!state.points.length) {

    alert(
      'No hay datos.'
    );

    return;
  }

  const worksheet =
  XLSX.utils.json_to_sheet(
    state.points
  );

  const workbook =
  XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'GeoDistrito'
  );

  XLSX.writeFile(
    workbook,
    'GeoDistrito.xlsx'
  );

}