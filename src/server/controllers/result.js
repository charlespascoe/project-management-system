import Cookie from 'server/controllers/cookie';

export default class Result {
  constructor(statusCode = 200) {
    this.statusCode = statusCode;
    this.actions = [];
    this.cookies = [];
    this.clearCookes = [];
    this.timeout = Result.defaultTimeout;
    this.startedAt = Date.now();
    this.changes = {
      cookies: [],
      clearCookies: []
    };
  }

  status(code) {
    this.changes.status = code;
    this.actions.push((res, next) => {
      res.status(code);
      next();
    });
    return this;
  }

  cookie(cookie) {
    if (typeof cookie == 'string') {
      var c = new Cookie(cookie);
      this.changes.cookies.push(c);
      this.actions.push((res, next) => {
        c.apply(res);
        next();
      });
      return c;
    } else {
      this.changes.cookies.push(cookie);
      this.actions.push((res, next) => {
        cookie.apply(res);
        next();
      });
      return this;
    }
  }

  clearCookie(cookieName) {
    this.changes.clearCookies.push(cookieName);

    this.actions.push((res, next) => {
      res.clearCookie(cookieName);
      next();
    });

    return this;
  }

  data(data) {
    this.changes.data = data;
    this.changes.status = this.changes.status || 200;

    this.actions.push((res, next) => {
      res.json(data);
      next();
    });
    return this;
  }

  delay(timeout) {
    timeout = timeout || this.timeout;

    this.changes.delay = timeout;

    this.actions.push(function (res, next) {
      var delay = (this.startedAt + timeout) - Date.now();
      if (delay <= 0) {
        next();
        return;
      }
      setTimeout(next, delay);
    }.bind(this));

    return this;
  }

  redirect(url) {
    this.changes.status = 302;
    this.changes.redirect = url;

    this.actions.push(function (res, next) {
      res.redirect(url);
      next();
    });
    return this;
  }

  render(page) {
    this.changes.render = page;

    this.actions.push(function (res, next) {
      res.render(page);
      next();
    });
    return this;
  }

  apply(res) {
    return new Promise(function (fulfill, reject) {
      var i = 0;

      var next = function () {
        if (i >= this.actions.length) {
          fulfill();
          return;
        }

        this.actions[i++](res, next);
      }.bind(this);

      next();
    }.bind(this));
  }
}

Result.defaultTimeout = 1000;
