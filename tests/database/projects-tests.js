import { Projects } from 'server/database/projects';
import TestFrame from 'tests/test-frame';
import dummyDatabase from 'tests/dummy-database';

const projects = new Projects(dummyDatabase);

const tests = new TestFrame('Projects');
tests.createInstance = () => projects;

tests.before = async () => {
  dummyDatabase.init();
  await dummyDatabase.reset();
};

tests.after = async (st) => {
  await dummyDatabase.end();
  st.end();
};

tests.testMethod('getAllProjects', function (t) {
  t.test('It should return all projects', async function (st, projects) {
    var projs = await projects.getAllProjects();

    st.equals(projs.length, 1);
    st.equals(projs[0].id, 'EXAMPLE');
    st.equals(projs[0].name, 'Example Project');
    st.equals(projs[0].iconUrl, 'https://www.example.com/icon.png');
  });
});

tests.testMethod('getProject', function (t) {
  t.test('It should return null for non-existent project ID', async function (st, projects) {
    var project = await projects.getProject('FAKEID');
    st.equals(project, null);
  });

  t.test('It should return the project for a real project ID', async function (st, projects) {
    var project = await projects.getProject('EXAMPLE');
    st.equals(project.id, 'EXAMPLE');
    st.equals(project.name, 'Example Project');
    st.equals(project.iconUrl, 'https://www.example.com/icon.png');
  });
});

tests.testMethod('createProject', function (t) {
  t.test('It should return true for a duplicate project ID', async function (st, projects) {
    var success = await projects.createProject({
      id: 'EXAMPLE',
      name: 'Existing Project',
      iconUrl: 'https://www.example.com/icon.png'
    });

    st.equals(success, false);
  });

  t.test('It should return false after successfully creating a project', async function (st, projects) {
    var success = await projects.createProject({
      id: 'NEWID',
      name: 'New Project',
      iconUrl: 'https://www.example.com/icon.png'
    });

    st.equals(success, true);
  });
});
