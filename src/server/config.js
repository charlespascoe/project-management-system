import configuration from './configuration';

// Add other things to config here e.g. default values/env variables

// Production mode
if (typeof configuration.production != 'boolean') {
  configuration.production = (process.env['NODE_ENV'] == 'production');
}

export default configuration;
