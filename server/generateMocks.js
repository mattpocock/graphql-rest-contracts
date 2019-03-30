const uuid = require('uuid/v4');
const faker = require('faker');
const moment = require('moment');
const { useSequentialIds } = require('./devTools');
const reduceToObject = require('./reduceToObject');
const randomValueFromArray = require('./randomValueFromArray');

const mockIndividualKey = (type, title = '', arrayIndex) => {
  const adjustedTitle = `${title}`.toLowerCase();
  if (type === 'string') {
    if (adjustedTitle.includes('email')) {
      return faker.internet.email();
    }
    if (adjustedTitle.includes('firstname')) {
      return faker.name.firstName();
    }
    if (
      adjustedTitle.includes('lastname') ||
      adjustedTitle.includes('surname')
    ) {
      return faker.name.lastName();
    }
    if (adjustedTitle.includes('lastupdatedby')) {
      return faker.name.findName();
    }
    if (adjustedTitle.includes('date')) {
      return moment(faker.date.future()).format('YYYY-MM-DD');
    }
    if (
      adjustedTitle.includes('pin') ||
      adjustedTitle.includes('cdsid') ||
      adjustedTitle.includes('dslid') ||
      adjustedTitle.includes('cicode')
    ) {
      return `${faker.random.number()}`;
    }
    if (adjustedTitle.includes('market') || adjustedTitle.includes('region')) {
      return faker.address.country();
    }

    return `string: ${faker.name.findName()}`;
  }

  if (type === 'number') {
    return faker.random.number();
  }

  if (type === 'integer') {
    return faker.random.number();
  }

  if (type === 'id') {
    if (arrayIndex && useSequentialIds) return arrayIndex;
    return useSequentialIds ? randomValueFromArray([1, 2]) : uuid();
  }

  if (type === 'boolean') {
    return randomValueFromArray([true, false]);
  }

  throw new Error(`Unknown key type found: ${type}`);
};

const mockObject = ({
  object,
  definitions,
  isDefinition = false,
  mockSchema = {},
  arrayIndex,
}) => {
  if (object.type === 'object' && object.properties) {
    const content = {
      ...Object.keys(object.properties)
        .map((key) =>
          mockObject({
            object: object.properties[key],
            definitions,
            mockSchema: mockSchema[key],
            arrayIndex,
          }),
        )
        .reduce(reduceToObject, {}),
    };
    return isDefinition ? content : { [object.title]: content };
  }

  if (
    object.type === 'string' ||
    object.type === 'number' ||
    object.type === 'integer' ||
    object.type === 'id' ||
    object.type === 'boolean'
  ) {
    /** If we have arrived at an individual key in the mocks, too */
    if (typeof mockSchema !== 'object') {
      return typeof mockSchema === 'function'
        ? { [object.title]: mockSchema() }
        : { [object.title]: mockSchema };
    }
    return {
      [object.title]: mockIndividualKey(object.type, object.title, arrayIndex),
    };
  }

  if (object.constructor === Object && object.type && object.type.type) {
    return mockIndividualKey(object.type.type, undefined, arrayIndex);
  }

  if (object.type === 'array' && object.items) {
    return {
      [object.title]: [
        mockObject({ object: object.items, definitions, arrayIndex: 1 }),
        mockObject({ object: object.items, definitions, arrayIndex: 2 }),
      ],
    };
  }

  if (object.type === 'GRAPHQL_ENUM' && object.enum && object.enum.length) {
    /** This mocks enums to return based on their number */
    return randomValueFromArray(object.enum.map((_, index) => index + 1));
  }

  if (object.type && object.type.$ref) {
    const definition = object.type.$ref.replace(/#\/definitions\//, '');
    if (definitions[definition]) {
      return mockObject({
        object: definitions[definition],
        definitions,
        isDefinition: true,
        mockSchema,
        arrayIndex,
      });
    }
  }

  if (object.$ref) {
    const definition = object.$ref.replace(/#\/definitions\//, '');
    if (definitions[definition]) {
      return mockObject({
        object: definitions[definition],
        definitions,
        isDefinition: true,
        mockSchema,
        arrayIndex,
      });
    }
  }

  if (object.allOf) {
    const adjustedObject = object.allOf.reduce((a, b) => ({ ...a, ...b }), {});

    return {
      [adjustedObject.title]: mockObject({
        object: adjustedObject,
        definitions,
        mockSchema,
        arrayIndex,
      }),
    };
  }

  throw new Error(
    `Unknown type of object encountered:\n${JSON.stringify(object, null, 2)}`,
  );
};

module.exports = (definitions = {}, mockSchema = {}) => {
  return Object.keys(definitions)
    .map((key) => ({
      [key]: mockObject({
        object: definitions[key],
        definitions,
        isDefinition: true,
        mockSchema: mockSchema[key],
      }),
    }))
    .reduce(reduceToObject, {});
};
