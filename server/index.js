const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const validateRequest = require('./validateRequest');
const getSchema = require('./getSchema');
const generateMocks = require('./generateMocks');

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
    __dirname,
    '../contracts',
    req.params[0].replace(/\//, ''),
  )}.graphql`;

  if (fs.existsSync(contractPath)) {
    const mockSchemaPath = path.resolve(
      __dirname,
      '../mocks',
      `${req.params[0].replace(/\//, '')}.js`,
    );
    const mockSchemaExists = fs.existsSync(mockSchemaPath);

    let mockSchema = {};
    if (mockSchemaExists) {
      mockSchema = module.require(mockSchemaPath);
    }

    const schema = getSchema(contractPath);

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

// eslint-disable-next-line no-console
app.listen(4000, () => console.log('Started server on port 4000...'));
