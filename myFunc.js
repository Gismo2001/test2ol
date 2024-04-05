// Inhalt von myFunc.js
function initializeWMS(WMSCapabilities,map ) {
    var cap = new WMSCapabilities({
        target: document.body,
        srs: ['EPSG:4326', 'EPSG:3857', 'EPSG:32632'],
        cors: true,
        popupLayer: true,
        placeholder: 'WMS link hier einfügen...',
        title: 'WMS-Service',
        searchLabel: 'Suche',
        optional: 'token',
        services: {
            'OSM': 'https://wms.openstreetmap.fr/wms',
            'Hydro, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
            'WRRL, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
        },
        trace: true
    });
    map.addControl(cap);
    cap.on('load', function (e) {
        map.addLayer(e.layer);
        e.layer.set('legend', e.options.data.legend);
   });
}

