import fs from 'fs';

const CONFIG_PATH = process.env['CONFIG_PATH'] || __dirname + '/configuration.json';

var configuration;

try {
  configuration = JSON.parse(fs.readFileSync(CONFIG_PATH));
} catch (e) {
  console.error(e);
  console.log(`Configuration file (${CONFIG_PATH}) not accessible or not valid JSON - using defaults`);
  configuration = {};
}

// Database
if (!configuration.db) {
  configuration.db = {
    connectionLimit: 10,
    host: 'localhost',
    database: 'prog_mgr'
  };
}

// Logging
if (!configuration.logging) {
  configuration.logging = {
    level: 'INFO',
    src: false
  };

}

configuration.logging.logOutputDir = process.env['LOG_DIR'] || configuration.logging.logOutputDir;

// Production mode
if (typeof configuration.production != 'boolean') {
  configuration.production = (process.env['NODE_ENV'] == 'production');
}

export default configuration;
