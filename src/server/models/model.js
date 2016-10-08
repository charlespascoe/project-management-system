import Utils from '../utils';
import SqlUtils from '../database/sql-utils';

export default class Model {
  constructor(database, loggers, tableName, idColumns, data) {
    if (typeof idColumns == 'string') {
      idColumns = [idColumns];
    }

    this._tableName = tableName;
    this._idColumns = idColumns;
    this._database = database;
    this._loggers = loggers;

    // Need to clone!
    this._previousData = Utils.copy(data);
    this._data = Utils.copy(data);
  }

  defineProperty(propertyName, columnName) {
    if (this._idColumns.find(columnName)) {
      Object.defineProperty(this, propertyName, {
        value: this._data[columnName]
      });
      return;
    }

    Object.defineProperty(this, propertyName, {
      get: () => this._data[columnName],
      set: (value) => this._data[columnName] = value
    });
  }

  async save() {
    var changedFields = {},
        hasChanged = false;

    for (var column in this._data) {
      if (this._data[column] === this._previousData[column]) continue;
      changedFields[column] = this._data[column];
      hasChanged = true;
    }

    if (!hasChanged) return;

    var ids = {};

    for (var idCol of this._idColumns) {
      ids[idCol] = this._data[idCol];
    }

    var query =
      `UPDATE \`${SqlUtils.removeInvalidChars(this._tableName)}\` ` +
        `SET ${SqlUtils.formatData(changedFields)} ` +
        `WHERE ${SqlUtils.formatData(ids)};`

    try {
      await this.database.query(query, this._data);
    } catch (e) {
      this._loggers.database.error({err: e, query: query}, `Failed to save ${this._tableName}`);
      throw e;
    }

    this._previousData = Utils.copy(this._data);
  }
}
