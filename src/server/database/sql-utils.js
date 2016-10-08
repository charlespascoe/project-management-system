export default class SqlUtils {
  static removeInvalidChars(identifier) {
    return identifier.replace(/[^0-9,a-z,A-Z_]/, '');
  }

  static formatData(data, tableName = null) {
    var setValues = [];

    if (tableName) {
      tableName = `\`${SqlUtils.removeInvalidChars(tableName)}\`.`;
    }

    for (var column in data) {
      var colName = SqlUtils.removeInvalidChars(column);

      setValues.push(`${tableName}\`${colName}\` = :${colName}`);

      return setValues.join(', ');
    }
  }
}
