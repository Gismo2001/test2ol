

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
        
              
    'Hydro, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'WRRL, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'Natur, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'HW-Schutz, Umwelkarten NI':'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'schutzgebiete, NL': 'https://service.pdok.nl/provincies/aardkundige-waarden/wms/v1_0?request=GetCapabilities&service=WMS',
   
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
                aElement.textContent = 'Link';
                
                // Lösche den Inhalt des td-Tags und füge das a-Element hinzu
                td.innerHTML = '';
                td.appendChild(aElement);
            }
        }
    }
    return table.outerHTML;
}



function test( ) {};
