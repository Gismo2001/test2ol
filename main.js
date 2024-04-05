import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay.js';
import Draw from 'ol/interaction/Draw.js';
import {LineString, Polygon, Point, Circle} from 'ol/geom.js';

import {circular} from 'ol/geom/Polygon';
import Geolocation from 'ol/Geolocation.js';
import { jsPDF } from "jspdf";
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';

import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';

import MousePosition from 'ol/control/MousePosition.js';
import { transform } from 'ol/proj';
import {createStringXY} from 'ol/coordinate.js';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import SearchPhoton from 'ol-ext/control/SearchPhoton';
//import SearchNominatim from 'ol-ext/control/SearchNominatim';
import WMSCapabilities from'ol-ext/control/WMSCapabilities';

import Icon from 'ol/style/Icon'; // Hinzufügen Sie diesen Import

import Bar from 'ol-ext/control/Bar';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import TextButton from 'ol-ext/control/TextButton';

//projektion definieren und registrieren
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
register(proj4);
var globalCoordAnOderAus = false;

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import { 
  getStyleForArtEin,
  getStyleForArtSonPun,
  gehoelz_vecStyle, 
  sleStyle, 
  wehStyle, 
  bru_nlwknStyle, 
  bruAndereStyle,
  dueStyle, 
  queStyle, 
  getStyleForArtFSK, 
  getStyleForArtUmn,
  km10scalStyle,
  km100scalStyle,
  km500scalStyle,
  combinedStyle,
  machWasMitFSK,
  getStyleForArtSonLin
} from './extStyle';

const attribution = new Attribution({
  collapsible: false,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});

const map = new Map({
  target: "map",
  view: mapView,
  controls: defaultControls().extend([
    new FullScreen(),
    new ZoomToExtent({
       extent: [727361, 6839277, 858148, 6990951] // Geben Sie hier das Ausdehnungsintervall an
     }),
    attribution // Fügen Sie hier Ihre benutzerdefinierte Attribution-Steuerung hinzu
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});


//------------------------------------Attribution collapse
function checkSize() {
  const small = map.getSize()[0] < 600;
  attribution.setCollapsible(small);
  attribution.setCollapsed(small);
}
map.on('change:size', checkSize);
checkSize();

//---------------------------------------------------Marker für Adresssuche
const sourceP = new VectorSource();
let layerP = null; // Initial kein Layer vorhanden
let isFirstZoom = true; // Variable, um den ersten Zoom zu verfolgen
let watchId = null; // Variable, um die Watch-ID der Geolokalisierung zu speichern

//Button für Positionierung
const locateP = document.createElement('div');
let isActive = false; // Variable, um den Aktivierungsstatus der Geolokalisierung zu verfolgen


const gehoelz_vecLayer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gehoelz_vec.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gehölz(Plan)', // Titel für den Layer-Switcher
  name: 'gehoelz_vec',
  style: gehoelz_vecStyle,
  visible: false
});
const exp_allgm_fsk_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_allgm_fsk.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'fsk',
  name: 'fsk', 
  style: getStyleForArtFSK,
  visible: false,
  minResolution: 0,
  maxResolution: 4
})
const exp_bw_son_lin_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_son_lin.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }), 
  title: 'Sonstig, Linien', 
  name: 'son_lin',
  style: getStyleForArtSonLin,
  visible: false
});
const exp_gew_umn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_umn.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'U-Maßnahmen', 
  name: 'gew_umn',
  style: getStyleForArtUmn,
  visible: false
});
const exp_gew_info_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_gew_info.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gew, Info', 
  name: 'gew_info',
  style: combinedStyle,
  visible: false
});

const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
})

const exp_bw_son_pun_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_bw_son_pun.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Sonstige, Punkte', 
  name: 'son_pun', 
  style: getStyleForArtSonPun,
  visible: false
});
const exp_bw_ein_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_bw_ein.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Einläufe', 
  name: 'ein', 
  style: getStyleForArtEin,
  visible: false
});
const exp_bw_que_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_que.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Querung', 
  name: 'que', // Titel für den Layer-Switcher
  style: queStyle,
  visible: false
});
const exp_bw_due_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_due.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Düker', // Titel für den Layer-Switcher
  name: 'due', // Titel für den Layer-Switcher
  style: dueStyle,
  visible: false
});
const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Wehr', // Titel für den Layer-Switcher
  name: 'weh', // Titel für den Layer-Switcher
  style: wehStyle,
  visible: false
});
const exp_bw_bru_nlwkn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_bru_nlwkn.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (NLWKN)', 
  name: 'bru_nlwkn', // Titel für den Layer-Switcher
  style: bru_nlwknStyle,
  visible: false
});
const exp_bw_bru_andere_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_bru_andere.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (andere)', 
  name: 'bru_andere', 
  style: bruAndereStyle,
  visible: false
});
const exp_bw_sle_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_sle.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Schleuse', // Titel für den Layer-Switcher
  name: 'sle', // Titel für den Layer-Switcher
  style: sleStyle,
  visible: true,
  trash: false,
});

const km10scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_10_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km10scal', // Titel für den Layer-Switcher
  style: km10scalStyle,
  visible: false,
  minResolution: 0,
  maxResolution: 1
});
const km100scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_100_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km100scal', // Titel für den Layer-Switcher
  style: function(feature, resolution) {
    return km100scalStyle(feature, feature.get('km'), resolution);
  },
  visible: true,
  minResolution: 0,
  maxResolution: 3 
});
const km500scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_500_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km500scal', // Titel für den Layer-Switcher
  style: function(feature, resolution) {
    return km500scalStyle(feature, feature.get('km'), resolution);
  },
  visible: true  
});

const wmsNsgLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Naturschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsLsgLayer = new TileLayer({
  title: "LSG",
  name: "LSG",
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Landschaftsschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsUesgLayer = new TileLayer({
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
  visible: false,
  opacity: .5,
});
const wmsWrrlFgLayer = new TileLayer({
  title: "Fließgew.",
  name: "Fließgew.",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Natuerliche_erheblich_veraenderte_und_kuenstliche_Fliessgewaesser',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: true,
  opacity: 1,
});


const wmsGewWmsFgLayer = new TileLayer({
  title: "GewWms",
  name: "GewWms",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Gewässernetz',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: 1,
});

const gnAtlas2023 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "10", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2023",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2020 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "9", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2020",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2017 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "8", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2017",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2014 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "7", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2014",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2012 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "6", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2012",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2010 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "5", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2010",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2009 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "4", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2009",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2002 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "3", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2002",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas1970 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "2", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1970",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas1957 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "1", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1957",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas1937 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "0", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1937",
  opacity: 1.000000,
  visible: false,
});

var baseDE_layer = new TileLayer({
  title: "Base-DE",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    url: "https://sgx.geodatenzentrum.de/wms_basemapde",
    attributions: '© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs) CC BY 4.0',
    params: {
      "LAYERS": "de_basemapde_web_raster_farbe",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});
var dop20ni_layer = new TileLayer({
  title: "DOP20 NI",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    url: "https://www.geobasisdaten.niedersachsen.de/doorman/noauth/wms_ni_dop",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {
      "LAYERS": "dop20",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});
const googleSatLayer = new TileLayer({
  title: "GoogleSat",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' })
});
const googleHybLayer = new TileLayer({
  title: "GoogleHybrid",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' })
});
const ESRIWorldImagery = new TileLayer({
  title: 'ESRI-Sat',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  })
});
const ESRIWorldGrey = new TileLayer({
  title: 'ESRI-Grey',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  })
});
const osmTileGr = new TileLayer({
  title: "osm-grey",
  className: 'bw',
  type: 'base',
  visible: false,
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
});
const osmTileCr = new TileLayer({
  title: "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  visible: true,
  opacity: 0.75
});

const layerSwitcher = new LayerSwitcher({  });
map.addControl(layerSwitcher);

//------------------------------------ Layer für Messung
const source = new VectorSource();
const vector = new VectorLayer({
  displayInLayerSwitcher: false,
  source: source,
  style: {
    'fill-color': 'rgba(136, 136, 136, 0.526)',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
});
let sketch;
let measureTooltipElement;
let measureTooltip;

//-------------------------------------------Funktionen für Messung----------------- //
const pointerMoveHandler = function (evt) {
  if (evt.pointerType === 'touch') {
    if (evt.dragging) {
       return;
    }
  } else {
    if (evt.dragging) {
      return;
    }
  }  
};
map.on('pointermove', pointerMoveHandler);
let draw;
const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 1000) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};
const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area >= 10000) {
    output = (area / 1000000).toFixed(3) + ' ' + 'km<sup>2</sup>';
  } else {
    output = area.toFixed(3) + ' ' + 'm<sup>2</sup>';
  }
  return output;
};
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'blue', // Blaue Linienfarbe
    width: 2, // Linienbreite
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});
function addInteraction(type) {
  draw = new Draw({
    source: source,
    type: type,
    style: function (feature) {
      const geometryType = feature.getGeometry().getType();
      if (geometryType === type || geometryType === 'Point') {
        return style;
      }
    },
  });
  map.addInteraction(draw);
  createMeasureTooltip();
   
  let listener;
  draw.on('drawstart', function (evt) {
    sketch = evt.feature;
    let tooltipCoord = evt.coordinate;
    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target;
      let output;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });
  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
  });
}
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}
//Mit Kontextmenü werden die Overlays fü Messungen wieder gelöscht
map.getViewport().addEventListener('contextmenu', function(evt) {
  evt.preventDefault(); // Verhindert das Standardkontextmenü
  if (draw) {
    source.clear(); // Löscht alle Vektoren aus der Quelle
    
    draw.finishDrawing(); // Beendet die laufende Messung
    map.removeInteraction(draw); // Entfernt die Zeicheninteraktion
    map.un('pointermove', pointerMoveHandler); // Entfernt den Event-Listener für 'pointermove'
    measureTooltip = null;
    measureTooltipElement = null;
    map.removeOverlay(measureTooltip);
    
    //map.removeOverlay(measureTooltip);
    
    return; // Beende die Funktion, um weitere Interaktionen zu verhindern
  }
});
/* 
// Funktion zum Entfernen des Messergebnisses
function removeMeasureResult() {
  if (measureTooltipElement) {
    measureTooltipElement.innerHTML = ''; // Löscht den Inhalt des Elements
  }
  map.removeOverlay(measureTooltip);
  measureTooltip = null;
  measureTooltipElement = null;
} */


//------------------------------------Custom Controls 1 für Linie und für Fläche ........................
class CustomControls1 extends Control {
  constructor(options) {
    const element = document.createElement('div');
    element.className = 'custom-controls1 ol-unselectable ol-control';
    const buttonLength = document.createElement('button');
    buttonLength.innerHTML = 'L';
    buttonLength.className = 'ol-button';
    buttonLength.addEventListener('click', function() {
      addInteraction('LineString');
    });
    const buttonArea = document.createElement('button');
    buttonArea.innerHTML = 'F';
    buttonArea.className = 'ol-button';
    buttonArea.addEventListener('click', function() {
      addInteraction('Polygon');
    });
    element.appendChild(buttonLength);
    element.appendChild(buttonArea);

    super({
      element: element,
      target: options.target,
    });
  }
}
map.addControl(new CustomControls1({
  target: 'custom-controls'
}));


//---------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  fold: true,
  fold: 'close',
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_weh_layer, exp_bw_sle_layer],
});
const BwGroupL = new LayerGroup({
  title: "Bauw.(L)",
  fold: true,
  fold: 'close',  
  layers: [ gehoelz_vecLayer, exp_gew_umn_layer, exp_bw_son_lin_layer, exp_gew_info_layer ]
});
const wmsLayerGroup = new LayerGroup({
  title: "WMS-Lay",
  name: "WMS-Lay",
  fold: true,
  fold: 'close',
  visible: false,
  layers: [ wmsLsgLayer, wmsNsgLayer, wmsUesgLayer, wmsWrrlFgLayer, wmsGewWmsFgLayer ]
});
const GNAtlasGroup = new LayerGroup({
  title: "GN-DOP's",
  fold: true,
  fold: 'close',
  layers: [ gnAtlas2023, gnAtlas2020, gnAtlas2017, gnAtlas2014, gnAtlas2012, gnAtlas2010, gnAtlas2009, gnAtlas2002, gnAtlas1970, gnAtlas1957, gnAtlas1937]
});
const kmGroup = new LayerGroup({
  title: "Station",
  fold: true,
  fold: 'close',
  layers: [km10scal_layer, km100scal_layer, km500scal_layer]
});
const BaseGroup = new LayerGroup({
  title: "Base",
  fold: true,
  fold: 'close',
  layers: [ESRIWorldImagery, ESRIWorldGrey, googleHybLayer, googleSatLayer, dop20ni_layer, baseDE_layer, osmTileGr, osmTileCr]
});
map.addLayer(BaseGroup);
map.addLayer(GNAtlasGroup);
map.addLayer (exp_allgm_fsk_layer);
map.addLayer(gew_layer_layer);
map.addLayer(wmsLayerGroup);
map.addLayer(kmGroup);
map.addLayer(BwGroupL);
map.addLayer(BwGroupP);
map.addLayer(vector); 

//--------------------------------------------------Info für WMS-Layer
map.on('singleclick', function (evt) {
  const isWmsLayerGroupVisible = map.getLayers().getArray().some(layer => layer.get('name') === 'WMS-Lay' && layer.getVisible());
  if (isWmsLayerGroupVisible) {
    const layersToCheck = [
      { layer: wmsGewWmsFgLayer, name: 'GewWms' },
      { layer: wmsWrrlFgLayer, name: 'WRRL' },
      { layer: wmsUesgLayer, name: 'ÜSG' },
      { layer: wmsNsgLayer, name: 'NSG' },
      { layer: wmsLsgLayer, name: 'LSG' },
    ];
    const viewResolution = map.getView().getResolution();
    const viewProjection = map.getView().getProjection();
    layersToCheck.forEach(({ layer, name }) => {
       if (layer.getVisible()) {
        const url = layer.getSource().getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {'INFO_FORMAT': 'text/html'});
        if (url) {
          fetch(url)
            .then((response) => response.text())
            .then((html) => {
              if (html.trim() !== '') {
                removeExistingInfoDiv();
                const infoDiv = createInfoDiv(name, html);
                document.body.appendChild(infoDiv);
              }
            })
            .catch((error) => {
              alert('Position nicht gefunden, Standortermittlung aktiv??');
              
            });
        }
      }
    });
  } else {
    
  }
});
function createInfoDiv(name, html) {
  const infoDiv = document.createElement('div');
  infoDiv.id = 'info';
  infoDiv.classList.add('info-container');
  infoDiv.innerHTML = `<strong>${name} Layer</strong><br>${html}`;

  const closeIcon = document.createElement('span');
  closeIcon.innerHTML = '&times;';
  closeIcon.classList.add('close-icon');
  closeIcon.addEventListener('click', function () {
    infoDiv.style.display = 'none';
  });

  infoDiv.appendChild(closeIcon);
  return infoDiv;
}
function removeExistingInfoDiv() {
  const existingInfoDiv = document.getElementById('info');
  if (existingInfoDiv) { existingInfoDiv.remove(); }
}

//---------------------------------------------------Funktionen für Popup
//var popup = new OpenLayers.Popup.FramedCloud("popup",

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var popup = new Overlay({
  element: container,//document.getElementById('popup'),
  id: '1',
  autoPan: true,
  autoPanAnimation: {
  duration: 250
  }
});
map.addOverlay(popup);

closer.onclick = function()
{
  popup.setPosition(undefined);
  closer.blur();
  return false;
};
var closer = document.getElementById('popup-closer');

//--------------------------------------------------Funktionen für Text im Popup
map.on('click', function (evt) {
 /*  //gibt es schon einen Marker
  if (markerCoordOverlay) {
    console.log('es gibt einen Marker');
    map.removeOverlay(markerCoordOverlay);
  };
 
 
var featuresAtPixel = []; // Initialisierung des Arrays außerhalb der if-Bedingung

if (globalCoordAnOderAus === false) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        featuresAtPixel.push(feature.get('bw_id')); // Hinzufügen des layname zum Array featuresAtPixel
    });

    // Dropdown-Menü erstellen
    var select = document.createElement("select"); // Korrektur: Verwenden Sie "select" statt "selectF"
    select.id = "featureSelect";

    // Optionen für das Dropdown-Menü erstellen
    featuresAtPixel.forEach(function(featureId) {
        var option = document.createElement("option");
        option.value = featureId;
        option.text = featureId;
        select.appendChild(option);
    });

// Erstellen Sie das Overlay-Div
const overlayDiv = document.createElement('div');
overlayDiv.style.position = 'absolute'; // Ändern Sie die Position auf absolut
overlayDiv.style.top = 'calc(50% + 100px)'; // Verschieben um 100px nach unten
overlayDiv.style.left = 'calc(50% + 100px)'; // Verschieben um 100px nach rechts
overlayDiv.style.backgroundColor = 'white';
overlayDiv.style.padding = '20px';
overlayDiv.style.border = '1px solid black';
overlayDiv.style.zIndex = '999';

// Erstellen Sie den select und fügen Sie ihn dem Overlay-Div hinzu
overlayDiv.appendChild(select);

// Erstellen Sie den Schließbutton
const closeButton = document.createElement('span');
closeButton.innerHTML = 'X';
closeButton.style.position = 'absolute';
closeButton.style.top = '5px';
closeButton.style.right = '5px';
closeButton.style.cursor = 'pointer';
closeButton.addEventListener('click', function() {
    // Schließen Sie das Overlay-Div, wenn das Schließsymbol angeklickt wird
    document.body.removeChild(overlayDiv);
});

// Fügen Sie das Schließsymbol dem Overlay-Div hinzu
overlayDiv.appendChild(closeButton);

// Fügen Sie den select in das Overlay-Div ein
overlayDiv.appendChild(select);

// Fügen Sie das Overlay-Div dem Dokument hinzu
document.body.appendChild(overlayDiv);

} else if (globalCoordAnOderAus === true) {
    // Hier könnten weitere Aktionen für den Fall ausgeführt werden, dass globalCoordAnOderAus true ist
}

  */ 
  if (globalCoordAnOderAus===false){
    var coordinates = evt.coordinate;
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    var layname = layer.get('name');
    var beschreibLangValue = feature.get('beschreib_lang');
    var beschreibLangHtml = '';
    if (beschreibLangValue && beschreibLangValue.trim() !== '') {
    beschreibLangHtml = '<br>' + '<u>' + "Beschreib (lang): " + '</u>' + beschreibLangValue + '</p>';
    };
    // Popup soll nur für bestimmte Layernamen angezeigt werden
    if (layname !== 'gew' && layname !== 'km10scal' && layname !== 'km100scal' && layname !== 'km500scal' && layname !== 'fsk' && layname !== 'son_lin') {
      
      if (feature) {
        coordinates = feature.getGeometry().getCoordinates();
        
        popup.setPosition(coordinates);
        // HTML-Tag Foto1
        var foto1Value = feature.get('foto1');
        var foto1Html = '';
        var foto2Value = feature.get('foto2');
        var foto2Html = '';
        var foto3Value = feature.get('foto3');
        var foto3Html = '';
        var foto4Value = feature.get('foto4');
        var foto4Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto 2 ";
        }
        if (foto3Value && foto3Value.trim() !== '') {
          foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
        } else {
          foto3Html = " Foto 3 ";
        }
        if (foto4Value && foto4Value.trim() !== '') {
          foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
        } else {
          foto4Html = " Foto 4 ";
        }
      
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
          
         
      } else {
        popup.setPosition(undefined);
      }
    }
    // Führen Sie Aktionen für den Layernamen 'gew_info' durch
    if (layname === 'gew_info') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>Name: ' + feature.get('IDUabschn') + '<br>' +
      '<p><a href="' + feature.get('link1') + '" onclick="window.open(\'' + feature.get('link1') + '\', \'_blank\'); return false;">Link 1</a> ' +
      '<a href="' + feature.get('link2') + '" onclick="window.open(\'' + feature.get('link2') + '\', \'_blank\'); return false;">Link 2</a> ' +
      '<a href="' + feature.get('foto1') + '" onclick="window.open(\'' + feature.get('foto1') + '\', \'_blank\'); return false;">Foto 1</a> ' +
      '<a href="' + feature.get('foto2') + '" onclick="window.open(\'' + feature.get('foto2') + '\', \'_blank\'); return false;">Foto 2</a><br>' +
      '<p><a href="' + feature.get('BSB') + '" onclick="window.open(\'' + feature.get('BSB') + '\', \'_blank\'); return false;">BSB  </a>' +
      '<a href="' + feature.get('MNB') + '" onclick="window.open(\'' + feature.get('MNB') + '\', \'_blank\'); return false;">MNB</a><br> ' +
      'Kat: ' + feature.get('Kat') + '</a>' +
      ', KTR: ' + feature.get('REFID_KTR') + '</a>' +
      '<br>' + "von " + feature.get('Bez_Anfang') + " bis " + feature.get('Bez_Ende')  + '</p>' +
      '</div>';
    }
    // Führen Sie Aktionen für den Layernamen 'gew_umn' durch
    if (layname === 'gew_umn') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>ID: ' + feature.get('Massn_ID') + '<br>' +
      '<p>Bez (Art): ' + feature.get('UMnArtBez') + '<br>' +
      '<p>Bez (Gruppe): ' + feature.get('UMNGrBez') + '<br>' +
      '</div>';
    }
    // Führen Sie Aktionen für den Layernamen 'son_lin' durch
    if (layname === 'son_lin') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      var foto1Value = feature.get('foto1');
      console.log (foto1Value);
      var foto1Html = '';
        var foto2Value = feature.get('foto2');
        var foto2Html = '';
        var foto3Value = feature.get('foto3');
        var foto3Html = '';
        var foto4Value = feature.get('foto4');
        var foto4Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto 2 ";
        }
        if (foto3Value && foto3Value.trim() !== '') {
          foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
        } else {
          foto3Html = " Foto 3 ";
        }
        if (foto4Value && foto4Value.trim() !== '') {
          foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
        } else {
          foto4Html = " Foto 4 ";
        }
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'gehoelz_vecLayer' durch
    if (layname === 'gehoelz_vec') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>Gehölzentwicklung' + '<br>' +
      '<br>' + "Bemerk: " + feature.get('UMn_Bemerk') + '</p>' +
      '</div>';
    }
    // Führen Sie Aktionen für den Layernamen 'fsk' durch
    if (layname === 'fsk') {
      if (feature.get('Art') === 'o' || feature.get('Art') === 'l') {
        coordinates = evt.coordinate; // Define coordinates for 'fsk'
        popup.setPosition(coordinates);
        content.innerHTML =
          '<div style="max-height: 300px; overflow-y: auto;">' +
          '<p><strong>gemark Flur Flurstück:</strong><br>' + feature.get('Suche') + '</p>' +
          'FSK: ' + feature.get('fsk') + '</p>' +
          'FSK(ASL): ' + feature.get('FSK_ASL') + '</p>' +
          '<p>' + 'Eig.(öffentl.): ' + feature.get('Eig1') + '</p>' +
          '</div>';
      } else {
        coordinates = evt.coordinate; // Define coordinates for 'fsk'
        popup.setPosition(coordinates);
        content.innerHTML =
          '<div style="max-height: 300px; overflow-y: auto;">' +
          '<p><strong>gemark Flur Flurstück:</strong><br>' + feature.get('Suche') + '</p>' +
          'FSK: ' + feature.get('fsk') + '</p>' +
          '<p>' + 'Art (p=privat): ' + feature.get('Art') + '</p>' +
           '<p>' + 'Eig.(privat): ' + feature.get('Eig1') + '</p>' +
          '</div>';
      }
    }
    
    });
  } else if(globalCoordAnOderAus===true) {  
  console.log ("funktion für marker setzen aufrufen");
  console.log (markerCoordOverlay);
  placeMarkerAndShowCoordinates(evt);
  }
}
);

//--------------------------------------------------Bestimmung geclickter Koordinaten
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(6),
  projection: 'EPSG:4326', // Start-Projektion
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});
// Projektion für Maus anwenden
map.addControl(mousePositionControl);
//Globale Variable, die die Projektion wiedergibt
const projectionSelect = document.getElementById('projecSelect');
//Glabale Variable für markerCoordOverlay
projectionSelect.addEventListener('change', function (event) {
  if (projectionSelect.value === 'EPSG:3857') {
    const format = createStringXY(2);
    mousePositionControl.setCoordinateFormat(format);
    mousePositionControl.setProjection(event.target.value);
    
  } else if (projectionSelect.value === 'EPSG:4326') {
    const format = createStringXY(6);
    mousePositionControl.setCoordinateFormat(format);
    mousePositionControl.setProjection(event.target.value);

  } else if (projectionSelect.value === 'EPSG:32632') {
    console.log('32632')
    const format = createStringXY(1);
    mousePositionControl.setCoordinateFormat(format);
    mousePositionControl.setProjection(event.target.value);
  }
});
// Funktion für den Marker und die Koordinatenausgabe
function placeMarkerAndShowCoordinates(event) {
  const mousePositionElement = document.getElementById('mouse-position'); // Auswahl des HTML-Elements
  if (toggleCheckbox.checked) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    markerCoordOverlay = new Overlay({
      position: event.coordinate,
      positioning: 'center-center', 
      element: marker,
      stopEvent: false,
    });
    map.addOverlay(markerCoordOverlay);
    
    if (projectionSelect.value === 'EPSG:3857') {
      const format = createStringXY(2);
      mousePositionElement.innerHTML = `Coordinates: ${format(event.coordinate)}`;
    } else if (projectionSelect.value === 'EPSG:4326') {
      const format = createStringXY(6);
      const transformedCoordinate = transformCoordinateToMousePosition4326(event.coordinate);
      mousePositionElement.innerHTML = `Coordinates: ${format(transformedCoordinate)}`;
    } else if (projectionSelect.value === 'EPSG:32632') {
      console.log('32632')
      const format = createStringXY(1);
      const transformedCoordinate = transformCoordinateToMousePosition32632(event.coordinate);
      mousePositionElement.innerHTML = `Coordinates: ${format(transformedCoordinate)}`;
      //const googleMapsLink = `https://maps.app.goo.gl/?q=${transformedCoordinate[0]},${transformedCoordinate[1]}`;
      //console.log(googleMapsLink);
    }
  }
};
// Checkbox, wenn an kann der Marker gesetzt werden und die Koordinaten werden ausgegeben
const toggleCheckbox = document.getElementById('toggle-checkbox');
toggleCheckbox.addEventListener('change', function() {
  if (this.checked) {
    document.getElementById('mouse-position').innerHTML = "";
    map.removeControl(mousePositionControl); 
    globalCoordAnOderAus=true;
    console.log(globalCoordAnOderAus);
  } else {
    if (markerCoordOverlay) {
      console.log('es gibt einen Marker');
      map.removeOverlay(markerCoordOverlay);
    };
    globalCoordAnOderAus=false;
    console.log(globalCoordAnOderAus);
    map.addControl(mousePositionControl);
  }
});
//Button, der die Sichtbarkeit des Controlls steuert
// Array zum Speichern aller hinzugefügten Marker
let markerCoordOverlay
document.getElementById('hide-button').addEventListener('click', function() {
  const controls = document.querySelector('.controls');
  controls.classList.toggle('hidden');
  const customControls = document.getElementById('custom-controls');
  // Wenn das Control verborgen ist
  if (controls.classList.contains('hidden')) {
    // Überprüfen und Entfernen aller Marker, die durch markerCoordOverlay dargestellt werden
    //map.removeOverlay(marker);
    document.getElementById('toggle-checkbox').checked = false;
    customControls.buttonLength.disabled = true;
    // Wenn das Control sichtbar ist
  } else {
    // Muss eigentlich true sein
    map.addControl(mousePositionControl);
    customControls.buttonLength.disabled = false;
  }
});

//Umrechnung geclickter Kartenpositionen in mousePositionControl-Format
//für EPSG:4326
function transformCoordinateToMousePosition4326(coordinate) {
  // Koordinaten in das Format von mousePositionControl (EPSG:4326) umwandeln
  return transform(coordinate, map.getView().getProjection(), 'EPSG:4326');
}
//für EPSG:32632
function transformCoordinateToMousePosition32632(coordinate) {
  // Koordinaten von der aktuellen Karte (EPSG:3857) nach EPSG:32632 umwandeln
  //  const transformedCoordinate32632 = transform(clickedCoordinate3857, 'EPSG:3857', 'EPSG:32632');
  return transform(coordinate, 'EPSG:3857', 'EPSG:32632');
}

//--------------------------------------------Hyerperlink um ein neues Browserfenster zu öffnen wird dem Popup hinzugefügt
document.addEventListener('DOMContentLoaded', function () {
  var popup = document.getElementById('popup');
  var popupCloser = document.getElementById('popup-closer');
  var container = document.createElement('div');
  var link = document.createElement('a');
  //schreibeInnerHtml(layer);
  link.textContent = 'Weitere Infos';
  link.href = '#'; // Verhindert, dass der Link die Seite neu lädt
  link.addEventListener('click', function(event) {
    event.preventDefault(); // Verhindert die Standardaktion des Links
    var newWindow = window.open('', '_blank');
    newWindow.document.body.innerHTML = 
      '<p>Hallo neue Welt</p>'
      /* + 
      '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
      '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
      '<p>' + foto1Html +  
      '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
      '<p>' + beschreibLangHtml + '</p>' +
      '</div>'; */
  });
  container.appendChild(link);
  container.appendChild(popupCloser);
  popup.appendChild(container);
});
//--------------------------------------------Popup schließen
document.getElementById('popup-closer').onclick = function () {
  popup.setPosition(undefined);
  return false;
};

//----------------------------------------------Print
const dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148],
};

document.getElementById('print-button').addEventListener('click', function() {
  //document.getElementById('print-button').disabled = true;
  alert('Erstmal bitte nur mit OSM als Hintergrund');
  document.body.style.cursor = 'progress';
  const format = 'a4';//document.getElementById('format').value;
  const resolution = '72' //document.getElementById('resolution').value;
  const dim = dims[format];
  const width = Math.round((dim[0] * resolution) / 25.4);
  const height = Math.round((dim[1] * resolution) / 25.4);
  const size = map.getSize();
  const viewResolution = map.getView().getResolution();
  map.once('rendercomplete', function () {
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layer canvas'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          const transform = canvas.style.transform;
          // Get the transform parameters from the style's transform matrix
          const matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number);
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix,
          );
          mapContext.drawImage(canvas, 0, 0);
        }
      },
    );
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    const pdf = new jsPDF('landscape', undefined, format);
    pdf.addImage(
      mapCanvas.toDataURL('image/jpeg'),
      'JPEG',
      0,
      0,
      dim[0],
      dim[1],
    );
    pdf.save('map.pdf');
    // Reset original map size
    map.setSize(size);
    map.getView().setResolution(viewResolution);
    document.getElementById('print-button').disabled = false; //exportButton.disabled = false;
    document.body.style.cursor = 'auto';
  });
  // Set print size
  const printSize = [width, height];
  map.setSize(printSize);
  const scaling = Math.min(width / size[0], height / size[1]);
  map.getView().setResolution(viewResolution / scaling);
},
false,
);

// Current selection
var sLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({ image: new CircleStyle({radius: 5,stroke: new Stroke ({color: 'rgb(255,165,0)', width: 3 }),fill: new Fill({color: 'rgba(255,165,0,.3)' })      }),
      stroke: new Stroke ({
          color: 'rgb(255,165,0)',
          width: 3
      }),
      fill: new Fill({
          color: 'rgba(255,165,0,.3)'
      })
  })
});
map.addLayer(sLayer);

//----------------------------------------------------------- Set the search control 
/* var search = new SearchNominatim (
  {   //target: $(".options").get(0),
    
      polygon: $("#polygon").prop("checked"),
      //placeholder: 'Suche nach Adresse', // Platzhaltertext für das Suchfeld
      position: true,  // Search, with priority to geo position
      reverse: true,
      
  });
map.addControl (search);
 */
var search = new SearchPhoton({
  //target: $(".options").get(0),
  lang:"de",		// Force preferred language
  polygon: $("#polygon").prop("checked"),
  reverse: true,
  position: true	// Search, with priority to geo position
});
map.addControl (search);

// Select feature when click on the reference index
search.on('select', function(e)
  {   // console.log(e);
      sLayer.getSource().clear();
      // Check if we get a geojson to describe the search
      if (e.search.geojson) {
          var format = new GeoJSON();
          var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
          sLayer.getSource().addFeature(f);
          var view = map.getView();
          var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), map.getSize());
          var zoom = view.getZoomForResolution(resolution);
          var center = ol.extent.getCenter(f.getGeometry().getExtent());
          // redraw before zoom
          setTimeout(function(){
                  view.animate({
                  center: center,
                  zoom: Math.min (zoom, 16)
              });
          }, 100);
      }
      else {
          map.getView().animate({
              center:e.coordinate,
              zoom: Math.max (map.getView().getZoom(),16)
          });
      }
      // Füge den Marker hinzu
      addMarker(e.coordinate);
  });

// Funktion zum Hinzufügen eines Markers
function addMarker(coordinates) {
  var marker = new Feature({
    geometry: new Point(coordinates)
  });
  var markerStyle = new Style({
    image: new Icon({
      src: 'data/marker.svg', // Pfad zur Bilddatei
      //scale: 0.5 // Skalierung des Bildes
    })
  });
  marker.setStyle(markerStyle);
  sLayer.getSource().clear(); // Löscht vorherige Marker
  sLayer.getSource().addFeature(marker);
};


//-----------------------------------------Menü mit Submenü
/* Nested subbar */
var sub2 = new Bar({
  toggleOne: true,
  controls: [
    new TextButton({
      html:"2.1", 
      handleClick: function() {
      //Aktionen
      } 
    }),
    new TextButton({
      html:"2.2", 
      handleClick: function() { 
        //Aktionen
      } 
    })
  ]
});
//GPS-Postionn
var sub1 = new Bar({
  toggleOne: true,
  controls:[
    new Toggle({
      html: "P",
      //autoActivate: true,
      onToggle: 
      function () {
        if (!watchId) {
          // Starte die Geolokalisierung, wenn sie nicht aktiv ist
          isActive = true; // Richtiges Zuweisen von isActive
          watchId = navigator.geolocation.watchPosition(
            function (pos) {
              const coords = [pos.coords.longitude, pos.coords.latitude];
              const accuracy = circular(coords, pos.coords.accuracy);
              sourceP.clear(true);
              sourceP.addFeatures([
                new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
                new Feature(new Point(proj.fromLonLat(coords) ) ),
                
              ]);
      
              // Führe den Zoom nur beim ersten Mal aus
              if (isFirstZoom) {
                map.getView().fit(sourceP.getExtent(), { maxZoom: 13, duration: 500 }); 
                isFirstZoom = false; // Setze isFirstZoom auf false, um zukünftige Zooms zu verhindern
              }
              // Füge den Layer hinzu, um die Position anzuzeigen
              if (!layerP) {
                layerP = new VectorLayer({
                  displayInLayerSwitcher: false,
                  style: new Style({
                    image: new CircleStyle({
                      radius: 8,
                      opacity: 0.5,
                      fill: new Fill({
                        color: 'red'
                      }),
                      stroke: new Stroke({
                        color: 'black',
                        width: 2
                      })
                    })
                  }),
                  source: sourceP,
                  title: 'Null',
                  name: 'Null',
                  zIndex: 9999,
                });
                map.addLayer(layerP);
                }
              },
            function (error) {
              alert(`ERROR: ${error.message}`);
            },
            {
              enableHighAccuracy: true,
            }
          );
        } else {
          // Beende die Geolokalisierung, wenn sie bereits aktiv ist
          navigator.geolocation.clearWatch(watchId);
          watchId = null; // Setze die Watch-ID auf null, um anzuzeigen, dass die Geolokalisierung deaktiviert ist
          isActive = false; // Richtiges Zuweisen von isActive
             // Entferne den Layer, um die Position nicht mehr anzuzeigen
          if (layerP) {
            map.removeLayer(layerP);
            layerP = null;
          }
        }
        updateButtonAppearance(); // Aktualisieren Sie das Erscheinungsbild des Buttons basierend auf dem aktualisierten isActive-Status
      } ,
    }),
    new Toggle({
      html:"2", 
      onToggle: function(b) {  },
      // Second level nested control bar
      bar: sub2
    })
  ]
});
//Mainbar1
var mainBar1 = new Bar({
  controls: [
    new Toggle({
      html: "H",
      // First level nested control bar
      bar: sub1,
      onToggle: function() { },
      
    })
  ]
});
map.addControl ( mainBar1 );
mainBar1.setPosition('left');

// Inhalt von main.js

//------------------------WMS-Control aus myFunc.js hinzufügen
document.addEventListener('DOMContentLoaded', function() {
  initializeWMS(WMSCapabilities, map ); // Aufrufen der initializeWMS-Funktion aus myFunc.js
});