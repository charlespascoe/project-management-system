import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';

export default class Project extends Model {
  constructor(database, data) {
    super(database, 'project', data, Project.schema);
  }

  serialise() {
    return {
      id: this.id,
      name: this.name
    }
  }
}

Project.schema = new Schema({
  id: {
    column: 'project_id',
    id: true,
    validate: (val) => validate(val).isString().matches(/^[A-Z]{1,16}$/).isValid()
  },
  name: {
    column: 'project_name',
    validate: (val) => validate(val).isString().minLength(1).maxLength(64).isValid()
  }
});
