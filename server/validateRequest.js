/* eslint-disable no-restricted-globals */
const massageAllOf = require('./massageAllOf');

// const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateType = (value, type, key) => {
  switch (type) {
    // case 'id':
    // return uuidRegex.test(value)
    //   ? null
    //   : `Incorrect value passed to ${key}: type of ID expected.`;
    case 'number':
    case 'integer':
      return !isNaN(value)
        ? null
        : `Incorrect value passed to ${key}: numeric type expected.`;
    case 'id':
    case 'string':
      return typeof value === 'string'
        ? null
        : `Incorrect value passed to ${key}: String expected.`;
    case 'array':
      return Array.isArray(value)
        ? null
        : `Incorrect value passed to ${key}: Array expected.`;
    default:
      return null;
  }
};

const validateRequest = (request, schema, key, prevPath = [key]) => {
  const shape = schema.definitions[key];
  if (!shape) {
    return [];
  }
  const requiredErrors = Object.keys(shape.properties)
    .map((propertyKey) => {
      const property = massageAllOf(shape.properties[propertyKey]);
      const value = request[propertyKey];

      /** If not required, return null */
      if (!property.required && !value) {
        return null;
      }

      if (
        property.required &&
        typeof value === 'undefined' &&
        value !== 'null'
      ) {
        return `${prevPath.join(' / ')}: ${propertyKey} of type '${
          property.type
        }' is required.`;
      }

      if (value === 'null') {
        return null;
      }

      if (property.$ref) {
        return validateRequest(
          value,
          schema,
          property.$ref.replace(/#\/definitions\//, ''),
          [...prevPath, propertyKey],
        ).join('\n');
      }

      const typeError = validateType(value, property.type, propertyKey);

      if (typeError) {
        return `${prevPath.join(' / ')}: ${typeError}`;
      }

      if (property.items) {
        const itemType = property.items.type;

        if (itemType.$ref) {
          const errors = value
            .map((item) => {
              const e = validateRequest(
                item,
                schema,
                itemType.$ref.replace(/#\/definitions\//, ''),
                [...prevPath, propertyKey],
              );
              return e.join('\n');
            })
            .filter((val) => val)
            .join('\n');
          if (errors) {
            return errors;
          }
          return null;
        }

        const errors = value
          .map((item) => {
            return validateType(item, itemType.type, propertyKey);
          })
          .filter((val) => val)
          .join('\n');
        return errors;
      }

      return null;
    })
    .filter((val) => Boolean(val));

  // const excessParamsErrors = Object.keys(request)
  //   .map((requestKey) => {
  //     if (!shape.properties[requestKey]) {
  //       return `${prevPath.join(
  //         ' / ',
  //       )}: ${requestKey} passed to API call, but is not on the Request type.`;
  //     }
  //     return null;
  //   })
  //   .filter((val) => Boolean(val));

  return [...requiredErrors, ...[]];
};

module.exports = validateRequest;
