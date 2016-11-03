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

export default {
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
