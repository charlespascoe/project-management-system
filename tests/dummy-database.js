import { Database } from 'server/database/database';
import config from 'tests/config';
import loggers from 'tests/dummy-loggers';
import afs from 'tests/afs';
import { exec } from 'child_process';

function execute(command) {
  return new Promise((fulfill, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) return reject(err);
      fulfill();
    });
  });
}

export class DummyDatabase {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  init() {
    this.database = new Database(this.config, this.logger);
  }

  async reset() {
    await execute(`cat '${__dirname}/create-database.sql' | mysql -u '${this.config.user}' --password='${this.config.password}'`);
    await execute(`cat '${__dirname}/test-data.sql' | mysql -u '${this.config.user}' --password='${this.config.password}' proj_mgr`);
  }

  query(query, data) {
    return this.database.query(query, data);
  }

  queryForOne(query, data) {
    return this.database.queryForOne(query, data);
  }

  transaction() {
    return this.database.transaction();
  }

  async end() {
    await this.database.end();
  }
}

export default new DummyDatabase(config.db, loggers.db);
