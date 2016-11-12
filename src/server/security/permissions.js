const permissions = [
  'GET_OTHER_USER_DETAILS'
].reduce((obj, permKey) => {
  obj[permKey] = permKey;
  return obj;
});

export default new Proxy(permissions, {
  get: (permissions, permKey) => {
    if (permKey in permissions) return permissions[permKey];
    throw new Error(`Can't find permission with key '${permKey}'`);
  }
});
