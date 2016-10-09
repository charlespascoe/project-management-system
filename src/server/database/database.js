import mysql from 'mysql';
import Transaction from './transaction';
import Utils from '../utils';
import config from '../config';
import loggers from '../loggers';

// This class encapsulates the callback-driven database driver with promises and extra functionality
export class Database {
  constructor(config, dbLogger) {
    config.queryFormat = function (query, values) {
      if (!values) return query;
      return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this));
    };

    config.multipleStatements = true;

    this.pool = Utils.promisify(mysql.createPool(config));

    this.dbLogger = dbLogger;
    this.nextTransactionId = 0;
  }

  async query(statement, data = {}) {
    try {
      this.dbLogger.debug({statement: statement, data: data});

      return await this.pool.query(statement, data);
    } catch (e) {
      this.dbLogger.error({err: e, query: statement, data: data}, 'An error occurred when executing a query');
      e.logged = true;
      throw e;
    }
  }

  async queryForOne(statement, data = {}) {
    var results = await this.query(statement, data);
    if (!(results instanceof Array)) return results;
    if (results.length < 1) return null;
    return result[0];
  }

  async transaction(func) {
    var connection = await this.pool.getConnection();

    Utils.promisify(connection);

    await connection.beginTransaction();

    return new Transaction(this.nextTransactionId++, connection, this.dbLogger);
  }
}

export default new Database(config.db, loggers.db);
