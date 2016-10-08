export default class Utils {
  static copy(obj) {
    return Object.assign({}, obj);
  }

  static promisify(func) {
    return function (...args) {
      return new Promise(function (fulfill, reject) {
        args.push(function (err, result) {
          if (err) return reject(err);
          fulfill(result);
        });

        func.apply(undefined, args);
      });
    }
  }
}
