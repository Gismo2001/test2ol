import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay.js';
import Draw from 'ol/interaction/Draw.js';

import {LineString, Polygon, Point, Circle} from 'ol/geom.js';
//import circular from 'ol/geom/Polygon';
import { circular } from 'ol/geom/Polygon';
import Geolocation from 'ol/Geolocation.js';

import jsPDF from "jspdf";
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Text from 'ol/style/Text';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';

import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';
import { DragAndDrop } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import MousePosition from 'ol/control/MousePosition.js';
import { transform } from 'ol/proj';
import {createStringXY} from 'ol/coordinate.js';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import SearchPhoton from 'ol-ext/control/SearchPhoton';
import SearchFeature from 'ol-ext/control/SearchFeature';
//import SearchNominatim from 'ol-ext/control/SearchNominatim';
import WMSCapabilities from'ol-ext/control/WMSCapabilities';
import collection from 'ol/Collection';


import CanvasAttribution from 'ol-ext/control/CanvasAttribution';
import CanvasTitle from 'ol-ext/control/CanvasTitle';
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine';
import PrintDialog from 'ol-ext/control/PrintDialog';

import { format } from 'ol/coordinate';
import contextFeature from 'ol/Feature';


import FeatureList from 'ol-ext/control/FeatureList';

import Icon from 'ol/style/Icon'; // Hinzufügen Sie diesen Import

import Bar from 'ol-ext/control/Bar';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import { Modify, Select } from 'ol/interaction'; // Importieren Sie Draw
import TextButton from 'ol-ext/control/TextButton';
import EditBar from 'ol-ext/control/EditBar';
import Tooltip from 'ol-ext/overlay/Tooltip';
import Notification from 'ol-ext/control/Notification';

import Button from 'ol-ext/control/Button';

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import { 
  getStyleForArtEin,
  getStyleForArtSonPun,
  gehoelz_vecStyle, 
  exp_gew_fla_vecStyle,
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
  arrowStyle,
  machWasMitFSK,
  geojsonStyle,
  getStyleForArtSonLin,
  getStyleForArtGewInfo
} from './extStyle';
import { UTMToLatLon_Fix } from './myNewFunc';
import { createLoader } from 'ol/source/wms';


//projektion definieren und registrieren
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
register(proj4);
var globalCoordAnOderAus = false;


// Funktion zum Verschieben des DIVs
//function dragInfo() {
//  dragElement(document.getElementById("Info"));  
//}

const attribution = new Attribution({
  collapsible: true,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

// Function to remove all overlays
function removeAllOverlays() {
  map.getOverlays().clear();
}
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
      extent: [727361, 6839277, 858148, 6990951] 
    }),
    attribution,
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});




var note = new Notification(
  {
    className: 'ol-notification',
    //autoClose: false,
    closeBox: true,
    closeBoxTitle: 'close',
    //closeBoxCallback: function() {console.log('closeBoxCallback');},
    
  }
);
map.addControl(note)



/* Für das Laden eines Permalinks

  window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const layersParam = urlParams.get('layers');
  if (layersParam) {
    const layersToShow = layersParam.split(',');
    map.getLayers().getArray().forEach(group => {
      if (group instanceof LayerGroup) {
        let groupName = group.get('name');
        group.getLayers().forEach(layer => {
          let layerFullName = `${groupName}.${layer.get('name')}`;
          if (layersToShow.includes(layerFullName)) {
            layer.setVisible(true);
            //group.setVisible(true);
            console.log("Layer sichtbar:", layerFullName);
          } else {
            layer.setVisible(false);
            console.log("Layer unsichtbar:", layerFullName);
          }
        });
      }
    });
  }
};
 */




//----------------------------------------------------------------------------------------------------------APrint
map.addControl(new CanvasAttribution());
map.addControl(new CanvasTitle({ 
  title: '', 
  visible: false,
  style: new Style({ 
    text: new Text({ font: 'bold 12pt "Arial",Verdana,Geneva,Lucida,Lucida Grande,Helvetica,sans-serif' })
  }),
}));
map.addControl(new CanvasScaleLine());

var printControl = new PrintDialog({ 
  title: 'Drucken',
  lang: 'de',
  //target: document.getElementById('print-container'), 
  //openWindow: ,
});
printControl.setSize('A4');
printControl.setOrientation('portrait');
//map.addControl(printControl);
//printControl.element.style.zIndex = '10009';

/* On print > save image file */
printControl.on(['print', 'error'], function(e) {
  //document.body.style.overflow = 'hidden'; 
  //document.body.style.overflow = '';
  if (e.image) {
    if (e.pdf) {
      // Export pdf using the print info
      var pdf = new jsPDF({
        orientation: e.print.orientation,
        unit: e.print.unit,
        format: e.print.size
      });
      pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[1], e.print.imageWidth, e.print.imageHeight);
      pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
    } else  {
      // Save image as file
      if (e.canvas.toBlob) {
        e.canvas.toBlob(function(blob) {
          var name = (e.print.legend ? 'legend.' : 'map.') + e.imageType.replace('image/', '');
          saveAs(blob, name);
        }, e.imageType, e.quality);
      } else {
        var dataURL = e.canvas.toDataURL(e.imageType, e.quality);
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = (e.print.legend ? 'legend.' : 'map.') + e.imageType.replace('image/', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
  } else {
    console.warn('No canvas to export');
  }
});



//------------------------------------Attribution collapse
/*
function checkSize() {
  const small = map.getSize()[0] < 600;
  attribution.setCollapsible(small);
  attribution.setCollapsed(small);
}
map.on('change:size', checkSize);
checkSize();
*/

//---------------------------------------------------Marker für Adresssuche
const sourceP = new VectorSource();
let layerP = null; // Initial kein Layer vorhanden
let isFirstZoom = true; // Variable, um den ersten Zoom zu verfolgen
let watchId = null; // Variable, um die Watch-ID der Geolokalisierung zu speichern

//Button für Positionierung
const locateP = document.createElement('div');
let isActive = false; // Variable, um den Aktivierungsstatus der Geolokalisierung zu verfolgen

/*
const WFS_vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return (
      'https://geodaten.emsland.de/core-services/services/lkel_fb67_wasserwirtschaft_wfs?' +
      'service=WFS&version=1.1.0&request=GetFeature&' +
      'typename=lkel_fb67_landwirtschaftliche_feldberegung_oberflaechengewaesser&' +  
      'outputFormat=application/json&srsname=EPSG:3857&' +
      'bbox=' + extent.join(',') + ',EPSG:3857'
    );
  },
  strategy: LoadingStrategy.bbox,
});

const WFS_vector = new VectorLayer({
  source: WFS_vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'white',
      width: 0.75,
    }),
    fill: new Fill({
      color: 'rgba(100,100,100,0.25)',
    }),
  }),
  title: 'WFS',
});

map.addLayer(WFS_vector);
*/

//die Layer
const exp_gew_fla_vecLayer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_info_fla.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gewässerflächen', // Titel für den Layer-Switcher
  //permalink:"son_pun",  // Um Permalink zu setzen
  name: 'exp_gew_fla',
  style: exp_gew_fla_vecStyle,
  visible: false
});

const exp_gew_biotope_noh = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_biotope_noh.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Biotope_Noh', // Titel für den Layer-Switcher
  name: 'exp_bw_biotope_noh',
  style: exp_gew_fla_vecStyle,
  visible: false
});

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
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_info.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gew, Info', 
  name: 'gew_info',
  style: getStyleForArtGewInfo,
  visible: false
});
const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', 
  name: 'gew',
  style: new Style({fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),stroke: new Stroke({ color: 'blue', width: 2 }) }),
  visible: true
})

const exp_bw_son_pun_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_son_pun.geojson' + '?bbox=' + extent.join(','); },strategy: LoadingStrategy.bbox}),
  title: 'Sonstige, Punkte', 
  name: 'son_pun', 
  style: getStyleForArtSonPun,
  visible: false
});
const exp_bw_ein_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_ein.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Einläufe', 
  name: 'ein', 
  style: getStyleForArtEin,
  visible: false
});
const exp_bw_que_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_que.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox}),
  title: 'Querung', 
  name: 'que', 
  style: queStyle,
  visible: false
});
const exp_bw_due_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_due.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox }),
  title: 'Düker', 
  name: 'due', 
  style: dueStyle,
  visible: false
});
const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox}),
  title: 'Wehr', 
  name: 'weh', 
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
  source: new VectorSource({format: new GeoJSON(),url:function (extent) {return './myLayers/exp_bw_bru_andere.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (andere)',
  name: 'bru_andere', 
  style: bruAndereStyle,
  visible: false
});

const exp_bw_sle_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url:function (extent) {return './myLayers/exp_bw_sle.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox }),
  title: 'Schleuse', 
  name: 'sle', 
  style: sleStyle,
  visible: true, 
});

const km10scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_10_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km10scal',
  name: 'km10cal',
  style: km10scalStyle,
  visible: true,
  minResolution: 0,
  maxResolution: 1
});
const km100scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_100_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km100scal',
  name: 'km100cal',
  style: function(feature, resolution) {return km100scalStyle(feature, feature.get('km'), resolution);  },
  visible: true,
  minResolution: 0,
  maxResolution: 3 
});
const km500scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_500_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km500scal',
  name: 'km500cal',
  style: function(feature, resolution) {return km500scalStyle(feature, feature.get('km'), resolution);  },
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
  visible: true,
  opacity: 1,
});

const gnAtlas2023 = new TileLayer({
  title: "2023_NI",
  name: "2023_NI",
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {"LAYERS": "ni_dop20", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2020 = new TileLayer({
  title: "2020_NI",
  name: "2020_NI",
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2020", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2017 = new TileLayer({
  title: "2017_NI",
  name: "2017_NI",
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2017", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: true,
});
const gnAtlas2014 = new TileLayer({
  title: "2014_NI",
  name: "2014_NI",
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2014", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2012 = new TileLayer({
  title: "2012_NOH",
  name: "2012_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "9", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas2011 = new TileLayer({
  title: "2011_NI",
  name: "2011_NI",
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2011", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2010 = new TileLayer({
  title: "2010_NOH",
  name: "2010_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "8", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas2009 = new TileLayer({
  title: "2009_NOH",
  name: "2009_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "7", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas2002 = new TileLayer({
  title: "2002_NOH",
  name: "2002_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "6", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});

const gnAtlas1990 = new TileLayer({
  title: "1990_NOH",
  name: "1990_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "5", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});

const gnAtlas1980 = new TileLayer({
  title: "1980_NOH",
  name: "1980_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "4", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas1970 = new TileLayer({
  title: "1970_NOH",
  name: "1970_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "3", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas1957 = new TileLayer({
  title: "1957_NOH",
  name: "1957_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "2", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas1937 = new TileLayer({
  title: "1937_NOH",
  name: "1937_NOH",
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "1", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});

var baseDE_layer = new TileLayer({
  title: "Base-DE",
  name: "Base-DE",
  type: 'base',
  source: new TileWMS({
    url: "https://sgx.geodatenzentrum.de/wms_basemapde",
    attributions: '© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs) CC BY 4.0',
    params: {
      "LAYERS": "de_basemapde_web_raster_farbe",
      "TILED": true,
      "VERSION": "1.3.0"
    },
  }),
  opacity: 1,
  visible: false,
});
var dop20ni_layer = new TileLayer({
  title: "DOP20 NI",
  name: "DOP20 NI",
  type: 'base',
  source: new TileWMS({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {
      "LAYERS": "ni_dop20",
      "TILED": true, 
      "VERSION": "1.3.0"
    },
  }),
  opacity: 1,
  visible: false,  
});
const googleSatLayer = new TileLayer({
  title: "GoogleSat",
  name: "GoogleSat",
  type: 'base',
  baseLayer: false,
  source: new TileImage({url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' }),
  opacity: 1,
  visible: false,
});
const googleHybLayer = new TileLayer({
  title: "GoogleHybrid",
  name: "GoogleHybrid",
  type: 'base',
  baseLayer: false,
  opacity: 1,
  visible: false,
  source: new TileImage({url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' })
});
const ESRIWorldImagery = new TileLayer({
  title: 'ESRI-Sat',
  name: 'ESRI-Sat',
  type: 'base',
  source: new XYZ({
    attributions: 'Powered by Esri',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  }),
  opacity: 1,
  visible: false,
});
const ESRIWorldGrey = new TileLayer({
  title: 'ESRI-Grey',
  name: 'ESRI-Grey',
  type: 'base',
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  }),
  opacity: 1,
  visible: false,  
});

const osmTileGr = new TileLayer({
  title: "osm-grey",
  name: "osm-grey",
  className: 'bw',
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 1,
  visible: false,
});
const osmTileCr = new TileLayer({
  title: "osm-color",
  name: "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 0.75,
  visible: true, 
});

var Alkis_layer = new TileLayer({
  title: "ALKIS",
  name: "ALKIS",
  type: 'base',
  source: new TileWMS({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wms?",
    attributions: '© LGLN',
    params: {
      "LAYERS": "ALKIS",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
  opacity: 1,
  visible: false,  
});

const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende',
  onchangeCheck: function(layer, checked) {
     // console.log('Layer:', layer);  // Das gesamte Layer-Objekt
      //console.log('Layer Name:', layer.get('name')); // Den Namen des Layers abrufen

      if (checked) {
      //    console.log('Layer wurde aktiviert:', layer.get('name'));
          // Hier  weitere Aktionen
      } else {
         // console.log('Layer wurde deaktiviert:', layer.get('name'));
          // Hier weitere Aktionen
      }
  }
});
map.addControl(layerSwitcher);


// Event-Listener für Sichtbarkeitsänderung
layerSwitcher.on('layer:visible', function(event) {
 // Hier weitere Aktionen
 //console.log('Layer visibility changed event triggered:', event);
 const layer = event.layer; // Überprüfe die Struktur des Events
 //console.log('Layer:', layer);
});

// Beispiel: Button, um einen Layer auszuwählen
/* document.getElementById('selectLayerControl').addEventListener('click', function() {
  layerSwitcher.selectLayer(exp_bw_que_layer);
});
 */


//---------------------------------------------------------------------------------------AMessung----------------- //
const source = new VectorSource();
const vector = new VectorLayer({
  displayInLayerSwitcher: true,
  title: "Messung",
  name: "Messung",
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
let helpTooltipElement;

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
    const km2 = (area / 1000000).toFixed(3) + ' km<sup>2</sup>';
    const ha = (area / 10000).toFixed(3) + ' ha';
    output = km2 + ' (' + ha + ')';
  } else {
    output = area.toFixed(3) + ' m<sup>2</sup>';
  }
  return output;
};

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'blue',
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
  
    // Zeige Abbrechen-Button auf Mobilgeräten
    document.getElementById('cancelDrawingBtn').style.display = 'block';
  });
  
  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    document.getElementById('cancelDrawingBtn').style.display = 'none';
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

// ESC-Taste für Desktop
document.addEventListener('keydown', function (evt) {
  if (evt.key === 'Escape' || evt.key === 'Esc') {
    cancelDrawing();
  }
});

// Abbrechen-Button für Mobilgeräte
document.getElementById('cancelDrawingBtn').addEventListener('click', cancelDrawing);

// Zentrale Abbruchfunktion
function cancelDrawing() {
  if (draw) {
    source.clear();
    draw.finishDrawing();
    map.removeInteraction(draw);
    map.un('pointermove', pointerMoveHandler);
    map.getOverlays().clear();
    measureTooltip = null;
    helpTooltipElement = null;
    measureTooltipElement = null;
    removeAllOverlays();
    if (listener) {
      unByKey(listener);
    }
    sketch = null;

    // Verstecke Abbrechen-Button
    const btn = document.getElementById('cancelDrawingBtn');
    if (btn) btn.style.display = 'none';
  }
}

//Mit Kontextmenü werden die Overlays fü Messungen wieder gelöscht
map.getViewport().addEventListener('contextmenu', function(evt) {
  evt.preventDefault(); // Verhindert das Standardkontextmenü
  if (draw) {
    source.clear(); 
    draw.finishDrawing(); 
    map.removeInteraction(draw);
    map.un('pointermove', pointerMoveHandler); 
    map.getOverlays().clear();
    measureTooltip = null;
    helpTooltipElement = null;
    measureTooltipElement = null;
    removeAllOverlays();
    
    return; // Beende die Funktion, um weitere Interaktionen zu verhindern
  }
});

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

//----------------------------------------------------------------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  name: "BauwP",
  fold: true,
  fold: 'close',
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_weh_layer, exp_bw_sle_layer],
  
});
const BwGroupL = new LayerGroup({
  title: "Bauw.(L)",
  name: "BauwL",
  fold: true,
  fold: 'close',
  visible: true,  
  layers: [ gehoelz_vecLayer, exp_gew_biotope_noh, exp_gew_fla_vecLayer, exp_gew_umn_layer, exp_bw_son_lin_layer, exp_gew_info_layer ]
});
const wmsLayerGroup = new LayerGroup({
  title: "WMS-Lay",
  name: "WMS-Lay",
  fold: true,
  fold: 'close',
  visible: false,
  layers: [ Alkis_layer, wmsLsgLayer, wmsNsgLayer, wmsUesgLayer, wmsWrrlFgLayer, wmsGewWmsFgLayer ]
});
const GNAtlasGroup = new LayerGroup({
  title: "Luftbilder",
  name: "Luftbilder",
  fold: true,
  fold: 'close',
  visible: false,
  layers: [gnAtlas1937, gnAtlas1957, gnAtlas1970, gnAtlas1980,  gnAtlas1990, gnAtlas2002, gnAtlas2009, gnAtlas2010,gnAtlas2011, gnAtlas2012, gnAtlas2014, gnAtlas2017, gnAtlas2020, gnAtlas2023]
});
const kmGroup = new LayerGroup({
  title: "Station",
  name: "Station",
  fold: true,
  fold: 'close',
  visible: true,
  layers: [km10scal_layer, km100scal_layer, km500scal_layer]
});
const BaseGroup = new LayerGroup({
  title: "Base",
  name: "Base",
  fold: true,
  fold: 'close',
  visible: true,
  layers: [ESRIWorldImagery, ESRIWorldGrey, googleHybLayer, googleSatLayer, dop20ni_layer, baseDE_layer, osmTileGr, osmTileCr]
});
map.addLayer(BaseGroup);
map.addLayer(GNAtlasGroup);
map.addLayer(exp_allgm_fsk_layer);-
map.addLayer(gew_layer_layer);
map.addLayer(wmsLayerGroup);
map.addLayer(kmGroup);
map.addLayer(BwGroupL);
map.addLayer(BwGroupP);
map.addLayer(vector); 
//Ende Layer hinzufügen---------------------------------------


const vectorLayerMark = new VectorLayer({
  source: new VectorSource({  }),
  title: "rechtsClick",
  name: "rechtsClick",
  displayInLayerSwitcher : false,
  
});
map.addLayer(vectorLayerMark);

//--------------------------------------------------------------------------------------------------Info für WMS-Layer
var toggleButtonU = new Toggle({
  html: '<i class="icon fa-fw fa fa-arrow-circle-down" aria-hidden="true"></i>',
  className: "select",
  title: "Select Info",
  active: true, // Button wird beim Start als aktiv gesetzt
  interaction: selectInteraction,
  onToggle: function(active) {
    alert("Jetzt ist BW-Abfrage " + (active ? "aktiviert" : "deaktiviert (WMS-Abfrage aktiviert)"));
    selectInteraction.setActive(active);
    
    // Auswahl löschen, wenn deaktiviert
    if (!active) selectInteraction.getFeatures().clear();

    // FeaturPopup hinzufügen oder entfernen
    if (active) map.addOverlay(popup);
    else map.removeOverlay(popup);

    // Klasse 'active' je nach Zustand des Buttons setzen
    toggleButtonU.element.classList.toggle('active', active);
    toggleButtonU.element.querySelector('.icon').classList.toggle('active', active);

    // Ein- und Ausschalten der Interaktion
    
    if (active) map.un('singleclick', singleClickHandler);
    else map.on('singleclick', singleClickHandler);
  }
});
// Klasse 'active' zum Button hinzufügen, um sicherzustellen, dass er beim Start als aktiv dargestellt wird
toggleButtonU.element.classList.add('active');
toggleButtonU.element.querySelector('.icon').classList.add('active');


var selectInteraction = new Select({
  layers: [vector],
  hitTolerance: 5,
});

var selectFeat = new Select({
  hitTolerance: 5,
  multi: true,
  condition: singleClick,
});

let layer_selected = null; 

selectFeat.on('select', function (e) {

  e.selected.forEach(function (featureSelected) {
      const layerName = selectFeat.getLayer(featureSelected).get('name');
      if (layerName !== 'gew') {
          // Setze layer_selected nur, wenn das layerName nicht 'gew' ist
          layer_selected = selectFeat.getLayer(featureSelected);
          
      } else {
          selectFeat.getFeatures().clear(); // Hebt die Selektion auf
          layer_selected = null; 
      }
  }
  
);
});
map.addInteraction(selectFeat);
//map.addOverlay(popup);

// ---------------------------------------------------------------------------------------WMS
function getLayersInGroup(layerGroup) {
  const layers = [];
  layerGroup.getLayers().forEach(layer => {
      if (layer instanceof LayerGroup) {
          // Wenn der Layer ein LayerGroup ist, rufe die Funktion rekursiv auf
          layers.push(...getLayersInGroup(layer));
          
      } else {
          // Füge den Layer zur Liste hinzu, wenn e ein TileLayer ist
          layers.push(layer);
      }
  });
  return layers;
}

function singleClickHandler(evt) {
  const visibleLayers = [];
  map.getLayers().forEach(layer => {
      
      const layerName = layer.get('name');
      if (layer.getVisible()) {
        if (layer instanceof LayerGroup) {
          if (layerName !== 'GN-DOPs' && layerName !== 'Base' && layerName !== 'Station' && layerName !== 'BauwP' && layerName !== 'BauwL' && layerName !== undefined){
            visibleLayers.push(...getLayersInGroup(layer));
          }
        } else if (layerName !== 'fsk')
        {
          visibleLayers.push(layer);
        }
      }
  });
  const viewResolution = map.getView().getResolution();
  const viewProjection = map.getView().getProjection();
  visibleLayers.forEach(layer => {
    if (layer.getVisible()) {
    const source = layer.getSource();
      if (source instanceof TileWMS && typeof source.getFeatureInfoUrl === 'function') {
        const layerName = layer.get('name');      
        const url = source.getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {'INFO_FORMAT': 'text/html'});
        if (url) {
          fetch(url)
          .then((response) => response.text())
          .then((html) => {
            //console.log(html)
            if (html.trim() !== '') {
             //removeExistingInfoDiv();
              var bodyIsEmpty = /<body[^>]*>\s*<\/body>/i.test(html);
              if (bodyIsEmpty === false) {
                var modifiedHTML = checkForLinkInTH(html);
                const infoDiv = createInfoDiv(layerName, modifiedHTML);
                document.body.appendChild(infoDiv);
                // Funktion zum Verschieben des DIVs
                //dragInfo();
              } else {
                console.log('nichts verwertbares gefunden');
                //alert('nichts verwertbares gefunden');
              }
            }
          })
          .catch((error) => {
            console.error('Fehler beim Abrufen der Daten:', error);
            alert('Es ist ein Fehler aufgetreten');
          });
        }
      }
    }   
  }
)};

function createInfoDiv(name, html) {
  const infoDiv = document.createElement('p');
  infoDiv.id = 'info';
  infoDiv.classList.add('Info');
  infoDiv.innerHTML = `${html}`;
  const closeIcon = document.createElement('p');
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

//--------------------------------------------------------------------------------------------------Funktionen für Popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var popup = new Overlay({
  element: container,
  id: '1',
  autoPan: true,
  autoPanAnimation: {
  duration: 250
  }
});
content.addEventListener('contextmenu', function (event) {
  event.stopPropagation();
});
map.addOverlay(popup);

closer.onclick = function()
{
  popup.setPosition(undefined);
  closer.blur();
  return false;
};
var closer = document.getElementById('popup-closer');

//-------------------------------------------------------Funktionen für Text im Popup
map.on('click', function (evt) {
  console.log(globalCoordAnOderAus);
  console.log('Aufgerufen');

  if (globalCoordAnOderAus===false ){
    var coordinates = evt.coordinate;
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) 
    {
      var layname = layer.get('name');
      console.log(layname);
      var beschreibLangValue = feature.get('beschreib_lang');
      var beschreibLangHtml = '';
      if (beschreibLangValue && beschreibLangValue.trim() !== '') {
      beschreibLangHtml = '<br>' + '<u>' + "Beschreib (lang): " + '</u>' + beschreibLangValue + '</p>';
      };
    // Popup soll nur für bestimmte Layernamen angezeigt werden
    if (layname !== 'gew' && layname !== 'km10scal' && layname !== 'km100scal' && layname !== 'km500scal' && layname !== 'fsk' && layname !== 'sle' && layname !== 'weh' && layname !== 'son_lin' && layname !== 'exp_gew_fla' ) {
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
        var rwert = feature.get('rwert');
        var hwert = feature.get('hwert');
        var result = UTMToLatLon_Fix(rwert, hwert, 32, true);

         content.innerHTML =
         '<div style="max-height: 200px; overflow-y: auto;">' +
         '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
         '<p>' + "Id = " + feature.get('bw_id') +  ' (' + (feature.get('KTR') ? feature.get('KTR') : 'k.A.') + ')' +  '</p>' +
         '<p>' + "U-Pflicht = " + feature.get('upflicht') + '</p>' +
         //'<p>' + "Bemerk = " + feature.get('bemerk') + '</p>' +
         '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
         '<p>' + "Bauj. = " + (feature.get('baujahr') ? feature.get('baujahr') : 'k.A.') + '</p>' +
         `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
         `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
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
      var foto1Value = feature.get('foto1');
      var foto1Html = '';
      var foto2Value = feature.get('foto2');
      var foto2Html = '';
      var foto3Value = feature.get('foto3');
      var foto3Html = '';
      var foto4Value = feature.get('foto4');
      var foto4Html = '';
      var urlWKDB = feature.get('URL_WKDB');
      var urlWKDBHtml = '';
      var url_wk_sb = feature.get('URL_WKSB');
      console.log(url_wk_sb);
      var url_wk_sb_Html = '';

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
      if (urlWKDB && urlWKDB.trim() !== '') {
        urlWKDBHtml = '<a href="' + urlWKDB + '" onclick="window.open(\'' + urlWKDB + '\', \'_blank\'); return false;">NLWKN-WK</a>';
      } else {
        urlWKDBHtml = " NLWKN-WK";
      }
      
      if (url_wk_sb && url_wk_sb .trim() !== '') {
        url_wk_sb_Html = '<a href="' + url_wk_sb + '" onclick="window.open(\'' + url_wk_sb + '\', \'_blank\'); return false;">BfG-WK</a>';
      } else {
        url_wk_sb_Html = "BfG-WK";
      }
      
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>Name: ' + feature.get('IDUabschn') + '<br>' + "von " + feature.get('Bez_Anfang') + " bis " + feature.get('Bez_Ende')  + '</p>' +
      '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
      '<p><a href="' + feature.get('U_Steckbrief') + '" onclick="window.open(\'' + feature.get('U_Steckbrief') + '\', \'_blank\'); return false;">NLWKN-SB</a> ' + url_wk_sb_Html + " " + urlWKDBHtml + 
      
      //'<a href="' + feature.get('URL_WKDB') + '" onclick="window.open(\'' + feature.get('URL_WKDB') + '\', \'_blank\'); return false;">WK_DB</a> '+
      //'<a href="' + feature.get('foto1') + '" onclick="window.open(\'' + feature.get('foto1') + '\', \'_blank\'); return false;">Karte</a> ' +
      //'<a href="' + feature.get('foto2') + '" onclick="window.open(\'' + feature.get('foto2') + '\', \'_blank\'); return false;">Foto</a><br>' +
      '<p><a href="' + feature.get('BSB') + '" onclick="window.open(\'' + feature.get('BSB') + '\', \'_blank\'); return false;">BSB  </a>' +
      '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
      '<a href="' + feature.get('MNB') + '" onclick="window.open(\'' + feature.get('MNB') + '\', \'_blank\'); return false;"> MNB</a><br> ' +
      'Kat: ' + feature.get('Kat') + '</a>' +
      ', KTR: ' + feature.get('KTR') + '</a>' +
      '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p></div>';
  
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
          '<p>' + "U-Pflicht = " + feature.get('upflicht') + '</p>' +
          '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
          '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'exp_gew_fla' durch
    if (layname === 'exp_gew_fla') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
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
          '<p>' + "U-Pflicht = " + feature.get('upflicht') + '</p>' +
          '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
          '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'exp_bw_sle' durch
    if (layname === 'sle') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
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
        var rwert = feature.get('rwert');
        var hwert = feature.get('hwert');
        let result = UTMToLatLon_Fix(rwert, hwert, 32, true);
        
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
          '<p>' + "WSP (OW) = " + feature.get('WSP_OW') + " m" +  "  WSP (UW) = " + feature.get('WSP_UW') + " m" + '</p>' +
          `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
          `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
          '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'exp_bw_weh' durch
    if (layname === 'weh') {
          coordinates = evt.coordinate; 
          popup.setPosition(coordinates);
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
            var rwert = feature.get('rwert');
            var hwert = feature.get('hwert');
            let result = UTMToLatLon_Fix(rwert, hwert, 32, true);
            content.innerHTML =
              '<div style="max-height: 200px; overflow-y: auto;">' +
              '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
              '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
              '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
              //'<p>' + "WSP1 (OW) = " + feature.get('Ziel_OW1').toFixed(2) + " m" +  "  WSP2 (OW) = " + feature.get('Ziel_OW2').toFixed(2) + " m" + '</p>' +
              `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
              `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
              '<p>' + "WSP1 (OW) = " + feature.get('Ziel_OW1') + " m" +  "  WSP2 (OW) = " + feature.get('Ziel_OW2') + " m" + '</p>' +
              '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
              '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
               '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
               '<p>' + beschreibLangHtml + '</p>' +
              '</div>';
          
    }
    if (layname === 'fot') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      var foto1Value = feature.get('tmp');
      var foto1Html = '';
      var foto2Value = feature.get('Path');
      var foto2Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto LW 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto LW 2";
        }
      
        var rwert = feature.get('RWert');
        var hwert = feature.get('HWert');
        let result = UTMToLatLon_Fix(rwert, hwert, 32, true);
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('REFOBJ_ID') + '</p>' +
          `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
          `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
          '<p>' + "Datum Uhrzeit: " + feature.get('DateTime_') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + 
           '<br>' + '<u>' + "Ordner: " + '</u>' + feature.get('BOrdner') + '</p>' +
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
        // Führen Sie Aktionen für den Layernamen 'geojson' durch
    if (layname.toLowerCase().startsWith('geojson')) {
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      
      // Erstelle HTML für alle Attribute außer "geometry"
      let contentHtml = "<strong>Attributwerte:</strong><br><ul>";
      for (let key in att) {
          if (key !== 'geometry') { // Geometrie nicht anzeigen
              contentHtml += `<li><strong>${key}:</strong> ${att[key]}</li>`;
          }
      }
      contentHtml += "</ul>";
      content.innerHTML = contentHtml;
    }
    // Führen Sie Aktionen für den Layernamen 'kml' durch
    if (layname.toLowerCase().startsWith('kml')) {
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      // Erstelle HTML für alle Attribute außer "geometry"
      let contentHtml = "<strong>Attributwerte:</strong><br><ul>";
      for (let key in att) {
          if (key !== 'geometry') { // Geometrie nicht anzeigen
              contentHtml += `<li><strong>${key}:</strong> ${att[key]}</li>`;
          }
      }
      contentHtml += "</ul>";
      content.innerHTML = contentHtml;
    }
    // Führen Sie Aktionen für den Layernamen "rechtsClick" durch
    if (layname.toLowerCase().startsWith('rechtsclick')) {
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      // Erstelle HTML für alle Attribute außer "geometry"
      
      let contentHtml = "<strong>Koordinaten</strong><br><ul>"
      
      for (let key in att) {
          if (key !== 'geometry') { // Geometrie nicht anzeigen
              contentHtml += `<li><strong>${key}:</strong> ${Number(att[key]).toFixed(3)}</li>`;
          }
      }
      feature.set('type', 'removable');
      contentHtml += "</ul>";
      
      let result = UTMToLatLon_Fix(feature.get('x_32632'), feature.get('y_32632'), 32, true);
      contentHtml += `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>`;
      content.innerHTML = contentHtml;
    }
    }
  );
  } else if(globalCoordAnOderAus===true) {  
    placeMarkerAndShowCoordinates(evt);
  }
});

//-------------------------------------------------------------------------------------Bestimmung geclickter Koordinaten
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
    const format = createStringXY(1);
    mousePositionControl.setCoordinateFormat(format);
    mousePositionControl.setProjection(event.target.value);
  }
});
// Funktion für den Marker und die Koordinatenausgabe
function placeMarkerAndShowCoordinates(event) {
  const mousePositionElement = document.getElementById('mouse-position'); 
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
      const swappedCoordinate = [event.coordinate[1], event.coordinate[0]]; // Swap x and y
      mousePositionElement.innerHTML = `Coordinates: ${format(swappedCoordinate)}`;
    } else if (projectionSelect.value === 'EPSG:4326') {
      const format = createStringXY(6);
      const transformedCoordinate = transformCoordinateToMousePosition4326(event.coordinate);
      const swappedCoordinate = [transformedCoordinate[1], transformedCoordinate[0]]; // Swap x and y
      mousePositionElement.innerHTML = `Coordinates: ${format(swappedCoordinate)}`;
    } else if (projectionSelect.value === 'EPSG:32632') {
      const format = createStringXY(1);
      const transformedCoordinate = transformCoordinateToMousePosition32632(event.coordinate);
      const swappedCoordinate = [transformedCoordinate[1], transformedCoordinate[0]]; // Swap x and y
      mousePositionElement.innerHTML = `Coordinates: ${format(swappedCoordinate)}`;
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
  } else {
    if (markerCoordOverlay) {
      map.removeOverlay(markerCoordOverlay);
    };
    globalCoordAnOderAus=false;
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
    //customControls.buttonLength.disabled = true;
    // Wenn das Control sichtbar ist
  } else {
    // Muss eigentlich true sein
    map.addControl(mousePositionControl);
    //customControls.buttonLength.disabled = false;
  }
});

//Umrechnung geclickter Kartenpositionen in mousePositionControl-Format für EPSG:4326
function transformCoordinateToMousePosition4326(coordinate) {
   return transform(coordinate, map.getView().getProjection(), 'EPSG:4326');
}
//für EPSG:32632
function transformCoordinateToMousePosition32632(coordinate) {
  // Koordinaten von der aktuellen Karte (EPSG:3857) nach EPSG:32632 umwandeln
  //  const transformedCoordinate32632 = transform(clickedCoordinate3857, 'EPSG:3857', 'EPSG:32632');
  return transform(coordinate, 'EPSG:3857', 'EPSG:32632');
}

//----------------------------------------------------------------------------Hyerperlink um ein neues Browserfenster zu öffnen wird dem Popup hinzugefügt
document.addEventListener('DOMContentLoaded', function () {
  var popup = document.getElementById('popup');
  var popupCloser = document.getElementById('popup-closer');
  var container = document.createElement('div');
  var link = document.createElement('a');
  //schreibeInnerHtml(layer);
  link.textContent = 'Weitere Infos';
  //link.href = '#'; // Verhindert, dass der Link die Seite neu lädt
  //link.addEventListener('click', function(event) {
  //  event.preventDefault(); // Verhindert die Standardaktion des Links
  //  var newWindow = window.open('', '_blank');
  //  newWindow.document.body.innerHTML = 
  //    '<p>Hallo neue Welt 2</p>'
  
  //});
    //***********************Alternativ einen Bericht öffnen
  link.addEventListener('click', function(event) {
  event.preventDefault(); // Verhindert die Standardaktion des Links
  alert ("keine Funktion");
  //var newWindow = window.open('https://nlwkn.hannit-share.de/index.php/apps/files/files/11334138?dir=/db/DIN/Rep&openfile=true', '_blank');
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


//--------------------------------------------------------------------------------------------- Photon search control 
var sLayer = new VectorLayer({
  title: "tmp_Layer2",
  name: "tmp_Layer2",
  source: new VectorSource(),
  style: new Style({ image: new CircleStyle({radius: 5,stroke: new Stroke ({color: 'rgb(255,165,0)', width: 3 }),fill: new Fill({color: 'rgba(255,165,0,.3)' })      }),
      stroke: new Stroke ({
          color: 'rgb(255,165,0)',
          width: 3
      }),
      fill: new Fill({
          color: 'rgba(255,165,0,.3)'
      })
  }),
  displayInLayerSwitcher : true,
});
map.addLayer(sLayer);

var search = new SearchPhoton({
  //target: $(".options").get(0),
  lang:"de",		// Force preferred language
  polygon: $("#polygon").prop("checked"),
  reverse: true,
  position: true	
});
map.addControl (search);

// Select feature when click on the reference index
search.on('select', function(e){
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
  else 
  {
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


//---------------------------------------------------------------------------------------------Menü mit Submenü
var userInput = ""; // Globale Variable zur Speicherung der Nutzereingabe
var currentlyHighlightedFeature = null; // Variable zur Verfolgung des aktuell markierten Features

// Markierungsstil für das gefundene Feature
const highlightStyle = new Style({
 stroke: new Stroke({
 color: 'red',
 width: 12 
 }),
 fill: new Fill({
 color: 'rgb(234, 255, 0)'
 })
});
//-------------------------------------------------------------Suche BW
function searchFeaturesByTextBw(searchText) {  
  let layers = [exp_bw_bru_nlwkn_layer, exp_bw_due_layer, exp_bw_sle_layer, exp_bw_weh_layer, exp_bw_bru_andere_layer, exp_bw_ein_layer, exp_bw_que_layer, exp_bw_son_pun_layer, exp_bw_son_lin_layer ]; 
  let matchingFeatures = [];
  layers.forEach(layer => {
      if (!layer) return;
      let source = layer.getSource();
      if (!source) return;
      let features = source.getFeatures();
      features.forEach(feature => {
        let properties = feature.getProperties();
        let name = properties.name ? properties.name.toLowerCase() : '';
        let beschreib = properties.beschreib ? properties.beschreib.toLowerCase() : '';
        let searchTextLower = searchText.toLowerCase(); // Suchtext ebenfalls in Kleinbuchstaben umwandeln
        if (name.includes(searchTextLower) || beschreib.includes(searchTextLower)) {
            matchingFeatures.push({ feature, layer });
        }
    });
  });
  // Ergebnisse anzeigen
  displaySearchResultsBw(matchingFeatures);
  document.getElementById("close-search-results").addEventListener("click", function() {
    document.getElementById("search-results-container").style.display = "none";
    
  });
}
//-----------------------------------------------------------------Suche Eig
function searchFeaturesByTextEig(searchText) {
  let matchingFeatures = [];
  console.log('Suche gestartet Eigentümer');

  const source = exp_allgm_fsk_layer.getSource();
  if (!source) {
    console.error("Fehler: Die Layer-Quelle ist nicht verfügbar.");
    return;
  }
  let features = source.getFeatures();
  features.forEach(feature => {
    let properties = feature.getProperties();
    let name = properties.Eig1 ? properties.Eig1.toLowerCase() : '';
    
    let searchTextLower = searchText.toLowerCase(); // Suchtext ebenfalls in Kleinbuchstaben umwandeln
    
    if (name.includes(searchTextLower)) {
      matchingFeatures.push({ feature }); // Layer explizit hinzugefügt
    }
  });
  
  // Ergebnisse anzeigen
  displaySearchResultsEig(matchingFeatures);
  document.getElementById("close-search-results").addEventListener("click", function() {
    document.getElementById("search-results-container").style.display = "none";
    
    // Hervorhebung zurücksetzen
    if (currentlyHighlightedFeature) {
      currentlyHighlightedFeature.setStyle(null);
      currentlyHighlightedFeature = null;
    }
  });
}
//Display Ergebnis Suche Bw
function displaySearchResultsBw(results) {
  let resultContainer = document.getElementById('search-results');
  resultContainer.innerHTML = ''; // Alte Ergebnisse löschen
  if (results.length === 0) {
      resultContainer.innerHTML = '<li>Layer eingeschaltet??? Keine Treffer</li>';
      
      return;
  }
  // 🔹 Alphanumerische Sortierung nach bw_id
  results.sort((a, b) => {
      let idA = a.feature.getProperties().bw_id || '';
      let idB = b.feature.getProperties().bw_id || '';
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
  });
  results.forEach((item) => {
      let feature = item.feature;
      let properties = feature.getProperties();
      let id = properties.bw_id;
      let name = properties.name || 'Unbekannt';
      let listItem = document.createElement('li');
      listItem.textContent = id + ": " + name; // Nur den Namen anzeigen
      listItem.onclick = () => zoomToFeature(feature);
      resultContainer.appendChild(listItem);
  });
}
//Display Ergebnis Suche Eig
function displaySearchResultsEig(results) {
  let resultContainer = document.getElementById('search-results');
  resultContainer.innerHTML = ''; // Alte Ergebnisse löschen

  if (results.length === 0) {
    resultContainer.innerHTML = '<li>FSK-Layer sichtbar?? Keine Treffer</li>';
    return;
  }

  
  results.sort((a, b) => {
    let idA = a.feature?.getProperties()?.Eig1?.trim() || '';
    let idB = b.feature?.getProperties()?.Eig1?.trim() || '';
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' }); 
  });

  results.forEach((item) => {
    let feature = item.feature;
    let properties = feature.getProperties();
    let name = properties.Eig1 || 'Unbekannt';
    let suche = properties.Suche || 'Unbekannt';

    let listItem = document.createElement('li');
    listItem.textContent = name + "/ FSK: " + suche; // Nur den Namen anzeigen
    listItem.onclick = () => highlightFeatureEig1(feature); // Beim Klicken hervorheben

    resultContainer.appendChild(listItem);
  });
}
//-------------------------------------------------------Hervorhebung Suche FSK
function highlightFeatureFSK(searchText) {
  const source = exp_allgm_fsk_layer.getSource();
  const features = source.getFeatures();
  let found = false;
  // Prüfen, ob die erste Stelle eine Zahl oder ein Buchstabe ist
  const firstChar = searchText.charAt(0);
  const isNumber = !isNaN(firstChar) && firstChar.trim() !== "";
  // Wähle das zu durchsuchende Attribut
  const searchAttribute = isNumber ? "fsk" : "Suche";
  features.some(feature => {
    let searchValue = feature.get(searchAttribute);
    if (searchValue === searchText) {
      feature.setStyle(highlightStyle);
      map.getView().fit(feature.getGeometry().getExtent(), { duration: 1000 });
      currentlyHighlightedFeature = feature; // Speichere das aktuell angeklickte Feature
      found = true;
      return true;
    }
    return false;
  });
  if (!found) {
    alert("Kein passendes Feature gefunden!, FSK-Layer sichtbar??");
  }
}
//Highlight ---------------------------------------------Hervorhebung Suche Eig
function highlightFeatureEig1(feature) {
  // Falls ein anderes Feature hervorgehoben ist, Stil zurücksetzen
  if (currentlyHighlightedFeature) {
    currentlyHighlightedFeature.setStyle(null); // Standard-Stil wiederherstellen
  }
  feature.setStyle(highlightStyle);
  currentlyHighlightedFeature = feature; // Speichert das hervorgehobene Feature
  // Karte auf das Feature zoomen
  let geometry = feature.getGeometry();
  let extent = geometry.getExtent();
  map.getView().fit(extent, { 
    duration: 1000, 
    padding: [50, 50, 50, 50], 
    maxZoom: 18 
  });
}
function zoomToFeature(feature) {
    let geometry = feature.getGeometry();
    let extent = geometry.getExtent();
    map.getView().fit(extent, { 
      duration: 1000, 
      padding: [50, 50, 50, 50], 
      maxZoom: 20// Verhindert zu starkes Hineinzoomen
    });
    
    
}

window.closeSearchResults = function () {
  document.getElementById("search-results-container").style.display = "none";
};

let jsonButtonState = false; // Initialer Zustand

/* Nested subbar */
var sub2 = new Bar({
  toggleOne: true,
  controls: [
   // Suche nach Flurstück
  new TextButton({
   html: '<i class="fa fa-map" ></i>',
   title: "Flurstückssuche",
   handleClick: function () {
     if (currentlyHighlightedFeature) {
       // Wenn ein Feature bereits markiert wurde, hebe die Markierung auf und setze zurück
       currentlyHighlightedFeature.setStyle(null); 
       currentlyHighlightedFeature = null; 
     } else {
       // Fordere den Nutzer zur Eingabe auf
       userInput = prompt("gem flur zähler/nenner oder fsk-id:", "");
       if (userInput) {
         highlightFeatureFSK(userInput);
       }
     }
   }
  }),
  // Suche nach Bauwerk
  new TextButton({
   html: '<i class="fa fa-snowflake-o" aria-hidden=true></i>',
  
   title: "Suche bw",
   handleClick: function () {
     let searchText = prompt("Geben Sie den Suchtext ein:");
     if (searchText && searchText.trim() !== "") { // Falls der Nutzer etwas eingegeben hat
       let results = searchFeaturesByTextBw(searchText);
       document.getElementById("search-results-container").style.display = "block"; // Zeige das div an
     } else {
       alert("Bitte geben Sie einen gültigen Suchtext ein. Layer sichtbar??");  
     }
   }
  }),
  // Suche nach Eigentümer
  new TextButton({
   html: '<i class="fa fa-file"></i>',
   title: "Suche Eigentümer",
   handleClick: function () {
     let searchText = prompt("Geben Sie den Suchtext ein:");
     if (searchText && searchText.trim() !== "") { // Falls der Nutzer etwas eingegeben hat
       let results = searchFeaturesByTextEig(searchText);
       document.getElementById("search-results-container").style.display = "block"; // Zeige das div an
     } else {
       alert("Bitte geben Sie einen gültigen Suchtext ein. FSK-Layer sichtbar??");  
     }
   }
  })
  ]
 });

//Das Untermenü mit drei buttons
var sub1 = new Bar({
  toggleOne: true,
   //Die Untermenüs
  controls:[
    // Das Untermenü GPS-Position
    new Toggle({
      html: '<i class="fa fa-map-marker" ></i>',
      title: "GPSPosition",
      //autoActivate: true,
      onToggle: 
      // Funktion zur Anzeige der GPS-Position
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
                  displayInLayerSwitcher: true,
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
                  title: 'gps_Layer',
                  name: 'gps_Layer',
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
        //updateButtonAppearance(); // Aktualisieren Sie das Erscheinungsbild des Buttons basierend auf dem aktualisierten isActive-Status
        
      } ,
    }),
    // Das Untermenü Suche (ohne eigene Funktion) aber mit einem Untermenü
    new Toggle({
      html:'<i class="fa fa-search"></i>', 
      title: "Suche",
      onToggle: function(b) { 
        
       },
      bar: sub2
      
    }),
    // Das Untermenü GeoJson
    new Toggle({
      html: '<i class="fa fa-file"></i>',
      title: "GeoJson drag and drop",
      onToggle: function () {
      jsonButtonState = !jsonButtonState; // Zustand umschalten
      if (jsonButtonState === true) {
        setInteraction(); // Deine Funktion aufrufen, wenn der Zustand true ist
        } else {
        map.removeInteraction(dragAndDropInteraction);
        isActive = false;
        }
      },
    }),
  ]
});

// Input-Feld (versteckt im HTML, z. B. im Body)
//const geojsonInput = document.createElement('input');
//geojsonInput.type = 'file';
//geojsonInput.accept = '.geojson,.json';
//geojsonInput.style.display = 'none';
//document.body.appendChild(geojsonInput);

// Zähler für die geladenen GeoJSON-Dateien
let geojsonCounter = 0;

//Event-Handler für Datei-Upload
geojsonInput.addEventListener('change', function (event) {
  const files = event.target.files; // Alle ausgewählten Dateien
  if (!files.length) return;

  // Iteriere über alle ausgewählten Dateien
  Array.from(files).forEach(file => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const geojsonText = e.target.result;
      const geojsonFormat = new GeoJSON();

      try {
        const features = geojsonFormat.readFeatures(geojsonText, {
          featureProjection: 'EPSG:3857'
        });

        const vectorSource = new VectorSource({
          features: features
        });

        // Dateiname ohne Erweiterung (optional)
        const fileName = file.name.replace(/\.[^/.]+$/, "");

        // Dynamischer Name und Titel mit Dateinamen
        const layerTitle = `GeoJSON: Lokal-${geojsonCounter} (${fileName})`;
        const layerName = `GeoJSON_Lokal_${geojsonCounter}_${fileName}`;

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          title: layerTitle,  // Titel anpassen
          name: layerName,    // Name anpassen
          displayInLayerSwitcher: true,
          style: new Style({
            stroke: new Stroke({
              color: 'red',
              width: 2
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.1)'
            })
          })
        });

        map.addLayer(vectorLayer);

        // Zoom zur geladenen GeoJSON
        map.getView().fit(vectorSource.getExtent(), {
          padding: [20, 20, 20, 20],
          maxZoom: 16
        });

        // Zähler erhöhen für die nächste Datei
        geojsonCounter++;

      } catch (err) {
        alert("Fehler beim Laden der GeoJSON-Datei: " + err.message);
      }
    };

    reader.readAsText(file); // Datei einlesen
  });
});


 var sub2 = new Bar({
  toggleOne: true,
  controls: [
    new Toggle({
      //<i class="fa fa-envelope-open" aria-hidden="true"></i>
      html: '<i class="fa fa-envelope-open" aria-hidden="true"></i>',
      title: "Geojson-Datei laden",
      onToggle: function () {
        geojsonInput.click(); // Öffnet den Dateiauswahldialog
      }
    }),
    new Toggle({
      html: 'L',
      title: "Fehlt",
      onToggle: function (b) {
        alert("ohne Funktion");
      }
    })
  ]
});

// Funktion zum Hinzufügen eines WFS-Layers mit dynamischer BBOX-Anpassung
/*
  function addWFSLayer(wfsUrl) {
  console.log(wfsUrl);
  let wfsLayer = new VectorLayer({
    name: "GeoJson: " + wfsUrl,
    title: "GeoJson: " + wfsUrl,
    source: new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        let wfsLayName = "ms:ni_samtgemeinden";
        let zoom = map.getView().getZoom();
        let scaleFactor = 1 + (3 - zoom) * 0.3;
        scaleFactor = Math.max(1, Math.min(scaleFactor, 3));
        
        let minX = extent[0], minY = extent[1], maxX = extent[2], maxY = extent[3];
        let width = maxX - minX;
        let height = maxY - minY;

        let newMinX = minX - (width * (scaleFactor - 1) / 2);
        let newMinY = minY - (height * (scaleFactor - 1) / 2);
        let newMaxX = maxX + (width * (scaleFactor - 1) / 2);
        let newMaxY = maxY + (height * (scaleFactor - 1) / 2);

        let adjustedExtent = [newMinX, newMinY, newMaxX, newMaxY];

        const layerName = "vg2500:vg2500_lan"; // Hier kannst du den Layer-Namen dynamisch setzen

        return `${wfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${wfsLayName}&maxFeatures=10&outputFormat=application/json&srsname=EPSG:3857&bbox=${adjustedExtent.join(",")},EPSG:3857`;

      },
      strategy: LoadingStrategy.bbox,
    }),
    style: new Style({
      stroke: new Stroke({
        color: "blue",
        width: 2,
      }),
      fill: new Fill({
        color: "rgba(0, 0, 255, 0.1)",
      }),
    }),
  });
  
  map.addLayer(wfsLayer);
}

*/

//--------------------------------------------------------------------------Drag and Drop
let dragAndDropInteraction;
let zaehlerGeojson = 0;
let zaehlerKML = 0;
function setInteraction() 
{
  if (dragAndDropInteraction) 
  {
  map.removeInteraction(dragAndDropInteraction);
  }
  dragAndDropInteraction = new DragAndDrop({
    formatConstructors: 
    [
      GeoJSON, // Falls mehr Formate nötig, hier ergänzen
      new KML, 
    ],
    });
  dragAndDropInteraction.on('addfeatures', function (event) {
    if (!event.file) {
      alert("Kein Dateiname verfügbar.");
      return;
    }
    let fileName = event.file.name.replace(/\.[^/.]+$/, ""); // Dateiendung entfernen
    let fileEnd = event.file.name.split('.').pop().toLowerCase(); // Dateiendung extrahieren und in Kleinbuchstaben umwandeln
    if (event.features.length === 0) {
      alert("Keine Features aus der Datei geladen!");
      return;
    }
    // **VectorSource erstellen und Features hinzufügen**
    const vectorSource = new VectorSource();
    vectorSource.addFeatures(event.features);
    // Name der VectorSource abhängig von der Dateiendung setzen
    let sourceName;
    if ((fileEnd === 'geojson' || fileEnd === 'json') && fileName != 'fot') {
      sourceName = "GeoJson: " + zaehlerGeojson + " " + fileName;
    } else if (fileEnd === 'kml') {
      sourceName = "KML: " + zaehlerKML + " " + fileName;
    } else if (fileName === 'fot') {
      sourceName = "fot";
    } else {
      //sourceName = "Unbekannt: " + " " + fileName;
    }
    // Bedingte Zuweisung des Styles
     const layerStyle = fileName === 'fot' ? arrowStyle : geojsonStyle;
    zaehlerGeojson++;
    zaehlerKML++;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      name: sourceName, // Dynamischer Name basierend auf Dateiendung
      title: sourceName, // Gleicher Titel
      style: layerStyle,
    });
    map.addLayer(vectorLayer);
    // **Direkt nach dem Hinzufügen Features ausgeben**
    vectorSource.once('change', function () {
      console.log("Das 'change'-Ereignis wurde ausgelöst.");
      const features = vectorSource.getFeatures();
      if (features.length > 0) {
        const properties = features[0].getProperties();
        if (properties && typeof properties === 'object') {
        const attributeNames = Object.keys(properties).filter(key => key !== 'geometry');
        } else {
        alert("Keine gültigen Attribute im Feature gefunden.");
        }
        const attributeNames = Object.keys(properties).filter(key => key !== 'geometry');
        } else {
          alert("Keine Features im Layer gefunden.");
        }
    });
    map.getView().fit(vectorSource.getExtent(), { padding: [20, 20, 20, 20] });
  });
  map.addInteraction(dragAndDropInteraction);
}
/* 

exp_bw_sle_layer.getSource().on('change', function() {
  if (exp_bw_sle_layer.getSource().getState() === 'ready') {
    var tmpFeatures = exp_bw_sle_layer.getSource().getFeatures().map(f => {
      var clone = f.clone();
      var props = { ...clone.getProperties() };
      // Unerwünschte Attribute entfernen
      delete props.ID_con;
      console.log("Bereinigte Properties:", props); // Prüfen, ob die Attribute entfernt wurden
      clone.setProperties({});
      clone.setProperties(props);
      //listCtrl.setFeatures(clone );
      return clone;
    });
    console.log("Vorhandene Features:", tmpFeatures); // Debugging
    // Methode 1: Direkt als Array übergeben
    //listCtrl.setFeatures(tmpFeatures);
    // Methode 2: Falls nötig, als Collection
    listCtrl.setFeatures(new collection(tmpFeatures));
  }
});



//----------------------------------------------------------------------ListControl Select-Interaktion
var selecti = new Select({
  hitTolerance: 5,
  condition: singleClick
});
map.addInteraction(selecti);

// Feature bei Klick auswählen
selecti.on('select', function(e) {
  var f = e.selected[0];
  if (f) {
    showInfo(f);
    listCtrl.select(f);
  }
});

function showInfo(f) {
  var prop = f.getProperties();
  var content = document.getElementById('popup-content');
  console.log ("Proper: " + prop)
  
  // Inhalt leeren und neue Liste erstellen
  var html = '<ul>';
  for (var p in prop) {
    if (p !== 'geometry') {
      html += `<li><strong>${p}:</strong> ${prop[p]}</li>`;
    }
  }
  html += '</ul>';

  // Popup-Inhalt setzen
  content.innerHTML = html;

  // Popup an Feature-Position setzen
  var coordinates = f.getGeometry().getCoordinates();
  popup.setPosition(coordinates);
}
// Select-Control
var listCtrl = new FeatureList({
  className: 'ol-bottom',
  title: 'Querungen',
  collapsed: true,
  //features: exp_bw_sle_layer.getSource().getFeatures(),
  //target: document.body
});
map.addControl(listCtrl);

console.log("Features: " + listCtrl.features);
const listColumes = ["ID_con", "name"];
listCtrl.setColumns(listColumes)
listCtrl.enableSort('bw_id', 'name', 'ID_con');

listCtrl.on('select', function(e) {
  if (!e.feature) return;
  selecti.getFeatures().clear();
  selecti.getFeatures().push(e.feature);
  showInfo(e.feature);
});

listCtrl.on('dblclick', function(e) {
  if (!e.feature) return;
  map.getView().fit(e.feature.getGeometry().getExtent());
  map.getView().setZoom(map.getView().getZoom() - 1);
});

listCtrl.on(['resize', 'collapse', 'sort'], function(e) {
  console.log(e);
});

 */

//------------------------WMS-Control aus myFunc.js hinzufügen
//document.addEventListener('DOMContentLoaded', function() {
//  initializeWMS(WMSCapabilities, map ); // Aufrufen der initializeWMS-Funktion aus myFunc.js
//});

//-----------------------------------------------------------------------------------------------------Permalink

/* 

var permalinkControl = new Permalink({    
  target: document.getElementById('permalink-container'), 
  title: "Link erzeugen",
  //geohash: /gh=/.test(document.location.href),
  localStorage: true,  // Save permalink in localStorage if no URL provided
  urlReplace: false,
  fixed: 2,
  visible: true,
  onclick: function(url) {
    console.log("Aktuelle URL-Parameter: ", permalinkControl.getUrlParam());
    console.log("Permalink: ", permalinkControl.getLink());
    
    // Layer-Namen sammeln
    let activeLayers = [];
    map.getLayers().getArray().forEach(group => {
      if (group instanceof LayerGroup) {
        let groupName = group.get('name') || 'UnbekannteGruppe';
        group.getLayers().forEach(layer => {
          if (layer.get('visible')) {
            let layerName = layer.get('name') || 'UnbekannterLayer';
            activeLayers.push(`${groupName}.${layerName}`);
          }
        });
      }
    });

    // Layer-Namen zum Permalink hinzufügen
    let newUrl = new URL(url);
    if (activeLayers.length) {
      newUrl.searchParams.set('layers', activeLayers.join(','));
    }
    let finalUrl = newUrl.toString();
    console.log("Neuer Permalink mit Layern:", finalUrl);
    copyToClipboard(finalUrl);
  }
});
//map.addControl(permalinkControl);


// Funktion zum Kopieren des Links in die Zwischenablage
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Permalink wurde in die Zwischenablage kopiert: ' + text);
  }).catch(err => {
    alert('Fehler beim Kopieren des Permalinks: ' + err);
  });
}

 */

/* const mySearch = document.getElementById('searchBox');
mySearch.addEventListener('change', function(event){
  console.log('Eingabe erfolgt');
}); */

/* const searchSelect = document.getElementById('searchSelect');
searchSelect.addEventListener('change', function(event) {
    const selectedValue = event.target.value;
    console.log('Auswahl geändert: ' + selectedValue);
    // Hier kannst du weitere Aktionen basierend auf der ausgewählten Option durchführen
}); */

/* document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.querySelector('.searchBox button');

  if(searchButton) {
    searchButton.addEventListener('click', function(event) {
      searchAddress(event); // Hier wird die Funktion searchAddress() aufgerufen, die du bereits im HTML definiert hast
    });
  } else {
    console.error("Button in '.searchBox' nicht gefunden.");
  }
}); */

/* function searchAddress(e) {
  console.log('angekommen')
  sLayer.getSource().clear();
  if (e.search.geojson) {
    
    var format = new GeoJSON();
    var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
    //console.log(f)
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
  else 
  {
    map.getView().animate({
    center:e.coordinate,
    zoom: Math.max (map.getView().getZoom(),16)
    });
  }
  // Füge den Marker hinzu
  addMarker(e.coordinate);
} */

/* searchBox.addEventListener('input', function() {
 
  console.log(searchBox.value);
}); */


var mainBar1 = new Bar({
  controls: [
    new Toggle({
      html: '<i class="fa fa-info"></i>',
      title: "Weitere Funktionen",
      // Untermenü mit zwei Buttons
      bar: sub1,
      onToggle: function() { },
    }),
    new Toggle({
      html: 'W',
      title: "Weitere Funktionen",
      // Untermenü mit zwei Buttons
      bar: sub2,
      onToggle: function() { },
    }),

  ]
});
map.addControl ( mainBar1 );
mainBar1.setPosition('left');

var mainbar2 = new Bar();
map.addControl(mainbar2);

//mainbar2.addControl (search);
//mainbar2.addControl (permalinkControl);
mainbar2.addControl (printControl);
mainbar2.addControl(toggleButtonU);

mainbar2.setPosition('bottom-right');
mainbar2.element.style.bottom = '60px';

//var mainbar3 = new Bar();
//map.addControl(mainbar3);
//mainbar3.addControl(new ZoomToExtent({
//   extent: [727361, 6839277, 858148, 6990951] 
// }));
//mainbar3.setPosition('bottom-left');
//mainbar3.element.style.bottom = '120px';

var checkExist = setInterval(() => {
  let barElement = document.querySelector('.ol-control.ol-bar.bottom-left');
  if (barElement) {
    //barElement.style.bottom = '160px';
    clearInterval(checkExist);
  }
}, 100);

document.addEventListener('DOMContentLoaded', function() {
  initializeWMS(WMSCapabilities, map ); // Aufrufen der initializeWMS-Funktion aus myFunc.js
});


//-----------------------------------------------------------------------------------------------------WMS-Control

function initializeWMS(WMSCapabilities,map ) {
  var cap = new WMSCapabilities({
      target: document.body,
      srs: ['EPSG:4326', 'EPSG:3857', 'EPSG:32632'],
      cors: true,
      popupLayer: true,
      placeholder: 'WMS link hier einfügen...',
      title: 'WMS-Dienste',
      name: 'WMS-Dienste',
      searchLabel: 'Suche',
      optional: 'token',
      services: {
   'Verwaltungsgrenzen NI ': 'https://opendata.lgln.niedersachsen.de/doorman/noauth/verwaltungsgrenzen_wms',            
  'Hydro, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'WRRL, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Natur, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'HW-Schutz, Umwelkarten NI':'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'schutzgebiete, NL': 'https://service.pdok.nl/provincies/aardkundige-waarden/wms/v1_0?request=GetCapabilities&service=WMS',
  'wateren, NL': 'https://service.pdok.nl/kadaster/hy/wms/v1_0?',
  'EU-Waterbodies 3rd RBMP': 'https://water.discomap.eea.europa.eu/arcgis/services/WISE_WFD/WFD2022_SurfaceWaterBody_WM/MapServer/WMSServer?request=GetCapabilities&service=WMS',
  'Luft u. Lärm': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Luft_Laerm_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Boden, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Boden_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Inspire Hydro': 'https://sg.geodatenzentrum.de/wms_dlm250_inspire?Request=GetCapabilities&SERVICE=WMS',
  'TopPlusOpen': 'https://sgx.geodatenzentrum.de/wms_topplus_open?request=GetCapabilities&service=wms'
      },
      trace: true
  });
  map.addControl(cap);
  cap.on('load', function (e) {
      map.addLayer(e.layer);
      e.layer.set('legend', e.options.data.legend);
 });
};

function checkForLinkInTH(html) {
  const table = document.createElement('table');
  table.innerHTML = html;

  const trs = table.querySelectorAll('tr');
  const secondTr = trs[1];

  if (secondTr) {
      const tds = secondTr.querySelectorAll('td');
      
      // Durchlaufe alle td-Tags im zweiten tr-Tag
      for (const td of tds) {
          // Prüfe, ob der Inhalt des td-Tags "https://" enthält
          if (td.textContent.includes('https://') || td.textContent.includes('http://')) {
              // Wenn ja, erstelle ein a-Element und setze den Link
              const link = td.textContent.trim();
              const aElement = document.createElement('a');
              aElement.href = link;
              aElement.target = '_blank';
              
              const strongElement = document.createElement('strong');
              strongElement.textContent = 'Link';
              
              aElement.appendChild(strongElement);
      
              td.innerHTML = '';
              td.appendChild(aElement);
          }
      }
  }
  return table.outerHTML;
}

//--------------------------------------------------------------------------------------------------------------------ContextMenu
var contextmenuItems = [
  {
    text: 'Karte zentrieren',
    classname: 'bold',
    icon: centerIcon,
    callback: center
  },
  {
    text: 'Sonstiges',
    icon: listIcon,
    items: [
      {
        text: 'Zentrieren',
        icon: centerIcon,
        callback: center
      },
      {
        text: 'Marker',
        icon: pinIcon,
        callback: marker
      }
    ]
  },
  {
    text: 'Marker',
    icon: pinIcon,
    callback: marker
  },
  '-' // this is a separator
];

var contextmenu = new ContextMenu({
  width: 180,
  items: contextmenuItems
});
map.addControl(contextmenu);

var removeMarkerItem = {
  text: 'Remove this Marker',
  //classname: 'marker',
  callback: removeMarker
};

contextmenu.on('open', function (evt) {
  var contextFeature =	map.forEachFeatureAtPixel(evt.pixel, ft => ft);
  if (contextFeature && contextFeature.get('type') === 'removable') {
    contextmenu.clear();
    removeMarkerItem.data = { marker: contextFeature };
    contextmenu.push(removeMarkerItem);
  } else {
    contextmenu.clear();
    contextmenu.extend(contextmenuItems);
    contextmenu.extend(contextmenu.getDefaultItems());
  }
});

map.on('pointermove', function (e) {
  if (e.dragging) return;
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

function elastic(t) {
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}

function center(obj) {
  mapView.animate({
    duration: 700,
    easing: elastic,
    center: obj.coordinate
  });
}

function removeMarker(obj) {
  vectorLayerMark.getSource().removeFeature(obj.data.marker);
}

function marker(obj) {
  var coord4326 = transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326'),
      coord3857 = obj.coordinate, // Original-Koordinaten in EPSG:3857
      coord32632 = transform(obj.coordinate, 'EPSG:3857', 'EPSG:32632'),

      template1 = 'Koordinate (3857): {x}, {y}',
      template2 = 'Koordinate (4326): {x}, {y}',
      template3 = 'Koordinate (32632): {x}, {y}',

      iconStyle = new Style({
        image: new Icon({ scale: .5, src: pinIcon }),
        text: new Text({
          offsetY: 40, // Etwas mehr Abstand für zwei Zeilen
          //text: format(coord3857, template1, 2) + '\n' + format(coord4326, template2, 6) + '\n' + format(coord32632, template3, 6),
          //font: 'bold 15px Arial, sans-serif',
          //textAlign: 'center',
          //justify: 'center',
          //fill: new Fill({ color: '#111' }),
          //stroke: new Stroke({ color: '#eee', width: 2 })
        })
      }),
      feature = new contextFeature({
        type: 'removable',
        geometry: new Point(obj.coordinate),
        x_3857: coord3857[0].toFixed(3),
        y_3857: coord3857[1].toFixed(3), // X,Y Koordinaten in EPSG:3857
        x_4326: coord4326[0].toFixed(3), // X Koordinate in EPSG:4326
        y_4326: coord4326[1].toFixed(3),  // Y Koordinate in EPSG:4326
        x_32632: coord32632[0].toFixed(3), // X Koordinate in EPSG:32632
        y_32632: coord32632[1].toFixed(3),  // Y Koordinate in EPSG:32632

      });

  feature.setStyle(iconStyle);
  vectorLayerMark.getSource().addFeature(feature);
}

/* 
function dragElement(elmnt) {
  alert("Hallo");
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

 */

//-----------------------------------------------------------------------------------------------------------------------EditBar

const sourceEdit = new VectorSource();
const vectorEdit = new VectorLayer({
  displayInLayerSwitcher: true,
  title: "EditBar",
  name: "EditBar",
  source: sourceEdit,
  style: {
    'fill-color': 'rgba(136, 136, 136, 0.526)',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  }, 
});
map.addLayer(vectorEdit);


var select = new Select({ title: 'Auswahl'});
select.set('title', 'Auswahl');
var edit = new EditBar({
  interactions: { 
    Select: select,
    DrawLine: 'Polylinie',
    DrawPolygon: 'Polygon',
    DrawHole: 'Loch',
    DrawPoint: 'Punkt',
    DrawRegular: false,
    ModifySelect: false,
    DragRotateAndZoom: false,
    DragAndDrop: false,   
    Split: false,
    Transform: false,
    Offset: false,
    Resize: false,
  },
  source: vectorEdit.getSource() 
  
});
map.addControl(edit);

// Add a tooltip
var tooltip = new Tooltip();
map.addOverlay(tooltip);

edit.getInteraction('Select').on('select', function(e){
 if (this.getFeatures().getLength()) {
    tooltip.setInfo('Punkte ziehen');
  }
  else tooltip.setInfo();
});
edit.getInteraction('Select').on('change:active', function(e){
  tooltip.setInfo('');
});
 edit.getInteraction('ModifySelect').on('modifystart', function(e){
  if (e.features.length===1) tooltip.setFeature(e.features[0]);
});
edit.getInteraction('ModifySelect').on('modifyend', function(e){
  tooltip.setFeature();
}); 
edit.getInteraction('DrawPoint').on('change:active', function(e){
  tooltip.setInfo(e.oldValue ? '' : 'Click map to place a point...');
});
edit.getInteraction('DrawLine').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing line...');
});
edit.getInteraction('DrawLine').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing line...');
});
edit.getInteraction('DrawPolygon').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing shape...');
});
edit.getInteraction('DrawPolygon').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
});
edit.getInteraction('DrawHole').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing hole...');
});
edit.getInteraction('DrawHole').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click polygon to start drawing hole...');
});

//import { getArea, getLength } from 'ol/sphere';


edit.on('info', function(e) {
  const features = e.features;
  let message = '<i class="fa fa-info-circle"></i> ' + features.getLength() + ' feature(s) selected';
  
  if (features.getLength() === 1) {
    const feature = features.item(0);
    console.log(feature);
    const geometry = feature.getGeometry();
    const type = geometry.getType();

    if (type === 'Point') {
      const coord3857 = geometry.getCoordinates(); // Originale Koordinate (vermutlich in EPSG:3857)
      const coord4326 = toLonLat(coord3857); // Umwandlung in EPSG:4326

      message += ` – Koordinaten:<br>
        <b>EPSG:4326</b>: ${coord4326[1].toFixed(6)}, ${coord4326[0].toFixed(6)}<br>
        <b>EPSG:3857</b>: ${coord3857[1].toFixed(2)}, ${coord3857[0].toFixed(2)}`;

    } else if (type === 'LineString') {
      const length = getLength(geometry);
      const lengthStr = (length > 1000)
        ? (length / 1000).toFixed(2) + ' km'
        : length.toFixed(2) + ' m';
      message += ' – Länge: ' + lengthStr;

    } else if (type === 'Polygon' || type === 'MultiPolygon') {
      const area = getArea(geometry);
      const areaStr = (area > 1e6)
        ? (area / 1e6).toFixed(2) + ' km²'
        : area.toFixed(2) + ' m²';
      message += ' – Fläche: ' + areaStr;
    }
  }

  note.show(message, { 
    duration: -1,
    //className: 'ol-notification'
  });
  
});

// Zuerst die EditBar unsichtbar machen, bevor sie sichtbar wird
const editBarElement = edit.element;
editBarElement.style.display = 'none'; 


var toggleEditBarButton = new Button({
  title: 'Toggle EditBar',
  handleClick: function() {
    const currentEditionState = edit.get('edition');
    console.log('edit::' + edit.get('edition'));
    
    if (currentEditionState === undefined || currentEditionState === false) {
      globalCoordAnOderAus = true; // Setze die globale Variable auf true
      console.log('Global auf true')
      edit.set('edition', true);
      editBarElement.style.display = ''; // Zeige die EditBar
      /*const mapInteractions = map.getInteractions();
       mapInteractions.forEach(function(interaction) {
        if (interaction instanceof Select || interaction instanceof Modify) {
          interaction.setActive(true); // Aktiviert die Interaktionen
        }
      }); */
    } else {
      globalCoordAnOderAus = false;
      console.log('Global auf false')
      edit.set('edition', false);
      editBarElement.style.display = 'none';
      edit.deactivateControls(); 
      const mapInteractions = map.getInteractions();
      /* mapInteractions.forEach(function(interaction) {
        if (interaction instanceof Select || interaction instanceof Modify) {
          interaction.setActive(false); // Deaktiviert die Interaktionen
        }
      }); */
    }
  }
});
map.addControl(toggleEditBarButton);

