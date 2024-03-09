import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { Vector } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import { Attribution, defaults as defaultControls } from 'ol/control';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import { bbox as loadingstrategyBbox } from 'ol/loadingstrategy';

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

const osmTile = new TileLayer({
  title: 'osm',
  // type: 'base',
  source: new OSM({url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',  ], }),
});


// WMS Layer
const wmsLayer = new TileLayer({
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Gewässernetz_1._Ordnung29778',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
    },
  }),
  opacity: 1,
});

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
map.addLayer(osmTile)

map.addLayer(wmsLayer);

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

map.addLayer(gewLayer);

map.addLayer(osmTile)
