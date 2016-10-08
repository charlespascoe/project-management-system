import configuration from './configuration';
import bunyan from 'bunyan';
import loggers from './loggers';

// Add other things to config here e.g. default values/env variables

// Production mode
if (typeof configuration.production != 'boolean') {
  configuration.production = (process.env['NODE_ENV'] == 'production');
}

// Configure logging
if (configuration.logging) {
  for (var logger in loggers) {
    loggers[logger].level(bunyan[configuration.logging.level] || bunyan.INFO);
  }
}

export default configuration;
