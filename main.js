/* var layer_HYNetworkWatercourseLink_0 = L.WMS.layer("http://sg.geodatenzentrum.de/wms_dlm250_inspire", "HY.Network.WatercourseLink", {
  pane: 'pane_HYNetworkWatercourseLink_0',
  format: 'image/png',
  uppercase: true,
  transparent: true,
  continuousWorld : true,
  tiled: true,
  info_format: 'text/html',
  opacity: 1,
  identify: false,
  attribution: '',
}); */

import './style.css';
//import { bwBruAndereStyle, bwBruNlwknStyle } from './myStyleJs';

import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { Vector } from 'ol/layer';
import { Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import { Attribution, defaults as defaultControls } from 'ol/control';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style, Circle } from 'ol/style';
import { bbox as loadingstrategyBbox } from 'ol/loadingstrategy';
import Icon from 'ol/style/Icon';
//import Style from 'ol/style/Style';

// Import the layer switcher control
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import Group from 'ol/layer/Group';

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

const attribution = new Attribution({
  collapsible: true,
});

const mapView = new View({
  center: fromLonLat([7.35, 52.7]),
  zoom: 9,
});

const map = new Map({
  target: 'map',
  view: mapView,
  //controls: defaultControls().extend([]), // Falls erforderlich
  controls: defaultControls({ attribution: false }).extend([attribution]),
});

const switcher = new LayerSwitcher;
map.addControl(switcher)

const osmTile = new TileLayer({
  title: 'osm',
  type: 'base',
  source: new OSM({url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',  ], }),
});

;
// WMS UESG
const  wmsUesgLayer = new TileLayer({
  title: "ÜSG",
  name: "ÜSG",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Überschwemmungsgebiete_Verordnungsfläechen_Niedersachsen11182',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
    },
  }),
  visible: false,
  opacity: .5,
  
});

// WMS NSG
const  wmsNSGLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Naturschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
    },
  }),
  visible: false,
  opacity: .5,
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


/// Gew Layer
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

// Vektor-Layer mit dem neuen Stil
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

// Vektor-Layer mit dem neuen Stil
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
  layers: [wmsUesgLayer, wmsNSGLayer]
});
  
const GNAtlasGroup = new Group({
  title: "GN-DOP's",
  visible: false,
  fold: true,
  fold: 'close',
  layers: [ gnAtlas2023 ]
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



