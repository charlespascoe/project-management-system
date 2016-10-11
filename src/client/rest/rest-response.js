export default class RestResponse {
  get isOk() { return this.statusCode >= 200 && this.statusCode < 300; }

  constructor(statusCode, data = null) {
    this.statusCode = statusCode;
    this.data = data;
  }
}
