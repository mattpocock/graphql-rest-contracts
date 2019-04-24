const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const validateRequest = require('./validateRequest');
const getSchema = require('./getSchema');
const generateMocks = require('./generateMocks');

const startServer = ({ contractsDir, mocksDir, typesDir, port = 4000 }) => {
  const app = express();
  app.use(bodyParser.json({ limit: '999mb', type: `application/json` }));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    next();
  });

  app.all('*', (req, res) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    const contractPath = `${path.resolve(
      contractsDir,
      req.params[0].replace(/\//, ''),
    )}.graphql`;

    if (fs.existsSync(contractPath)) {
      let mockSchema = {};

      if (mocksDir) {
        const mockSchemaPath = path.resolve(
          mocksDir,
          `${req.params[0].replace(/\//, '')}.js`,
        );
        const mockSchemaExists = fs.existsSync(mockSchemaPath);

        if (mockSchemaExists) {
          mockSchema = module.require(mockSchemaPath);
        }
      }

      const schema = getSchema(contractPath, typesDir);

      try {
        const mocks = generateMocks(schema.definitions, mockSchema);

        const request = {
          ...req.body,
          ...req.query,
        };

        let errors = [];

        /** Cannot validate multipart/form-data at present */
        // eslint-disable-next-line no-underscore-dangle
        if (!request._ignoreExcess && !req.is('multipart/form-data')) {
          errors = validateRequest(request, schema, 'Request');
        }

        setTimeout(() => {
          if (errors.length > 0) {
            res.status(200);
            res.json({
              Errors: errors.map((Description) => {
                return { Description };
              }),
            });
          } else {
            res.status(200);
            res.json(mocks.Response);
          }
        }, 200);
      } catch (e) {
        res.json({
          Errors: [
            {
              Description: e.toString(),
            },
          ],
        });
      }

      return;
    }

    res.status(404);
    res.send('');
  });

  const server = app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`Started server on port ${port}...`),
  );
  return server;
};

module.exports = startServer;
