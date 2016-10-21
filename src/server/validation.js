import loggers from 'server/loggers';

export function validation(logger) {

  var validationMethods = {};

  function getCallingMethod () {
    return new Error().stack.split('\n')[3].trim();
  }

  function Validator(value) {
    this.value = value;

    function equalToNaN(x) { return x !== x; }

    this.type = typeof value;
    this.isDefined = this.value !== null && this.value !== undefined && !equalToNaN(this.value);
    this.valid = this.isDefined;
  }

  Validator.prototype.isValid = function () {
    if (!this.isDefined && !this.valid && logger) {
      logger.warn('Undefined value ' + getCallingMethod());
    }
    return this.valid;
  };

  Validator.prototype.optional = function () {
    if (!this.isDefined) { this.valid = true; }
    return this;
  };

  validationMethods.isString = function () {
    return this.type === 'string';
  };

  validationMethods.isURL = function () {
    return /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/gi.test(this.value);
  };

  validationMethods.isBase64 = function () {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(this.value);
  };

  validationMethods.isHex = function () {
    return /^([0-9A-Fa-f]{2})+$/.test(this.value);
  };

  validationMethods.isProbablyEmail = function () {
    // RFC 5322 Official Standard
    // http://emailregex.com/
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(this.value);
  };

  validationMethods.isNumber = function () {
    return this.type === 'number';
  };

  validationMethods.isBoolean = function () {
    return this.type === 'boolean';
  };

  validationMethods.isObject = function () {
    return this.type === 'object';
  };

  validationMethods.isArray = function () {
    return this.value instanceof Array;
  };

  validationMethods.minLength = function (length) {
    return (
      typeof this.value.length === 'number' &&
      this.value.length >= length
    );
  };

  validationMethods.maxLength = function (length) {
    return (
      typeof this.value.length === 'number' &&
      this.value.length <= length
    );
  };

  validationMethods.min = function (x) {
    return (
      this.type === 'number' &&
      this.value >= x
    );
  };

  validationMethods.max = function (x) {
    return (
      this.type === 'number' &&
      this.value <= x
    );
  };

  validationMethods.matches = function (regex) {
    return (
      this.type === 'string' &&
      this.value.match(regex) !== null
    );
  };

  validationMethods.hasKey = function (key) {
    return (
      this.type == 'object' &&
      key in this.value
    );
  };

  validationMethods.isKeyInObject = function (object) {
    return this.value in object;
  };

  validationMethods.isValueInObject = function (object) {
    for (var key in object) {
      if (object[key] === this.value) {
        return true;
      }
    }

    return false;
  };

  validationMethods.findIn = function (object, func) {
    for (var key in object) {
      if (func(this.value, object[key])) {
        return true;
      }
    }

    return false;
  };

  for (var methodName in validationMethods) {
    Validator.prototype[methodName] = (function (test, testName) {

      return function () {
        if (this.valid && this.isDefined) {
          this.valid = test.apply(this, arguments);

          if (!this.valid && logger) {
            logger.warn(testName + '(' + Array.prototype.slice.call(arguments).join(', ') + ') validation failed for "' + this.value + '" ' + getCallingMethod());
          }
        }

        return this;
      };

    })(validationMethods[methodName], methodName);
  }

  var validation = {};

  validation.check = function (value) {
    return new Validator(value);
  };

  validation.methods = validationMethods;

  return validation;
};

export default validation().check;
