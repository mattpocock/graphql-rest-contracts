const { parse } = require('graphql/language');
const transform = require('./transform.js');

module.exports = (schema) => {
  if (typeof schema !== 'string') {
    throw new TypeError('GraphQL Schema must be a string');
  }
  return transform(parse(schema));
};
