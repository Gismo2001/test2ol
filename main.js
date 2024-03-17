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

import {Circle as CircleStyle, Fill, Stroke,Style} from 'ol/style.js';

import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';

import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import {Attribution, ZoomToExtent, defaults as defaultControls, Control} from 'ol/control.js';

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import { 
  getStyleForArtEin,
  gehoelz_vecStyle, 
  sleStyle, 
  wehStyle, 
  bru_nlwknStyle, 
  bruAndereStyle,
  dueStyle, 
  queStyle, 
  getStyleForArtFSK, 
  getStyleForArtUmn,
  son_linStyle, 
  son_punStyle,
  km10scalStyle,
  km100scalStyle,
  km500scalStyle,
  combinedStyle,
  machWasMitFSK
} from './extStyle';
import { calcSumme } from './myFunc.js';

///////Test
var ergebnis = calcSumme(5, 3);
console.log(ergebnis);

window.searchAddress = function searchAddress() {
  var address = document.getElementById('addressInput').value;
  // Direktes Setzen des API-Schlüssels, falls process.env.API_KEY nicht definiert ist
  var apiKey = 'c592a3d99b8d43878cf7d727d44187ce';

  var apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        var location = data.results[0].geometry;
        // Karte auf die gefundenen Koordinaten zentrieren
        map.getView().setCenter(proj.fromLonLat([location.lng, location.lat]));
        map.getView().setZoom(17); // Zoom-Level anpassen

        // Temporären Marker hinzufügen
        console.log (location.lng, location.lat);
        addTempMarker([location.lng, location.lat]);
      } else {
        // Adresse nicht gefunden, Meldung ausgeben
        alert('Adresse nicht gefunden');
      }
    })
    .catch(error => {
      console.error('Geokodierung-Fehler:', error);
      removeTempMarker();
    });
}
// Event-Listener für die Enter-Taste hinzufügen
var inputElement = document.getElementById('addressInput');
inputElement.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    searchAddress();
  }
});
// Marker für Positionsmarkierung zur Adresssuche
function addTempMarker(coordinates) {
  var tempMarkerLayer = new VectorLayer({
    source: new VectorSource({
      features: [new Feature({
        geometry: new Point(coordinates),
      })]
    }),
    style: new Style({
      image: new CircleGeom({
        radius: 20, // Radius des Kreises
        fill: new Fill({ color: 'red' }), // Ändern Sie die Füllfarbe des Kreises auf Rot
        stroke: new Stroke({ color: 'black', width: 2 }) // Randfarbe und -breite des Kreises bleiben unverändert
      })
    })
  });

  // Fügen Sie den temporären Marker-Layer zur Karte hinzu
  map.addLayer(tempMarkerLayer);
}
function removeTempMarker() {
  // Durchlaufen Sie alle Karten-Layer und entfernen Sie alle, die als temporärer Marker markiert sind
  alert('xxmarker ');
  map.getLayers().getArray().forEach(function (layer) {
    if (layer.get('tempMarker')) {
      map.removeLayer(layer);
    }
  });
}

const attribution = new Attribution({
  collapsible: false,
});
//attribution.element.className = 'ol-button'; // Füge die Klasse ol-button hinzu

const additionalControl = new ZoomToExtent({
  extent: [
    727361,  6839277, 858148,
    6990951,
  ],
});
//additionalControl.element.className = 'ol-button'; // Füge die Klasse ol-button hinzu

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});
const map = new Map({
  target: "map",
  view: mapView,
  controls: defaultControls().extend([attribution, additionalControl]),
});
const sourceP = new VectorSource();
let layerP = null; // Initial kein Layer vorhanden

let watchId = null; // Variable, um die Watch-ID der Geolokalisierung zu speichern

const locateP = document.createElement('div');
locateP.className = 'ol-control ol-unselectable locate';
locateP.innerHTML = '<button title="Locate me">◎</button>';
let isActive = false; // Variable, um den Aktivierungsstatus der Geolokalisierung zu verfolgen

// Funktion zum Aktualisieren des Aussehens des Buttons basierend auf dem Aktivierungsstatus
function updateButtonAppearance() {
  if (isActive) {
    locateP.classList.add('active'); // Füge die Klasse 'active' hinzu, um den aktiven Zustand anzuzeigen
  } else {
    locateP.classList.remove('active'); // Entferne die Klasse 'active', um den deaktivierten Zustand anzuzeigen
  }
}

locateP.addEventListener('click', function () {
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
          new Feature(new Point(proj.fromLonLat(coords))),
        ]);
        map.getView().fit(sourceP.getExtent(), { maxZoom: 18, duration: 500 }); // Korrigierte Schließung der fit-Methode

        // Füge den Layer hinzu, um die Position anzuzeigen
        if (!layerP) {
          layerP = new VectorLayer({
            source: sourceP,
            title: 'Position',
            name: 'Position',
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
});

map.addControl(
  new Control({
    element: locateP,
  })
);


// Layer für Messung
const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#ffcc33',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
});
let sketch;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;

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
  style: son_linStyle,
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
  style: son_punStyle,
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
  visible: true
});

const km10scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_10_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km10scal', // Titel für den Layer-Switcher
  style: km10scalStyle,
  visible: true,
  minResolution: 0,
  maxResolution: 1 
});
const km100scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_100_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km100scal', // Titel für den Layer-Switcher
  style: function(feature, resolution) {
    return km100scalStyle(feature, feature.get('TextString'), resolution);
  },
  visible: true,
  minResolution: 0,
  maxResolution: 3 
});
const km500scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_500_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km500scal', // Titel für den Layer-Switcher
  style: function(feature, resolution) {
    return km500scalStyle(feature, feature.get('TextString'), resolution);
  },
  visible: true,
  minResolution: 0,
  maxResolution: 10 
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
      'LAYERS': 'Fliessgewaesser_WRRL',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
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
const googleLayer = new TileLayer({
  title: "GoogleSat",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' })
});
const ESRIWorldImagery = new TileLayer({
  title: 'ESRI',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  })
});
const osmTile = new TileLayer({
  title: "osm",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
});

const layerSwitcher = new LayerSwitcher({ });
map.addControl(layerSwitcher);

// Funktionen für Messung
const pointerMoveHandler = function (evt) {
  if (evt.pointerType === 'touch') {
    if (evt.dragging) {
       return;
    }
    let helpMsg = 'Click to start drawing';
    if (sketch) {
      const geom = sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = 'Click to continue drawing the polygon';
      } else if (geom instanceof LineString) {
        helpMsg = 'Click to continue drawing the line';
      }
    }

    if (helpTooltipElement) { // Überprüfen, ob helpTooltipElement definiert ist
      helpTooltipElement.innerHTML = helpMsg; // Nur wenn helpTooltipElement definiert ist, setzen Sie innerHTML
      helpTooltip.setPosition(evt.coordinate);
      helpTooltipElement.classList.remove('hidden');
    }
  } else {
    if (evt.dragging) {
      return;
    }
    let helpMsg = 'Click to start drawing';
    if (sketch) {
      const geom = sketch.getGeometry();
       if (geom instanceof Polygon) {
         helpMsg = 'Click to continue drawing the polygon';
      } else if (geom instanceof LineString) {
         helpMsg = 'Click to continue drawing the line';
      }
    }
    if (helpTooltipElement) { // Überprüfen, ob helpTooltipElement definiert ist
    helpTooltipElement.innerHTML = helpMsg; // Nur wenn helpTooltipElement definiert ist, setzen Sie innerHTML
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove('hidden');
  }
 }  
};
map.on('pointermove', pointerMoveHandler);
let draw;
const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};
const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
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
  createHelpTooltip();
  map.getViewport().addEventListener('mouseout', function () {
    helpTooltipElement.classList.add('hidden');
  });
  
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
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
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

map.getViewport().addEventListener('contextmenu', function(evt) {
  evt.preventDefault(); // Verhindert das Standardkontextmenü
  if (draw) {
    console.log('beenden');
    source.clear(); // Löscht alle Vektoren aus der Quelle
    draw.finishDrawing(); // Beendet die laufende Messung
    map.removeInteraction(draw); // Entfernt die Zeicheninteraktion
    map.un('pointermove', pointerMoveHandler); // Entfernt den Event-Listener für 'pointermove'
    map.removeOverlay(measureTooltip); // Entfernt das Messergebnis-Tooltip
    map.removeOverlay(helpTooltip); // Entfernt das Help-Tooltip
    return; // Beende die Funktion, um weitere Interaktionen zu verhindern
  }
});


//Custom Controls 1 und 2
class CustomControls1 extends Control {
  constructor(options) {
    const element = document.createElement('div');
    element.className = 'custom-controls1 ol-unselectable ol-control';
    const buttonLength = document.createElement('button');
    buttonLength.innerHTML = 'L';
    buttonLength.className = 'ol-button';
    buttonLength.addEventListener('click', function() {
      console.log('länge gecklickt')
      addInteraction('LineString');
    });
    const buttonArea = document.createElement('button');
    buttonArea.innerHTML = 'F';
    buttonArea.className = 'ol-button';
    buttonArea.addEventListener('click', function() {
      console.log('Fläche gecklickt')
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


class CustomControls2 extends Control {
  constructor(options) {
    const element = document.createElement('div');
    element.className = 'custom-controls2 ol-unselectable ol-control';
    const buttonPosition = document.createElement('button');
    buttonPosition.innerHTML = 'P';
    buttonPosition.className = 'ol-button';

    // Event-Listener für den Klick auf den Button hinzufügen
    buttonPosition.addEventListener('click', function() {
      console.log('Position geklickt');
    });

    // Event-Listener für das Touch-Ereignis auf dem Button hinzufügen
    buttonPosition.addEventListener('touchstart', function() {
      console.log('Position (Touch) geklickt');
    });

    element.appendChild(buttonPosition);
    super({
      element: element,
      target: options.target,
    });
  }
}

map.addControl(new CustomControls2({
  target: 'custom-controls'
}));






const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  fold: true,
  fold: 'close',  
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_weh_layer, exp_bw_sle_layer]
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
  layers: [ESRIWorldImagery, googleLayer, dop20ni_layer, osmTile]
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

//Info für WMS-Layer
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
              console.error('Fehler beim Abrufen der Informationen:', error);
            });
        }
      }
    });
  } else {
    console.log('Die wmsLayerGroup ist nicht eingeschaltet.');
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


// Funktionen für Popup
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
map.on('click', function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    /* Neu
    var txtName = feature.get('name');
    var txtPopupCloser = document.getElementById('popup-closer');
    txtPopupCloser.innerHTML = (txtName);
    */
    var layname = layer.get('name');
    var coordinates = evt.coordinates;
    var beschreibLangValue = feature.get('beschreib_lang');
    var beschreibLangHtml = '';
    if (beschreibLangValue && beschreibLangValue.trim() !== '') {
    beschreibLangHtml = '<br>' + '<u>' + "Beschreib (lang): " + '</u>' + beschreibLangValue + '</p>';
    };
    // Popup soll nur für bestimmte Layernamen angezeigt werden
    if (layname !== 'gew' && layname !== 'km10scal' && layname !== 'km100scal' && layname !== 'km500scal' && layname !== 'fsk' && layname !== 'son_lin') {
      console.log('Clicked on layer:', layname);
      machWasMitFSK(feature);
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
      content.innerHTML =
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>Name: ' + feature.get('name') +  ' (' + feature.get('KTR') +')' + '<br>' +
      '<p><a href="' + feature.get('foto1') + '" onclick="window.open(\'' + feature.get('foto1') + '\', \'_blank\'); return false;">Foto 1</a> ' +
      '<a href="' + feature.get('foto2') + '" onclick="window.open(\'' + feature.get('foto2') + '\', \'_blank\'); return false;">Foto 2</a> ' +
      '<a href="' + feature.get('foto3') + '" onclick="window.open(\'' + feature.get('foto3') + '\', \'_blank\'); return false;">Foto 3</a> ' +
      '<a href="' + feature.get('foto4') + '" onclick="window.open(\'' + feature.get('foto4') + '\', \'_blank\'); return false;">Foto 4</a></p>' +
      '<br>' + "Beschreib kurz = " + feature.get('beschreib') + '</p>' +
      beschreibLangHtml +
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
});
document.addEventListener('DOMContentLoaded', function () {
  var popup = document.getElementById('popup');
  var popupCloser = document.getElementById('popup-closer');
  var container = document.createElement('div');
  var link = document.createElement('a');
  link.textContent = 'Weitere Infos';

  link.href = '#'; // Verhindert, dass der Link die Seite neu lädt
  link.addEventListener('click', function(event) {
    event.preventDefault(); // Verhindert die Standardaktion des Links
    var newWindow = window.open('', '_blank');
    newWindow.document.body.innerHTML = '<p>Hallo neue Welt</p>';
  });
  
  container.appendChild(link);
  container.appendChild(popupCloser);
  popup.appendChild(container);
});
document.getElementById('popup-closer').onclick = function () {
  popup.setPosition(undefined);
  return false;
};
