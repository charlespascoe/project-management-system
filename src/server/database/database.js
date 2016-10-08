import mysql from 'mysql';
import Transaction from './transaction';
import Utils from '../utils';

// This class encapsulates the callback-driven database driver with promises and extra functionality
export class Database {
  constructor(config) {
    this.pool = mysql.createPool(config);
  }

  query(statement, data = {}) {
    return Utils.promisify(this.pool.query)(statement, data);
  }

  async queryForOne(statement, data = {}) {
    var results = await this.query(statement, data);
    if (results.length < 1) return null;
    return result[0];
  }

  async transaction(func) {
    var connection = await Utils.promisify(this.pool.getConnection)();

    await Utils.promisify(connection.beginTransaction)();

    return new Transaction(connection);
  }
}
