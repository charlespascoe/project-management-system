import Utils from '../utils';

export default class Transaction {
  constructor(conn, releaseAfterTransaction = true) {
    this.conn = conn;
    this.releaseAfterTransaction = releaseAfterTransaction;
  }

  query(statment, data = {}) {
    return Utils.promisify(this.conn.query)(statement, data);
  }

  async queryForOne(statement, data = {}) {
    var results = await this.query(statement, data);
    if (results.length < 1) return null;
    return result[0];
  }

  async commit() {
    await Utils.promisify(this.conn.commit)();

    if (this.releaseAfterTransaction) this.release();
  }

  async rollback() {
    await Utils.promisify(this.conn.rollback)();

    if (this.releaseAfterTransaction) this.release();
  }

  release() {
    this.conn.release();
  }
}
