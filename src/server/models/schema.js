import Utils from 'server/utils';

export class SchemaProperty {
  constructor(propName, config) {
    var {
      column = propName,
      id = false,
      readonly = false,
      validate = () => true,
      getter = (val) => val,
      setter = (val) => val
    } = config;

    Utils.readonlyProperty(this, 'propName', propName);
    Utils.readonlyProperty(this, 'column', column);
    Utils.readonlyProperty(this, 'readonly', readonly);
    Utils.readonlyProperty(this, 'id', id);
    Utils.readonlyProperty(this, 'validate', validate);
    Utils.readonlyProperty(this, 'getter', getter);
    Utils.readonlyProperty(this, 'setter', setter);
  }
}

export default class Schema {
  constructor(schema) {
    this.properties = {};
    this.ids = [];

    for (var propName in schema) {
      var schemaProp = new SchemaProperty(propName, schema[propName]);

      Utils.readonlyProperty(this, propName, schemaProp);

      this.properties[propName] = schemaProp;

      if (schemaProp.id) {
        this.ids.push(schemaProp);
      }
    }
  }

  *[Symbol.iterator]() {
    for (var propName in this.properties) {
      yield this.properties[propName];
    }
  }

  // Maps model properties onto an object with the respective column names as keys
  // Returns null if no valid properties present
  mapPropertiesToColumns(data) {
    var columnData = {};

    var transferredAny = false;

    for (var property of this) {
      if (property.propName in data) {
        columnData[property.column] = data[property.propName];
        transferredAny = true;
      }
    }

    return transferredAny ? columnData : null;
  }

  formatIdClause() {
    return this.ids
      .map((idProp) => `\`${idProp.column}\` = :${idProp.column}`)
      .join(' AND ');
  }

  invalid(data) {
    for (var key in data) {
      if (!(key in this.properties)) continue;

      if (!this.properties[key].validate(data[key])) return key;
    }

    return null;
  }
}
