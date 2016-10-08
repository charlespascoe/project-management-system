import Utils from '../utils';

export default class Transaction {
  constructor(id, conn, dbLogger) {
    this.id = id;
    this.conn = Utils.promisify(conn);
    this.dbLogger = dbLogger.child({transactionId: this.id});
    this.dbLogger.trace('Starting transaction');
  }

  async query(statement, data = {}) {
    try {
      this.dbLogger.trace({statement: statement, data: data});

      return await this.conn.query(statement, data);
    } catch (e) {
      this.dbLogger.error({err: e, query: statement, data: data}, 'An error occurred when executing a query in a transaction');
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

  async commit() {
    try {
      this.dbLogger.trace('Committing transaction');

      await this.conn.commit();

      this.conn.release();
    } catch (e) {
      this.dbLogger.error({err: e}, 'An error occurred when committing a transaction');
      e.logged = true;
      throw e;
    }
  }

  async rollback() {
    try {
      this.dbLogger.trace('Rolling back transaction');

      await this.conn.rollback();

      this.conn.release();
    } catch (e) {
      this.dbLogger.error({err: e}, 'An error occurred when rolling back a transaction');
      e.logged = true;
      throw e;
    }
  }
}
