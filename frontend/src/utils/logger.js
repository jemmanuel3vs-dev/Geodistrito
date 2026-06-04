export const logger = {

  log(...args) {

    if (
      location.hostname === 'localhost'
    ) {
      console.log(...args);
    }

  },

  warn(...args) {
    console.warn(...args);
  },

  error(...args) {
    console.error(...args);
  }

};