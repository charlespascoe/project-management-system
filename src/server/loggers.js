import bunyan from 'bunyan';
import config from 'server/config';
import Utils from 'server/utils';

const commonConfig = {
  serializers: { err: bunyan.stdSerializers.err },
  level: bunyan[config.logging.level] || bunyan.INFO,
  src: config.logging.src
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
