import bunyan from 'bunyan';
import config from './config';

export default {
  db: bunyan.createLogger({
    name: 'db',
    serializers: { err: bunyan.stdSerializers.err },
    level: bunyan[config.logging.level] || bunyan.INFO,
    src: config.logging.src
  })
};
