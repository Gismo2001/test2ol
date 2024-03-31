//myFunc.js

export   function yourFunctionName(evt) {
    // Hier befindet sich der Inhalt Ihrer Funktion
    // Die Funktion sollte alle Variablen und Aktionen enthalten, die Sie ausgelagert haben
    // Zum Beispiel:
   
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
  
};