export function createBaseMap() {

  const map = L.map('map').setView(
    [23.2494, -106.4111],
    12
  );

  createMapPanes(map);

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap'
    }
  ).addTo(map);

  return map;

}

function createMapPanes(map) {

  const panes = {
    sectionsPane: 300,
    coloniasPane: 450,
    markersPane: 600,
    userPane: 650
  };

  Object.entries(panes).forEach(([paneName, zIndex]) => {

    if (!map.getPane(paneName)) {
      map.createPane(paneName);
    }

    map.getPane(paneName).style.zIndex = zIndex;

  });

}
