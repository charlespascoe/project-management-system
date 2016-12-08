const permissions = {
  MANAGE_PROJECT_MEMBERS: {
    sysadminOverride: true
  },
  ADD_TASKS: {
    sysadminOverride: true
  }
};

for (var id in permissions) {
  permissions[id].id = id;
}

export default new Proxy(permissions, {
  get: (permissions, permKey) => {
    if (permKey in permissions) return permissions[permKey];
    throw new Error(`Can't find permission with key '${permKey}'`);
  }
});
