import { SuccessStatus } from 'client/apis/statuses';

export default class Response {
  get isOk() { return this.status instanceof SuccessStatus }

  constructor(status, data) {
    this.status = status;
    this.data = data;
  }
}
