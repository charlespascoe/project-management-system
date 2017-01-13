export default function anithammering(options = {}) {
  const ips = {};

  var {
    cooldown = 60000,
    blockAttempts = 100,
    handler = (res) => res.status(403).end()
  } = options;

  setInterval(() => {
    for (var ip in ips) {
      if (--ips[ip] <= 0) {
        delete ips[ip];
      }
    }
  }, Math.max(cooldown, 1000));

  return function middleware(req, res, next) {
    var hitCount = ips[req.ip];

    if (hitCount >= blockAttempts) {
      ips[req.ip]++;
      handler(res);
      return;
    }

    req.hit = () => {
      if (req.ip in ips) {
        ips[req.ip]++;
      } else {
        ips[req.ip] = 1;
      }
    };

    next();
  };
}
