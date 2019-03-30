const fs = require('fs');
const file = require('file');
const path = require('path');
const transform = require('../graphql-json-schema');

const types = [];

file.walkSync(path.resolve(__dirname, '../types'), (dir, dirs, files) => {
  files.forEach((fileName) => {
    const contents = fs.readFileSync(path.resolve(dir, fileName)).toString();
    types.push(contents);
  });
});

module.exports = (contractPath) => {
  const schemaArray = [fs.readFileSync(contractPath).toString()];

  return transform([...types, ...schemaArray].join('\n'));
};
