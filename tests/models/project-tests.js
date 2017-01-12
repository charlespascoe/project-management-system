import Project from 'server/models/project';
import ProjectAssignment from 'server/models/project-assignment';
import User from 'server/models/user';
import TestFrame from 'tests/test-frame';
import testingDatabase from 'tests/testing-database';

const tests = new TestFrame('Project');
tests.createInstance = () => {
  return new Project(testingDatabase, {
    project_id: 'EXAMPLE',
    project_name: 'Example Project',
    icon_url: 'https://www.example.com/icon.png'
  });
};

tests.before = async () => {
  testingDatabase.init();
  await testingDatabase.reset();
};

tests.after = async (st) => {
  await testingDatabase.end();
  st.end();
};

tests.testMethod('getMembers', function (t) {
  t.test('It should return an empty list when there are no members', async function (st, project) {
    await testingDatabase.query('DELETE FROM `project_assignment` WHERE `project_id` = :projectId;', {projectId: project.id});

    var members = await project.getMembers();

    st.equals(members.length, 0);
  });

  t.test('It should return the list of memebers', async function (st, project) {
    var members = await project.getMembers();

    st.equals(members.length, 1);
    st.ok(members[0] instanceof ProjectAssignment);
    st.equals(members[0].userId, 1);
    st.equals(members[0].projectId, 'EXAMPLE');
    st.equals(members[0].roleId, 3);
  });
});

tests.testMethod('getNonMembers', function (t) {
  t.test('It should return a list of non-members', async function (st, project) {
    await testingDatabase.query('DELETE FROM `project_assignment` WHERE `project_id` = :projectId;', {projectId: project.id});

    var nonMembers = await project.getNonMembers();

    st.equals(nonMembers.length, 1);
    st.ok(nonMembers[0] instanceof User, 'Non-members should be of the type User');
    st.equals(nonMembers[0].id, 1);
  });
});

tests.testMethod('addMember', function (t) {
  t.test('It should successfully add a new member', async function (st, project) {
    await testingDatabase.query('DELETE FROM `project_assignment` WHERE `project_id` = :projectId;', {projectId: project.id});

    var result = await project.addMember(1, 2);

    st.equals(result, null);

    var assignments = await testingDatabase.query('SELECT * FROM `project_assignment` WHERE `project_id` = :projectId;', {projectId: project.id});

    st.equals(assignments.length, 1);
    st.equals(assignments[0].project_id, 'EXAMPLE');
    st.equals(assignments[0].user_id, 1);
    st.equals(assignments[0].role_id, 2);
  });

  t.test('It should return NOT_FOUND for non-existent user', async function (st, project) {
    var result = await project.addMember(1000, 2);

    st.equals(result, 'NOT_FOUND');
  });

  t.test('It should return DUPLICATE if the user is already a member', async function (st, project) {
    var result = await project.addMember(1, 2);

    st.equals(result, 'DUPLICATE');
  });
});

tests.testMethod('getTasks', function (t) {
  t.test('It should return an empty list if there are no tasks', async function (st, project) {
    await testingDatabase.query('DELETE FROM `task` WHERE `project_id` = :projectId;', {projectId: project.id});

    var tasks = await project.getTasks();

    st.equals(tasks.length, 0);
  });

  t.test('It should return all tasks', async function (st, project) {
    var tasks = await project.getTasks();

    st.equals(tasks.length, 1);
    st.equals(tasks[0].projectId, 'EXAMPLE');
    st.equals(tasks[0].id, 1);
    st.equals(tasks[0].summary, 'Task Summary');
  });
});

tests.testMethod('addTask', function (t) {
  t.test('It should return the ID of the new task', async function (st, project) {
    var data = {
      summary: 'New Summary',
      description: 'Description',
      created: new Date(),
      priority: 1,
      estimatedEffort: 120
    };

    var taskId = await project.addTask(data);

    st.equals(taskId, 2);

    var result = await testingDatabase.queryForOne('SELECT * FROM `task` WHERE `project_id` = :projectId AND `task_id` = :taskId;', {projectId: project.id, taskId: taskId});

    st.equals(result.task_summary, data.summary, 'Summary should be correct');
    st.equals(result.task_desc, data.description, 'Description should be correct');
    st.equals(result.priority, data.priority, 'Priority should be correct');
    st.equals(result.est_effort, data.estimatedEffort, 'Estimated Effort should be correct');
  });
});
