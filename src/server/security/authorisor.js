import moment from 'moment';

export class Authorisor {
  hasGeneralPermission(user, genPermission) {
    var userIsSysadminElevated =
      user.sysadmin &&
      user.requestToken.sysadminElevationExpires &&
      moment().isBefore(user.requestToken.sysadminElevationExpires);

    if (genPermission.sysadmin) return userIsSysadminElevated;

    return false;
  }

  async hasProjectPermission(user, projectId, permission) {
    if (user.isSysadminElevated && permission.sysadminOverride) return true;

    var projAssignment = user.projectAssignments.find(pa => pa.projectId === projectId);

    if (!projAssignment) return false;

    var role = await projAssignment.getRole();

    if (!role.hasPermission(permission.id)) return false;

    return true;
  }
}

export default new Authorisor();
