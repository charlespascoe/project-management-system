import test from 'tape';
import { PasswordHasher } from 'server/logic/password-hasher';
import catchAsync from 'server/catch-async';
import TestFrame from 'test-frame';

const testSalt = Buffer.from('0123456789abcdef', 'hex'),
      testHash = '$argon2i$v=19$m=16384,t=32,p=1$ASNFZ4mrze8$pRRO6aqIjWtaF4dYF3QUBk+pEGDA4LdifM4jTyOj55o';


const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

const tests = new TestFrame('PasswordHasher', PasswordHasher);

tests.testMethod('randomSalt', function (t) {
  t.test('It should return the correct length', catchHandler(async function (st) {
    var passHasher = new PasswordHasher({saltLength: 17});
    var salt = await passHasher.randomSalt();
    st.equals(salt.length, 17);
    st.end();
  }));
});

tests.testMethod('hash', function (t) {
  t.test('It should return the expected output', catchHandler(async function (st, passHasher) {
    passHasher.randomSalt = () => testSalt;
    var hash = await passHasher.hash('password');
    st.equals(hash, testHash);
    st.end();
  }));
});

tests.testMethod('verify', function (t) {
  t.test('It should correctly verify the correct password', catchHandler(async function (st, passHasher) {
    st.ok(await passHasher.verify('password', testHash));
    st.end();
  }));

  t.test('It should return false for the incorrect password', catchHandler(async function (st, passHasher) {
    st.notOk(await passHasher.verify('pa55word', testHash));
    st.end();
  }));
});

tests.testMethod('verifyUserPassword', function (t) {
  t.test('It should verify a user\'s password correctly', catchHandler(async function (st, passHasher) {
    var user = {
      passHash: testHash
    };

    st.ok(await passHasher.verifyUserPassword('password', user));
    st.end();
  }));

  t.test('It should return false for an incorrect password', catchHandler(async function (st, passHasher) {
    var user = {
      passHash: testHash
    };

    st.notOk(await passHasher.verifyUserPassword('pa55word', user));
    st.end();
  }));
});
