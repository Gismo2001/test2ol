import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';

const bwBruAndereStyle = new Style({
  image: new Icon({
    src: './data/bru_andere.svg',  // Hier wird der Pfad relativ zur HTML-Datei angenommen
    scale: 0.9,
  }),
});

const bwBruNlwknStyle = new Style({
  image: new Icon({
    src: './data/bru_nlwkn.svg',  // Hier wird der Pfad relativ zur HTML-Datei angenommen
    scale: 0.9,
  }),
});

export { bwBruAndereStyle,bwBruNlwknStyle };

