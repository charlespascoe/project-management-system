import Utils from 'server/utils';
import SqlUtils from 'server/database/sql-utils';

export default class Model {
  constructor(database, tableName, data, schema = null) {
    this._tableName = tableName;
    this._idColumns = [];
    this._database = database;

    this._previousData = Utils.copy(data);
    this._data = Utils.copy(data);

    if (schema) {
      this.defineSchema(schema);
    }
  }

  defineSchema(schema) {
    Utils.readonlyProperty(this, 'schema', schema);

    for (var property of schema) {
      if (!this._data.hasOwnProperty(property.column)) {
        continue;
        //throw new Error(`Data element expected: column ${property.column} not found on data for ${this._tableName}`);
      }

      if (property.readonly || property.id) {
        Utils.readonlyProperty(this, property.propName, property.getter(this._data[property.column]));
        continue;
      }

      (function (prop) {
        Object.defineProperty(this, prop.propName, {
          get: () => prop.getter(this._data[prop.column]),
          set: (value) => {
            // Type checking to go here
            this._data[prop.column] = prop.setter(value);
          },
        });
      }.bind(this))(property);
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

    var query =
      `UPDATE \`${SqlUtils.removeInvalidChars(this._tableName)}\` ` +
        `SET ${SqlUtils.formatData(changedFields)} ` +
        `WHERE ${this.schema.formatIdClause()};`

    await this._database.query(query, this._data);

    this._previousData = Utils.copy(this._data);
  }

  async delete() {
    var query =
      `DELETE FROM \`${SqlUtils.removeInvalidChars(this._tableName)}\` WHERE ${this.schema.formatIdClause()};`;

    await this._database.query(query, this._data);
  }
}
