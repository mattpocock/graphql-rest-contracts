/* eslint-disable no-useless-concat */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const file = require('file');
const path = require('path');
const getSchema = require('../getSchema');
const generateMocks = require('../generateMocks');

module.exports = (contractsPath, typesDir) => {
  const errors = [];
  file.walkSync(contractsPath, (dir, dirs, files) => {
    files.forEach((fileName) => {
      if (!fileName.includes('.graphql')) return;
      const fullContractPath = path.resolve(dir, fileName);
      try {
        const schema = getSchema(fullContractPath, typesDir);
        generateMocks(schema.definitions);
      } catch (e) {
        const error = `ERROR: ` + `${fullContractPath}` + `\n\n${e.toString()}`;
        errors.push(error);
        console.log(error);
      }
    });
  });
  if (errors.length) {
    process.exit(1);
  }
};
