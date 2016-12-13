const permissions = {
  MANAGE_PROJECT_MEMBERS: {
    sysadminOverride: true
  },
  ADD_TASKS: {
    sysadminOverride: true
  },
  ASSIGNEE: {
    sysadminOverride: false
  }
};

for (var key in permissions) {
  permissions[key].key = key;
}

export default new Proxy(permissions, {
  get: (permissions, permKey) => {
    if (permKey in permissions) return permissions[permKey];
    throw new Error(`Can't find permission with key '${permKey}'`);
  }
});
