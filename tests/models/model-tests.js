import Model from 'server/models/model';
import Project from 'server/models/project';
import TestFrame from 'tests/test-frame';
import testingDatabase from 'tests/testing-database';

const tests = new TestFrame('Model');
tests.createInstance = () => {
  // Parameters:
  //  database: Database object
  //  tableName: This entity's table name
  //  data: An object that represents the data - keys are column names, values are field values
  //  schema: A Schema object for mapping columns onto class properties
  return new Model(testingDatabase, 'project', {
    project_id: 'EXAMPLE',
    project_name: 'Example Project',
    icon_url: 'https://www.example.com/icon.png'
  }, Project.schema);
};

tests.before = async () => {
  testingDatabase.init();
  await testingDatabase.reset();
};

tests.after = async (st) => {
  await testingDatabase.end();
  st.end();
};


tests.testMethod('save', function (t) {
  t.test('It should update the fields when the properties are changed', async function (st, model) {
    var newName = 'A brand new project name!';

    var result = await testingDatabase.queryForOne('SELECT `project_name` FROM `project` WHERE `project_id` = :projectId;', {projectId: 'EXAMPLE'});

    st.equals(result.project_name, 'Example Project');

    model.name = newName;

    await model.save();

    result = await testingDatabase.queryForOne('SELECT `project_name` FROM `project` WHERE `project_id` = :projectId;', {projectId: 'EXAMPLE'});

    st.equals(result.project_name, newName);
  });
});

tests.testMethod('delete', function (t) {
  t.test('It should remove the entity from the table', async function (st, model) {
    var result = await testingDatabase.queryForOne('SELECT `project_name` FROM `project` WHERE `project_id` = :projectId;', {projectId: 'EXAMPLE'});

    st.notEqual(result, null);

    await model.delete();

    result = await testingDatabase.queryForOne('SELECT `project_name` FROM `project` WHERE `project_id` = :projectId;', {projectId: 'EXAMPLE'});

    st.equals(result, null);
  });
});
