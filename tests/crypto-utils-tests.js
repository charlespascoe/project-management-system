import CryptoUtils from 'server/crypto-utils';
import TestFrame from 'tests/test-frame';

const TEST_HASH = Buffer.from('94ee059335e587e501cc4bf90613e0814f00a7b08bc7c648fd865a2af6a22cc2', 'hex'),
      HMAC_KEY = Buffer.from('secret'),
      TEST_HMAC = Buffer.from('5cf214896f9c246a3879f1460c48d5c27c606f33e8f7a99434516d5db2831065', 'hex');

const tests = new TestFrame('CryptoUtils', CryptoUtils);

tests.testMethod('randomBytes', function (t) {
  t.test('It should throw an exception for an invalid argument', async function (st) {
    try {
      await CryptoUtils.randomBytes(-10);
      st.fail('No exception thrown');
    } catch (e) {
      st.ok(true);
    }
  });

  t.test('It should return the correct number of bytes', async function (st) {
    var bytes = await CryptoUtils.randomBytes(16);
    st.equals(bytes.length, 16);
  });
});

tests.testMethod('hash', function (t) {
  t.test('It should throw an exception when given no arguments', function (st) {
    try {
      CryptoUtils.hash();
      st.fail('No exception thrown');
    } catch (e) {
      st.ok(true);
    }
  });

  t.test('It should correctly hash a single argument', function (st) {
    st.ok(CryptoUtils.hash(Buffer.from('TEST')).equals(TEST_HASH));
  });

  t.test('It should correctly hash multiple arguments', function (st) {
    st.ok(CryptoUtils.hash(Buffer.from('TE'), Buffer.from('ST')).equals(TEST_HASH));
  });
});


tests.testMethod('hmac', function (t) {
  t.test('It should throw an exception when given no data arguments', function (st) {
    try {
      CryptoUtils.hmac(HMAC_KEY);
      st.fail('No exception thrown');
    } catch (e) {
      st.ok(true);
    }
  });

  t.test('It should correctly hash a single data argument', function (st) {
    st.ok(CryptoUtils.hmac(HMAC_KEY, Buffer.from('TEST')).equals(TEST_HMAC));
  });

  t.test('It should correctly hash multiple data arguments', function (st) {
    st.ok(CryptoUtils.hmac(HMAC_KEY, Buffer.from('TE'), Buffer.from('ST')).equals(TEST_HMAC));
  });
});
