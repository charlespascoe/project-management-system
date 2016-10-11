import RestResponse from 'client/rest/rest-response';
import Utils from 'client/utils';

export default class RestClient {
  constructor(baseUrl, headers = {}) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async makeRequest(method, url, data = null) {
    var fullUrl = this.baseUrl + url;

    try {
      var response = await fetch(fullUrl, {
        method: method,
        headers: Utils.defaults({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, this.headers),
        body: JSON.stringify(data)
      });

      var json = await response.json();

      return new RestResponse(response.status, JSON.parse(json));
    } catch (e) {
      // Handle exception

      return new RestResponse(-1, null);
    }
  }

  get(url) {
    return this.makeRequest('GET', url);
  }

  post(url, data) {
    return this.makeRequest('POST', url, data);
  }

  put(url, data) {
    return this.makeRequest('PUT', url, data);
  }

  delete(url) {
    return this.makeRequest('DELETE', url);
  }
}
