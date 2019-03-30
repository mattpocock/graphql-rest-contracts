const validateRequest = (request, schema, key) => {
  const shape = schema.definitions[key];
  if (!shape) {
    return [];
  }
  const requiredErrors = Object.keys(shape.properties)
    .map((propertyKey) => {
      if (!shape.properties[propertyKey].required) {
        return null;
      }
      if (typeof request[propertyKey] === 'undefined') {
        return `${propertyKey} of type '${
          shape.properties[propertyKey].type
        }' is required.`;
      }
      return null;
    })
    .filter((val) => Boolean(val));

  const excessParamsErrors = Object.keys(request)
    .map((requestKey) => {
      if (!shape.properties[requestKey]) {
        return `${requestKey} passed to API call, but is not on the Request type.`;
      }
      return null;
    })
    .filter((val) => Boolean(val));

  return [...requiredErrors, ...excessParamsErrors];
};

module.exports = validateRequest;
