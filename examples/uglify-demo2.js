const uglifyAll = require('../src/index');

let opt = {
  js: {
    beforeDeal(text) {
      return `console.log('js beforeDeal');` + text;
    }
  },
  html: {
    beforeDeal(text) {
      return text + `<script>console.log('html beforeDeal')</script>`;
    }
  }
};

uglifyAll('./folder', './dist-folder', opt);
