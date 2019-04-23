const path = require('path');
const getSchema = require('../server/getSchema');
const generateMocks = require('../server/generateMocks');

const pathToFixtures = path.resolve(__dirname, './fixtures');

const complexResponse = getSchema(
  path.resolve(pathToFixtures, 'ComplexResponse.graphql'),
);

describe('generateMocks', () => {
  it('Should mock a complex object', () => {
    const mocks = generateMocks(complexResponse.definitions, {
      SomeObject: {
        id: () => 'hello',
        string: () => 'string',
      },
      SomeOtherObject: {
        name: () => 'Hey',
      },
    });
    expect(mocks.Response.Data.object.id).toEqual('hello');
    expect(mocks.Response.Data.object.string).toEqual('string');
    expect(mocks.Response.Data.object.array[0].name).toEqual('Hey');
  });
});
