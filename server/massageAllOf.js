module.exports = (object) =>
  object.allOf ? object.allOf.reduce((a, b) => ({ ...a, ...b }), {}) : object;
