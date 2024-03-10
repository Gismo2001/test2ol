import './style.css';
//import { bwBruAndereStyle, bwBruNlwknStyle } from './myStyleJs';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';
import { Vector } from 'ol/layer';
import { Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import { Attribution, defaults as defaultControls } from 'ol/control.js';
import { ZoomToExtent } from 'ol/control.js';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style, Circle } from 'ol/style';
import { bbox as loadingstrategyBbox } from 'ol/loadingstrategy';
import Icon from 'ol/style/Icon';
//import Style from 'ol/style/Style';

// Import the layer switcher control
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import Group from 'ol/layer/Group';


const attribution = new Attribution({
  collapsible: true,
});


const bwBruAndereStyle = new Style({
  image: new Icon({
    src: './data/bru_andere.svg',  // Hier wird der Pfad relativ zur HTML-Datei angenommen
    scale: 0.9,
    visible: false,
  }),
});
const bwBruNlwknStyle = new Style({
  image: new Icon({
    src: './data/bru_nlwkn.svg',  // Hier wird der Pfad relativ zur HTML-Datei angenommen
    scale: 0.9,
  }),
});

const mapView = new View({
  center: fromLonLat([7.35, 52.7]),
  zoom: 9,
});
const map = new Map({
  target: 'map',
  view: mapView,
  controls: defaultControls().extend([ attribution, new ZoomToExtent({extent: [727361,  6839277, 858148, 6990951, ], }), ]),
  
});


const switcher = new LayerSwitcher;
map.addControl(switcher)


const osmTile = new TileLayer({
  title: 'osm',
  type: 'base',
  source: new OSM({url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png', }),
});


const  wmsUesgLayer = new TileLayer({
  title: "ÜSG",
  name: "ÜSG",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Überschwemmungsgebiete_Verordnungsfläechen_Niedersachsen11182',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: true,
  opacity: .5,
});


const  wmsNSGLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Naturschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: true,
  opacity: .5,
  TILED: true
});

const gnAtlas2023 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "10", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2023",
  opacity: 1,
  visible: true,
});
const gnAtlas2020 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "9", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2020",
  opacity: 1,
  visible: false,
});
const gnAtlas2017 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "8", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2017",
  opacity: 1,
  visible: false,
});
const gnAtlas2014 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "7", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2014",
  opacity: 1,
  visible: false,
});
const gnAtlas2012 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "6", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2012",
  opacity: 1,
  visible: false,
});
const gnAtlas2010 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "5", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2010",
  opacity: 1,
  visible: false,
});
const gnAtlas2009 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "4", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2009",
  opacity: 1,
  visible: false,
});
const gnAtlas2002 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "3", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2002",
  opacity: 1,
  visible: false,
});
const gnAtlas1970 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "2", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1970",
  opacity: 1,
  visible: false,
});
const gnAtlas1957 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "1", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1957",
  opacity: 1,
  visible: false,
});
const gnAtlas1937 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "0", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1937",
  opacity: 1,
  visible: false,
});



const gewLayer = new Vector({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(',');},
    strategy: loadingstrategyBbox,
  }),
  title: 'Gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0, 28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 }),
  }),
});
const bwBruNlwknLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) { return './myLayers/bwBruNlwkn.geojson' + '?bbox=' + extent.join(','); },
    strategy: loadingstrategyBbox,
  }),
  title: 'Brücke (NLWKN)',
  name: 'bruNlwkn', // Titel für den Layer-Switcher
  style: bwBruNlwknStyle, // Verwendung des neuen Stils
  visible: true,
});
const bwBruAndereLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) { return './myLayers/bwBruAndere.geojson' + '?bbox=' + extent.join(','); },
    strategy: loadingstrategyBbox,
  }),
  title: 'Brücke (NLWKN)',
  name: 'bruAndere', // Titel für den Layer-Switcher
  style: bwBruAndereStyle, // Verwendung des neuen Stils
  visible: false,
});


const BaseGroup = new Group({
  title: "Base",
  fold: true,
  fold: 'close',
  layers: [osmTile]
});

const wmsLayerGroup = new Group({
  title: "WMS-Lay",
  visible: false,
  fold: true,
  fold: 'close',
  layers: [wmsUesgLayer, wmsNSGLayer ]
});

const GNAtlasGroup = new Group({
  title: "GN-DOP's",
  visible: false,
  fold: true,
  fold: 'close',
  layers: [ gnAtlas2023, gnAtlas2020, gnAtlas2017, gnAtlas2014, gnAtlas2012, gnAtlas2010, gnAtlas2009, gnAtlas2002, gnAtlas1970, gnAtlas1957, gnAtlas1937]
});

const BwGroup = new Group({
  title: "Bauw.",
  fold: true,
  fold: 'close',  
  layers: [ bwBruAndereLayer, bwBruNlwknLayer]
});

map.addLayer(BaseGroup);
map.addLayer(GNAtlasGroup);
map.addLayer(gewLayer);
map.addLayer(wmsLayerGroup);
map.addLayer(BwGroup);



map.on('singleclick', function (evt) {
  const viewResolution = /** @type {number} */ (mapView.getResolution());

  // ÜSG Layer
  const urlUesg = wmsUesgLayer.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:3857',
    {'INFO_FORMAT': 'text/html'},
  );

  if (urlUesg) {
    fetch(urlUesg)
      .then((response) => response.text())
      .then((html) => {
        if (html.trim() !== '') {
          createAndShowInfoDiv(html, 'ÜSG Layer');
        }
      });
  }

  // NSG Layer
  const urlNsg = wmsNSGLayer.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:3857',
    {'INFO_FORMAT': 'text/html'},
  );

  if (urlNsg) {
    fetch(urlNsg)
      .then((response) => response.text())
      .then((html) => {
        if (html.trim() !== '') {
          createAndShowInfoDiv(html, 'NSG Layer');
        }
      });
  }
});

function createAndShowInfoDiv(html, layerName) {
  const existingInfoDiv = document.getElementById('info');
  if (existingInfoDiv) {
    // Lösche das vorhandene div-Element, wenn es bereits existiert
    existingInfoDiv.remove();
  }

  const infoDiv = document.createElement('div');
  infoDiv.id = 'info';
  infoDiv.style.border = '1px solid black';
  infoDiv.innerHTML = `<strong>${layerName}</strong><br>${html}`;

  const closeIcon = document.createElement('span');
  closeIcon.id = 'closeIcon';
  closeIcon.innerHTML = '&times;';
  closeIcon.style.position = 'absolute';
  closeIcon.style.top = '5px';
  closeIcon.style.right = '5px';
  closeIcon.style.cursor = 'pointer';
  closeIcon.style.fontSize = '20px';

  closeIcon.addEventListener('click', function () {
    infoDiv.style.display = 'none';
  });

  infoDiv.appendChild(closeIcon);

  // Füge das Info-Element dem Dokument hinzu
  document.body.appendChild(infoDiv);
}

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const data = wmsUesgLayer.getData(evt.pixel);
  const hit = data && data[3] > 0; // transparent pixels have zero for data[3]
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
