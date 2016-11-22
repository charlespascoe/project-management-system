const generalPermissions = {
  GET_OTHER_USER_DETAILS: {
    sysadmin: true
  },
  ADD_USER: {
    sysadmin: true
  },
  DELETE_USER: {
    sysadmin: true
  },
  GET_ALL_PROJECTS: {
    sysadmin: true
  },
  CREATE_PROJECT: {
    sysadmin: true
  }
};

export default new Proxy(generalPermissions, {
  get: (permissions, permKey) => {
    if (permKey in permissions) return permissions[permKey];
    throw new Error(`Can't find permission with key '${permKey}'`);
  }
});
