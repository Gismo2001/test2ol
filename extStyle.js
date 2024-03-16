import {Circle as CircleStyle, Fill, RegularShape, Icon, Stroke, Style, Text} from 'ol/style.js';
//extfunc.js
const sleStyle = new Style({
    image: new Icon({
        src: './data/sle.svg',
        scale: .9 
    })
  });
const wehStyle = new Style({
    image: new Icon({
        src: './data/weh.svg',
        scale: .9 
    })
  });
const bru_nlwknStyle = new Style({
    image: new Icon({
    src: './data/bru_nlwkn.svg',
    scale: .9 
    })
});
const bruAndereStyle = new Style({
    image: new Icon({
    src: './data/bru_andere.svg',
    scale: .9 
    })
});
const dueStyle = new Style({
    image: new Icon({
        src: './data/due.svg',
        scale: .9
    })
});
const queStyle = new Style({
    image: new Icon({
    src: './data/que.svg',
    scale: .9
    })
});
const son_punStyle = new Style({
    image: new RegularShape({
    fill: new Fill({color:'rgba(209, 32, 253, 1)' }),
    stroke: new Stroke({
    color: 'black',
    width: 2
    }),
    points: 4,
    radius: 7,
    angle: Math.PI / 4
    })
});
const km10scalStyle = new Style({
    stroke: new Stroke({
        color: 'grey',
        width: .5
    })
});
const gehoelz_vecStyle = new Style({
    stroke: new Stroke({
    color: 'rgba(173, 114, 3, 1)',
    width: 3
    }),
});
const son_linStyle = new Style({
    stroke: new Stroke({
    color: 'rgba(209, 32, 253, 1)',
    width: 4
    }),
});
function getStyleForArtEin(feature) {   
    const artValue = feature.get('Ein_ord');
    
    let iconSrc;
    switch (artValue) {
        case '1. Ordnung':
            iconSrc = './data/einErsterOrdnung.svg';
            break;
        case '2. Ordnung':
            iconSrc = './data/einZweiterOrdnung.svg';
            break;
        case '3. Ordnung':
            iconSrc = './data/einDritterOrdnung.svg';
            break;
        case 'Einleitung':
            iconSrc = './data/einEinleitung.svg';
            break;
        case 'Sonstige':
            iconSrc = './data/einSonstige.svg';
            break;
        default:
            iconSrc = './data/einSonstige.svg';
    }

    return new Style({
        image: new Icon({
            src: iconSrc,
            scale: .9 
        })
    });
}
function machWasMitFSK(feature){
    console.log (feature.get('Art'));
};
function getStyleForArtFSK(feature) {
    const artValue = feature.get('Art');
    let fillColor, strokeColor;
    switch (artValue) {
    case 'p':
        fillColor = 'rgba(200, 200, 200, .6)';
        strokeColor = 'black';
        break;
    case 'o':
        fillColor = 'rgba(255, 220, 220, .6)';
        strokeColor = 'black';
        break;
    case 'l':
        fillColor = 'rgba(255, 190, 150, .6)';
        strokeColor = 'black';
        break;
    default:
        fillColor = 'rgba(255, 255, 255, 1)';
        strokeColor = 'grey';
    }
    return new Style({
        fill: new Fill({
            color: fillColor
        }),
        stroke: new Stroke({
            color: strokeColor,
            width: 0.5
        })
    });
};
function getStyleForArtUmn(feature) {
  const mnIdValue = feature.get('Massn_ID');
  let fillColor, strokeColor;

  switch (mnIdValue) {
  //zweimalige Mahd
  case 23:
      //fillColor = 'rgba(200, 200, 200, .6)';
      strokeColor = 'rgba(135, 101, 0, 0.1)';
      break;  
  //zweimalige Mahd
  case 9:
      //fillColor = 'rgba(200, 200, 200, .6)';
      strokeColor = 'red';
      break;
  //keine Mahd
  case 4:
      //fillColor = 'rgba(200, 200, 200, .6)';
      strokeColor = 'blue';
      break;
  //einmalige Mahd
  case 11:
      //fillColor = 'rgba(255, 220, 220, .6)';
      strokeColor = 'blue';
      break;
  //beobachtende Unterhaltung
  case 1:
      //fillColor = 'rgba(255, 190, 150, .6)';
      strokeColor = 'blue';
      break;
  default:
      //fillColor = 'rgba(255, 255, 255, 1)';
      strokeColor = 'grey';
  }
  return new Style({
      //fill: new Fill({
      //    color: fillColor
      //}),
      stroke: new Stroke({
          color: strokeColor,
          width: 5
      })
  });
};
const km100scalStyle = function(feature, text, resolution) {
    var minResolution = 0;
    var maxResolution = 5; 
    if (resolution > minResolution && resolution < maxResolution) {
      return new Style({
        text: new Text({
          text: text,
          font: 'normal 18px "Arial Light", "Helvetica Neue Light", Arial, sans-serif',
          offsetX: -10,
          offsetY: 10,        
        }),
        stroke: new Stroke({
          color: 'black', // oder eine andere Linienfarbe
          width: 1 // oder eine andere Linienbreite  
        })
      });
    } else {
      return null;
    }
};
const km500scalStyle = function(feature, text, resolution) {
    var minResolution = 0;
    var maxResolution = 10; 
    if (resolution > minResolution && resolution < maxResolution) {
      return new Style({
        text: new Text({
          text: text,
          font: 'normal 20px "Arial Light", "Helvetica Neue Light", Arial, sans-serif',
          offsetX: -10,
          offsetY: 10,
          fill: new Fill({
            color: 'rgba(0, 0, 0, 1)'
          }),
        }),
        stroke: new Stroke({
          color: 'black', // oder eine andere Linienfarbe
          width: 2 // oder eine andere Linienbreite  
        })
      });
    } else {
      return null;
    }
};
export { bru_nlwknStyle,
    sleStyle,
    wehStyle, 
    bruAndereStyle, 
    dueStyle,
    queStyle,
    son_linStyle, 
    son_punStyle,
    km10scalStyle,
    gehoelz_vecStyle,
    getStyleForArtFSK,
    getStyleForArtEin,
    getStyleForArtUmn,
    km100scalStyle,
    km500scalStyle,
    
    machWasMitFSK
};
    
  

