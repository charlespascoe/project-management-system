import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';

export class Project extends Model {
  constructor(database, data) {
    super(database, 'project', data, Project.schema);
  }
}

Project.schema = new Schema({
  id: {
    column: 'project_id',
    id: true
  },
  name: {
    column: 'project_name',
    validate: (val) => validate(val).isString().minLength(1).maxLength(64).isValid()
  }
});
