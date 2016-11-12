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

  async hasProjectPermission(user, projectId, permKey) {
    var projAssignment = await user.projectAssignments.find(pa => pa.projectId === projectId);

    if (!projAssignment) return false;

    var role = await projAssignment.getRole();

    if (!role.hasPermission(permKey)) return false;

    return true;
  }
}

export default new Authorisor();
