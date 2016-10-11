import RestClient from 'client/rest/rest-client';
import Response from 'client/apis/response';

import {
  defaultStatus
} from 'client/apis/statuses';

export class AuthenticationApi {
  constructor(baseUrl = '/auth') {
    this.client = new RestClient(baseUrl);
  }

  async login(username, password) {
    var restResponse = await this.client.post('/login', {
      username: username,
      password: password
    });

    return new Response(defaultStatus(restResponse.statusCode), restResponse.data);
  }

  async refreshToken(refreshToken) {
    var restResponse = await this.client.post('/refresh', {
      refreshToken: refreshToken
    });

    return new Response(defaultStatus(restResponse.statusCode), restResponse.data);
  }

}
