import test from 'tape';

class MethodTest {
  constructor(name, test, createInstance) {
    this.name = name;
    this.createInstance = createInstance;
    this.tapeTest = test;
  }

  async before(st) {
    // Do nothing
  }

  async after(st) {
    st.end();
  }

  test(testName, cb) {
    var instance = this.createInstance();

    this.tapeTest.test('> ' + testName, async (st) => {
      await this.before(st);

      try {
        await cb(st, instance);
      } catch (ex) {
        st.fail('Unexpected exception: ' + ex.toString());
        st.end();
        return;
      }

      await this.after(st);
    });
  }
}

export default class TestFrame {
  constructor(className, classUnderTest) {
    this.className = className;
    this.classUnderTest = classUnderTest;
  }

  async before(st) {
    // Do nothing by default
  }

  async after(st) {
    st.end();
  }

  createInstance() {
    return new this.classUnderTest();
  }

  testMethod(methodName, cb) {
    test(`${this.className}.${methodName}`, function (t) {
      var methodTest = new MethodTest(methodName, t, this.createInstance.bind(this));
      methodTest.before = this.before;
      methodTest.after = this.after;
      cb(methodTest);
    }.bind(this));
  }

  testSet(testName, data, cb) {
    test(testName, (t) => {
      data.forEach((item) => {
        t.test('> ' + item.name, async (st) => {
          await this.before(st);

          try {
            await cb(st, item.args, item.expected, this.createInstance());
          } catch (ex) {
            st.fail('Unexpected exception: ' + ex.toString());
            st.end();
            return;
          }

          await this.after(st);
        });
      });
    });
  }
}
