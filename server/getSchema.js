const fs = require('fs');
const file = require('file');
const path = require('path');
const transform = require('../graphql-json-schema');

module.exports = (contractPath, typesDir) => {
  const schemaArray = [fs.readFileSync(contractPath).toString()];

  const types = [];

  if (typesDir) {
    file.walkSync(typesDir, (dir, dirs, files) => {
      files.forEach((fileName) => {
        const contents = fs
          .readFileSync(path.resolve(dir, fileName))
          .toString();
        types.push(contents);
      });
    });
  }

  return transform([...types, ...schemaArray].join('\n'));
};
