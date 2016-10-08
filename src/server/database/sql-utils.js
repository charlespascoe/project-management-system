export default class SqlUtils {
  static removeInvalidChars(identifier) {
    return identifier.replace(/[^0-9,a-z,A-Z_]/, '');
  }

  static formatData(data, tableName = null, join = ', ') {
    var setValues = [];

    if (tableName) {
      tableName = `\`${SqlUtils.removeInvalidChars(tableName)}\`.`;
    } else {
      tableName = '';
    }

    for (var column in data) {
      var colName = SqlUtils.removeInvalidChars(column);

      setValues.push(`${tableName}\`${colName}\` = :${colName}`);
    }

    return setValues.join(join);
  }
}
