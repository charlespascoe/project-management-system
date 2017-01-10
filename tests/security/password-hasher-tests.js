import { PasswordHasher } from 'server/security/password-hasher';
import TestFrame from 'tests/test-frame';

const testSalt = Buffer.from('0123456789abcdef', 'hex'),
      testHash = '$argon2i$v=19$m=16,t=1,p=1$ASNFZ4mrze8$cDN9Es9OTiTiy+IPmusd+mzOBNtG/5S/Q5kRBbdxnJI';

const tests = new TestFrame('PasswordHasher');

tests.createInstance = function () {
  return new PasswordHasher({
    timeCost: 1,
    memoryCost: 16,
    parallelism: 1,
    hashLength: 32,
    saltLength: 16
  });
};

tests.testMethod('randomSalt', function (t) {
  t.test('It should return the correct length', async function (st) {
    var passHasher = new PasswordHasher({saltLength: 17});
    var salt = await passHasher.randomSalt();
    st.equals(salt.length, 17);
  });
});

tests.testMethod('hash', function (t) {
  t.test('It should return the expected output', async function (st, passHasher) {
    passHasher.randomSalt = () => testSalt;
    var hash = await passHasher.hash('password');
    st.equals(hash, testHash);
  });
});

tests.testMethod('verify', function (t) {
  t.test('It should correctly verify the correct password', async function (st, passHasher) {
    st.ok(await passHasher.verify('password', testHash));
  });

  t.test('It should return false for the incorrect password', async function (st, passHasher) {
    st.notOk(await passHasher.verify('pa55word', testHash));
  });
});

tests.testMethod('verifyUserPassword', function (t) {
  t.test('It should verify a user\'s password correctly', async function (st, passHasher) {
    var user = {
      passHash: testHash
    };

    st.ok(await passHasher.verifyUserPassword('password', user));
  });

  t.test('It should return false for an incorrect password', async function (st, passHasher) {
    var user = {
      passHash: testHash
    };

    st.notOk(await passHasher.verifyUserPassword('pa55word', user));
  });
});
