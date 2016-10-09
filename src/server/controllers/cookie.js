export default class Cookie {
  constructor(name = '', value = '', options = {}) {
    this.cookieName = name;
    this.cookieValue = value;

    var opts = {};

    for (var key in Cookie.defaultOptions) {
      opts[key] = Cookie.defaultOptions[key];
    }

    for (var key in options) {
      opts[key] = options[key];
    }

    this.cookieOptions = opts;
  }

  name(name) {
    this.cookieName = name;
    return this;
  }

  value(value) {
    this.cookieValue = value;
    return this;
  }

  options(options) {
    this.cookieOptions = options;
    return;
  }

  expires(date) {
    this.cookieOptions.expires = date;
    return this;
  }

  apply(res) {
    res.cookie(
      this.cookieName,
      this.cookieValue,
      this.cookieOptions
    );
  }
}

Cookie.defaultOptions = {
  secure: true,
  httpOnly: true,
  sameSite: true
};
