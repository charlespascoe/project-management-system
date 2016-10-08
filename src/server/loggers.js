import bunyan from 'bunyan';

export default {
  db: bunyan.createLogger({
    name: 'db',
    serializers: { err: bunyan.stdSerializers.err }
  })
};
