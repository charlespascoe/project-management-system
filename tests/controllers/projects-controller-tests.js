import catchAsync from 'server/catch-async';
import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { ProjectsController } from 'server/controllers/projects-controller';
import dummyLoggers from 'tests/dummy-loggers';

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});


const tests = new TestFrame('AuthenticationController');
tests.createInstance = function () {
  var projects = {
    createProjectResult: false,
    createProject: async () => {
      return projects.createProjectResult;
    }
  };

  return new ProjectsController(dummyLoggers, projects);
};

tests.testMethod('createProject', function (t) {
  t.test('It should return 400 for invalid project name', catchHandler(async function (st, projController) {
    projController.projects.createProject = () => st.fail('Projects.createProject should not have been called');
    var result = await projController.createProject(new Result(), {}, {
      id: 'ABC',
      name: 'a'.repeat(1000)
    });
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 400 for invalid project ID', catchHandler(async function (st, projController) {
    projController.projects.createProject = () => st.fail('Projects.createProject should not have been called');
    var result = await projController.createProject(new Result(), {}, {
      id: '?? !123',
      name: 'Example'
    });
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 409 for duplicate ID', catchHandler(async function (st, projController) {
    projController.projects.createProjectResult = true;

    var result = await projController.createProject(new Result(), {}, {
      id: 'TEST',
      name: 'Test Project'
    });
    st.equals(result.changes.status, 409);
    // No delay, which is fine
    st.end();
  }));
});
