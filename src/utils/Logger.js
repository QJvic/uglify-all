module.exports = class Logger {
  constructor(flag) {
    this.flag = flag;
  }

  log() {
    if (!this.flag) return;
    console.log(...arguments);
  }
};
