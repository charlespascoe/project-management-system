import bunyan from 'bunyan';
import path from 'path';
import config from 'server/config';
import Utils from 'server/utils';

var commonConfig = {
  serializers: {
    err: bunyan.stdSerializers.err,
    user: (user) => {
      if (!user) return null;
      return {
        id: user.id,
        tokId: user.requestToken && user.requestToken.id
      };
    },
    ip: (ip) => ip.match(/^::ffff:/) ? ip.substring(7) : ip,
    args: (args) => {
      if (args.result) {
        args.result = {
          statusCode: args.result.statusCode,
          cookies: args.result.cookies,
          clearCookies: args.result.clearCookies,
          timeout: args.result.timeout,
          startedAt: args.result.startedAt
        };
      }

      if (args.user) args.user = commonConfig.serializers.user(args.user);

      return args;
    }
  },
  level: config.logging.level || bunyan.INFO,
  src: config.logging.src
};

if (config.logging.logOutputDir) {
  commonConfig.streams = [{
    path: path.join(config.logging.logOutputDir, config.appName + '.log')
  }];

  if (!config.production) {
    commonConfig.streams.push({
      stream: process.stdout,
      level: 'TRACE'
    });
  }
}

const loggers = {
  main: bunyan.createLogger(Utils.defaults(commonConfig, {
    name: 'main'
  })),
  db: bunyan.createLogger(Utils.defaults(commonConfig, {
    name: 'db'
  })),
  security: bunyan.createLogger(Utils.defaults(commonConfig, {
    name: 'security'
  }))
};

export default Utils.defaults(loggers, {
  forClass: function (className) {
    var classLoggers = {};

    for (var loggerName in loggers) {
      classLoggers[loggerName] = loggers[loggerName].child({cls: className});
    }

    return classLoggers;
  }
});
