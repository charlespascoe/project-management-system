import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { ProjectsController } from 'server/controllers/projects-controller';
import dummyLoggers from 'tests/dummy-loggers';

const tests = new TestFrame('ProjectsController');
tests.createInstance = function () {
  var projects = {
    createProject: async () => true
  };

  var authorisor = {
    hasGeneralPermission: () => true
  };

  return new ProjectsController(dummyLoggers, projects, authorisor);
};

tests.testMethod('createProject', function (t) {
  t.test('It should return 400 for invalid project name', async function (st, projController) {
    projController.projects.createProject = () => st.fail('Projects.createProject should not have been called');
    var result = new Result();

    await projController.createProject(result, {}, {
      id: 'ABC',
      name: 'a'.repeat(1000),
      iconUrl: 'https://www.example.com/icon.png'
    });

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for invalid project ID', async function (st, projController) {
    projController.projects.createProject = () => st.fail('Projects.createProject should not have been called');
    var result = new Result();

    await projController.createProject(result, {}, {
      id: '?? !123',
      name: 'Example',
      iconUrl: 'https://www.example.com/icon.png'
    });

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for invalid icon URL', async function (st, projController) {
    projController.projects.createProject = () => st.fail('Projects.createProject should not have been called');
    var result = new Result();

    await projController.createProject(result, {}, {
      id: 'TEST',
      name: 'Example',
      iconUrl: 'Clearly not a URL'
    });

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 409 for duplicate ID', async function (st, projController) {
    projController.projects.createProject = async () => false;

    var result = new Result();

    await projController.createProject(result, {}, {
      id: 'TEST',
      name: 'Test Project',
      iconUrl: 'https://www.example.com/icon.png'
    });

    st.equals(result.changes.status, 409);
    // No delay, which is fine
  });
});
