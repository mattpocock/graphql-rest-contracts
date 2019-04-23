const path = require('path');
const uuid = require('uuid/v4');
const getSchema = require('../server/getSchema');
const validateRequest = require('../server/validateRequest');

const pathToFixtures = path.resolve(__dirname, './fixtures');

const complexSchema = getSchema(
  path.resolve(pathToFixtures, 'ComplexRequest.graphql'),
);

const simpleSchema = getSchema(
  path.resolve(pathToFixtures, 'SimpleRequest.graphql'),
);

const validationSchema = getSchema(
  path.resolve(pathToFixtures, 'Validation.graphql'),
);

const arraySchema = getSchema(
  path.resolve(pathToFixtures, 'RequestWithArrays.graphql'),
);

describe('validateRequest', () => {
  it('Should validate that a param has not been passed', () => {
    const errorArray = validateRequest({}, simpleSchema, 'Request');
    expect(errorArray.length === 1).toEqual(true);
  });

  it('Should validate as correct when all params are passed', () => {
    const errorArray = validateRequest(
      { something: uuid() },
      simpleSchema,
      'Request',
    );
    expect(errorArray.length === 0).toEqual(true);
  });

  it('Should validate ids', () => {
    const errorArray = validateRequest(
      { something: false },
      simpleSchema,
      'Request',
    );
    expect(errorArray.length === 1).toEqual(true);
  });

  it('Should validate strings', () => {
    const errorArray = validateRequest(
      { string: 2 },
      validationSchema,
      'Request',
    );
    expect(errorArray.length === 1).toEqual(true);
  });

  it('Should validate ints and floats as numbers', () => {
    const errorArray = validateRequest(
      { int: 'Hello' },
      validationSchema,
      'Request',
    );
    expect(errorArray.length === 1).toEqual(true);

    const otherErrorArray = validateRequest(
      { float: 'Hello' },
      validationSchema,
      'Request',
    );
    expect(otherErrorArray.length === 1).toEqual(true);

    const noErrorsArray = validateRequest(
      { float: '1' },
      validationSchema,
      'Request',
    );
    expect(noErrorsArray.length === 0).toEqual(true);
    const noErrorsArrayAgain = validateRequest(
      { int: 1 },
      validationSchema,
      'Request',
    );
    expect(noErrorsArrayAgain.length === 0).toEqual(true);
  });

  it('Should validate required fields passed within objects', () => {
    const errorArray = validateRequest(
      { requiredInput: {} },
      complexSchema,
      'Request',
    );
    expect(errorArray.length === 1).toEqual(true);
    const otherErrorArray = validateRequest(
      { requiredInput: { someId: uuid() } },
      complexSchema,
      'Request',
    );
    expect(otherErrorArray.length === 0).toEqual(true);
  });

  it('Should validate strings inside arrays', () => {
    const errorArray = validateRequest(
      {
        requiredArray: [{ someId: uuid() }],
        requiredArrayOfStrings: ['Hey'],
      },
      arraySchema,
      'Request',
    );
    expect(errorArray.length === 0).toEqual(true);
    const otherErrorArray = validateRequest(
      {
        requiredArray: [{ someId: uuid() }],
        requiredArrayOfStrings: [1],
      },
      arraySchema,
      'Request',
    );
    expect(otherErrorArray.length === 1).toEqual(true);
  });

  it('Should validate objects inside arrays', () => {
    const errorArray = validateRequest(
      {
        requiredArray: [{}],
        requiredArrayOfStrings: ['Hey'],
      },
      arraySchema,
      'Request',
    );
    expect(errorArray.length === 1).toEqual(true);
    const otherErrorArray = validateRequest(
      {
        requiredArray: [{ someId: uuid() }],
        requiredArrayOfStrings: ['Hey'],
      },
      arraySchema,
      'Request',
    );
    expect(otherErrorArray.length === 0).toEqual(true);
  });
});
