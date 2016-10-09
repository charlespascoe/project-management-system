export default class Utils {
  static readonlyProperty(obj, name, value) {
    Object.defineProperty(obj, name, {value: value});
  }

  static defaults(defaults, additional) {
    return Object.assign(Utils.copy(defaults), additional);
  }

  static copy(obj) {
    return Object.assign({}, obj);
  }

  static promisify(obj) {
    // If noPromise defined, assume already promisified
    if (obj.noPromise) return;

    obj.noPromise = {};

    for (var memberName in obj) {
      if (typeof obj[memberName] != 'function') continue;

      (function (funcName) {
        var prevFunc = obj[funcName];

        obj.noPromise = prevFunc;

        obj[funcName] = function (...args) {
          return new Promise(function (fulfill, reject) {
            args.push(function (err, result) {
              if (err) return reject(err);
              fulfill(result);
            });

            prevFunc.apply(obj, args);
          });
        };
      })(memberName);
    }

    return obj;
  }
}
