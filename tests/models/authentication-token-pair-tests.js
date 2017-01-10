import TestFrame from 'tests/test-frame';
import AuthenticationTokenPair from 'server/models/authentication-token-pair';

const tests = new TestFrame('AuthenticationTokenPair');
tests.createInstance = () => null;

tests.testSet('Authenticator.parseBase64Token', [
  {
    name: 'It should return null on non-base64 input',
    args: ['**&*&*&@@~///'],
    expected: null
  },
  {
    name: 'It should return null for invalid user ID',
    args: [Buffer.from('asdf:00112233').toString('base64')],
    expected: null
  },
  {
    name: 'It should return null for invalid hex token',
    args: [Buffer.from('1234:XXXXXXX').toString('base64')],
    expected: null
  },
  {
    name: 'It should return the expected object for correct input',
    args: [Buffer.from('1234:aabbccdd').toString('base64')],
    expected: {userId: 1234, token: Buffer.from('aabbccdd', 'hex')}
  }
], function (st, args, expected) {
  var result = AuthenticationTokenPair.parseBase64Token(...args);
  st.deepEquals(result, expected);
});
