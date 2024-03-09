import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import { Vector } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Fill, Stroke, Style } from 'ol/style';
import { bbox as loadingstrategyBbox } from 'ol/loadingstrategy';

const mapView = new View({
  center: fromLonLat([7.35, 52.7]),
  zoom: 9,
});

const map = new Map({
  target: 'map',
  view: mapView,
  controls: defaultControls().extend([]), // Falls erforderlich
});

const osmTile = new TileLayer({
  title: 'osm',
  // type: 'base',
  source: new OSM({url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',  ], }),
});

map.addLayer(osmTile);

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