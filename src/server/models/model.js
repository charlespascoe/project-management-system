import Utils from '../utils';
import SqlUtils from '../database/sql-utils';

export default class Model {
  constructor(database, tableName, idColumns, data) {
    if (typeof idColumns == 'string') {
      idColumns = [idColumns];
    }

    this._tableName = tableName;
    this._idColumns = idColumns;
    this._database = database;

    // Need to clone!
    this._previousData = Utils.copy(data);
    this._data = Utils.copy(data);
  }

  defineSchema(schema) {
    for (var column in schema) {
      if (this._data.hasOwnProperty(column)) {
        throw new Error(`Data element expected: column ${column} not found on data for ${this._tableName}`);
      }

      (function (col, meta) {
        if (meta.readonly) {
          Object.defineProperty(this, meta.property || col, {
            value: this._data[col]
          });
          return;
        }

        Object.defineProperty(this, meta.property || col, {
          get: () => this._data[col],
          set: (value) => {
            // Type checking to go here
            this._data=  value;
          }
        });

      })(column, schema[column]);
    }
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
        `WHERE ${SqlUtils.formatData(ids, null ,' AND ')};`

    await this.database.query(query, this._data);

    this._previousData = Utils.copy(this._data);
  }

  async delete() {
    var ids = {};

    for (var idCol of this._idColumns) {
      ids[idCol] = this._data[idCol];
    }

    var query =
      `DELETE FROM \`${SqlUtils.removeInvalidChars(this._tableName)}\` WHERE ${SqlUtils.formatData(ids, null, ' AND ')};`;

    await this.database.query(query, ids);
  }
}
