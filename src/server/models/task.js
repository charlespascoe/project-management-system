import Model from 'server/models/model';
import database from 'server/database/database';
import Schema from 'server/models/schema';
import validate from 'server/validation';
import moment from 'moment';

export default class Task extends Model {
  constructor(database, data, project) {
    super(database, 'task', data, Task.schema);
    this.project = project;
  }

  static create(data, project = null) {
    return new Task(database, data, project);
  }

  serialise(allDetails = false) {
    var data = {
      id: this.id,
      project: {id: this.projectId},
      summary: this.summary,
      priority: this.priority,
      created: this.created.format(),
      completed: this.completed ? this.completed.format() : null,
      targetCompletion: this.targetCompletion ? this.targetCompletion.format() : null,
      state: this.state,
      estimatedEffort: this.estimatedEffort,
      assignee: this.assignedUserId != null ? {id: this.assignedUserId} : null
    };

    if (allDetails) {
      data.description = this.description;
    }

    return data;
  }
}

Task.schema = new Schema({
  id: {
    column: 'task_id',
    id: true
  },
  projectId: {
    column: 'project_id',
    id: true
  },
  summary: {
    column: 'task_summary',
    validate: (val) => validate(val).isString().minLength(1).maxLength(256).isValid()
  },
  description: {
    column: 'task_desc',
    validate: (val) => validate(val).isString().maxLength(65536).isValid()
  },
  created: {
    column: 'created',
    readonly: true,
    getter: (val) => moment(val)
  },
  targetCompletion: {
    column: 'target_completion',
    validate: (str) => moment(str, 'DD/MM/YYYY', true).isValid(),
    getter: (date) => date == null ? null : moment(date),
    setter: (momnt) => momnt == null ? null : momnt.toDate()
  },
  state: {
    column: 'state',
    validate: (val) => validate(val).isString().isValueInObject(['OPEN', 'IN_PROGRESS', 'COMPLETED']).isValid()
  },
  completed: {
    column: 'completed',
    getter: (date) => date == null ? null : moment(date),
    setter: (momnt) => momnt == null ? null : momnt.toDate()
  },
  priority: {
    column: 'priority'
  },
  estimatedEffort: {
    column: 'est_effort',
    validate: (val) => validate(val).isNumber().min(1).max(999999).isValid()
  },
  assignedUserId: {
    column: 'assigned_user_id',
    validate: (val) => validate(val).optional().isNumber().min(1).max(99999999999).isValid()
  }
});
