import GeoJSON from 'ol/format/GeoJSON.js';
import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import Feature from 'ol/Feature';

import { Circle as CircleGeom } from 'ol/geom';

import Draw from 'ol/interaction/Draw.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke,Style} from 'ol/style.js';
import {LineString, Polygon, Point} from 'ol/geom.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import {Attribution, defaults as defaultControls, Control} from 'ol/control.js';

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
  machWasMitFSK
} from './extStyle';

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

/// Marker für Positionsmarkierung zur Adresssuche
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

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});
  
const map = new Map({
  target: "map",
  view: mapView,
  //controls: defaults().extent([attribution, additionalControl]),
});
// Vektor-Layer erstellen
const exp_bw_sle_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_sle.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox}),
  style: sleStyle, // Stil zuweisen
});
// exp_gew_info
const gehoelz_vecLayer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gehoelz_vec.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gehölz(Plan)', // Titel für den Layer-Switcher
  name: 'gehoelz_vec',
  style: gehoelz_vecStyle,
  visible: true
});
const exp_allgm_fsk_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_allgm_fsk.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'fsk',
  name: 'fsk', 
  style: getStyleForArtFSK,
  visible: true,
  minResolution: 0,
  maxResolution: 4
})
 const osmTile = new TileLayer({
  title: "osm",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
});

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
class CustomControls extends Control {
  constructor(options) {
    const element = document.createElement('div');
    element.className = 'custom-controls ol-unselectable ol-control';
    const buttonLength = document.createElement('button');
    buttonLength.innerHTML = 'L';
    buttonLength.className = 'ol-button';
    buttonLength.addEventListener('click', function() {
      alert('doppelclick um linie abzuschließen, zum beenden rechtsclick');
      addInteraction('LineString');
    });
    const buttonArea = document.createElement('button');
    buttonArea.innerHTML = 'F';
    buttonArea.className = 'ol-button';
    buttonArea.addEventListener('click', function() {
      alert('doppelclick um linie abzuschließen, zum beenden rechtsclick');
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
map.addControl(new CustomControls({
  target: 'custom-controls'
}));
map.getViewport().addEventListener('contextmenu', function(evt) {
  evt.preventDefault(); // Verhindert das Standardkontextmenü
  if (draw) {
    console.log('beenden');
    source.clear(); // Löscht alle Vektoren aus der Quelle
    draw.finishDrawing(); // Beendet die laufende Messung
    map.removeInteraction(draw); // Entfernt die Zeicheninteraktion
    map.un('pointermove', pointerMoveHandler); // Entfernt den Event-Listener für 'pointermove'
    map.removeOverlay(measureTooltip); // Entfernt das Messergebnis-Tooltip
    map.removeOverlay(helpTooltip);
    return; // Beende die Funktion, um weitere Interaktionen zu verhindern
  }
});

map.addLayer(osmTile);
map.addLayer(exp_bw_sle_layer, gehoelz_vecLayer, exp_allgm_fsk_layer);
map.addLayer(vector); 
