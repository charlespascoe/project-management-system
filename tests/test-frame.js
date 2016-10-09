import test from 'tape';

class MethodTest {
  constructor(name, test, createInstance) {
    this.name = name;
    this.createInstance = createInstance;
    this.tapeTest = test;
  }

  test(testName, cb) {
    var instance = this.createInstance();

    this.tapeTest.test('> ' + testName, (st) => cb(st, instance));
  }
}

export default class TestFrame {
  constructor(className, classUnderTest) {
    this.className = className;
    this.classUnderTest = classUnderTest;
  }

  createInstance() {
    return new this.classUnderTest();
  }

  testMethod(methodName, cb) {
    test(`${this.className}.${methodName}`, function (t) {
      cb(new MethodTest(methodName, t, this.createInstance.bind(this)));
    }.bind(this));
  }

  testSet(testName, data, cb) {
    test(testName, function (t) {
      data.forEach(function (item) {
        t.test('> ' + item.name, function(st) {
          cb(st, item.args, item.expected, this.createInstance());
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
}
