import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

const bwBruAndereStyle = new Style({
    image: new Icon({
      src: './data/bru_andere.svg',
      scale: 0.9,
    }),
  });
  
  const bwBruNlwknStyle = new Style({
    image: new Icon({
      src: './data/bru_nlwkn.svg',
      scale: 0.9,
    }),
  });
  
  export { bwBruAndereStyle, bwBruNlwknStyle };