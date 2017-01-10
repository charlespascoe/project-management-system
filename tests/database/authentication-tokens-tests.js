import { AuthenticationTokens } from 'server/database/authentication-tokens';
import AuthenticationTokenPair from 'server/models/authentication-token-pair';
import TestFrame from 'tests/test-frame';
import dummyDatabase from 'tests/dummy-database';

const authTokens = new AuthenticationTokens(dummyDatabase);

const tests = new TestFrame('AuthenticationTokens');
tests.createInstance = () => authTokens;

tests.before = async () => {
  dummyDatabase.init();
  await dummyDatabase.reset();
};

tests.after = async (st) => {
  await dummyDatabase.end();
  st.end();
};

tests.testMethod('getAuthTokenPairById', function (t) {
  t.test('It should return null for a non-existent token pair ID', async function (st, authTokens) {
    var authTokenPair = await authTokens.getAuthTokenPairById(1000);
    st.equals(authTokenPair, null);
  });

  t.test('It should return the authentication token pair for a real ID', async function (st, authTokens) {
    var authTokenPair = await authTokens.getAuthTokenPairById(1);
    st.equals(authTokenPair.id, 1);
    st.equals(authTokenPair.userId, 1);
    st.equals(authTokenPair.accessTokenHash, '8d70d691c822d55638b6e7fd54cd94170c87d19eb1f628b757506ede5688d297');
    st.equals(authTokenPair.refreshTokenHash, 'aafa373bf008a855815ecb37d8bd52f6a8157cb5833c58edde6d530dbcf3f25d');
  });
});

tests.testMethod('addTokenPair', function (t) {
  t.test('It should return an AuthenticationTokenPair after adding a token pair', async function (st, authTokens) {
    var authTokenPair = await authTokens.addTokenPair({
      userId: 1,
      accessTokenHash: '8d70d691c822d55638b6e7fd54cd94170c87d19eb1f628b757506ede5688d297',
      refreshTokenHash: 'aafa373bf008a855815ecb37d8bd52f6a8157cb5833c58edde6d530dbcf3f25d'
    });

    st.ok(authTokenPair instanceof AuthenticationTokenPair);
    st.equals(authTokenPair.id, 2);
    st.equals(authTokenPair.userId, 1);
    st.equals(authTokenPair.accessTokenHash, '8d70d691c822d55638b6e7fd54cd94170c87d19eb1f628b757506ede5688d297');
    st.equals(authTokenPair.refreshTokenHash, 'aafa373bf008a855815ecb37d8bd52f6a8157cb5833c58edde6d530dbcf3f25d');
  });
});
