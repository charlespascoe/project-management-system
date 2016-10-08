import bunyan from 'bunyan';
import config from './config';
import Utils from './utils';

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
  }))
};
